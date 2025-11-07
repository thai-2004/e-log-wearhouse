import axios from 'axios'
import { API_CONFIG } from '@config'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token from Zustand store
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand store via localStorage
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          
          // Log chi tiết cho inventory requests
          if (config.url?.includes('/inventory') && config.method === 'post') {
            console.log('✅ API Client: Token added to CREATE INVENTORY request')
            console.log('✅ API Client: Token preview:', token.substring(0, 20) + '...')
            console.log('✅ API Client: Full Authorization header:', `Bearer ${token.substring(0, 20)}...`)
            console.log('✅ API Client: Request URL:', config.url)
            console.log('✅ API Client: Request data:', config.data)
          } else {
            console.log('API Client: Token added to request:', token.substring(0, 20) + '...')
          }
        } else {
          console.warn('⚠️ API Client: No token found in auth storage')
          if (config.url?.includes('/inventory') && config.method === 'post') {
            console.error('❌ API Client: CREATE INVENTORY request will fail - no token!')
          }
        }
      } catch (error) {
        console.error('❌ API Client: Error parsing auth storage:', error)
        if (config.url?.includes('/inventory') && config.method === 'post') {
          console.error('❌ API Client: CREATE INVENTORY request will fail - parse error!')
        }
      }
    } else {
      console.warn('⚠️ API Client: No auth storage found')
      if (config.url?.includes('/inventory') && config.method === 'post') {
        console.error('❌ API Client: CREATE INVENTORY request will fail - no auth storage!')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
let isRefreshing = false
let failedQueue = []
let refreshTokenPromise = null

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log chi tiết cho inventory requests
    if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
      console.log('🔍 [API Client] Response error for CREATE INVENTORY:')
      console.log('🔍 [API Client] Status:', error.response?.status)
      console.log('🔍 [API Client] Error message:', error.message)
      console.log('🔍 [API Client] Response data:', error.response?.data)
    }

    // Skip if this is a refresh token request to avoid infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.log('API Client: Skipping refresh token request error handling')
      return Promise.reject(error)
    }

    // Handle 403 errors (Forbidden - no permission but authenticated)
    // Don't logout, just reject the error so component can handle it
    if (error.response?.status === 403) {
      console.log('API Client: 403 Forbidden - User authenticated but lacks permission')
      if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
        console.log('⚠️ [API Client] CREATE INVENTORY: 403 Forbidden - Không đủ quyền')
      }
      return Promise.reject(error)
    }

    // Handle 400 errors (Validation errors) - don't logout, don't refresh token
    if (error.response?.status === 400) {
      console.log('API Client: 400 Bad Request - Validation error or bad request')
      if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
        console.log('⚠️ [API Client] CREATE INVENTORY: 400 Bad Request - Lỗi validation hoặc dữ liệu không hợp lệ')
        console.log('⚠️ [API Client] Error details:', error.response?.data)
      }
      return Promise.reject(error)
    }

    // Handle 500 errors - don't try to refresh token, don't logout
    if (error.response?.status === 500) {
      console.error('API Client: 500 Server Error - Server error, không phải lỗi token')
      if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
        console.error('❌ [API Client] CREATE INVENTORY: 500 Server Error - Lỗi server')
      }
      return Promise.reject(error)
    }

    // Handle 401 errors (token expired/invalid)
    // Chỉ xử lý refresh token cho 401 errors, không phải 400/403/500
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
        console.log('⚠️ [API Client] CREATE INVENTORY: 401 Unauthorized - Token có thể hết hạn hoặc không hợp lệ')
        console.log('⚠️ [API Client] Sẽ thử refresh token...')
      }
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            }, 
            reject 
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      // Create refresh token promise if it doesn't exist
      if (!refreshTokenPromise) {
        refreshTokenPromise = (async () => {
          try {
            // Try to refresh token
            const authStorage = localStorage.getItem('auth-storage')
            if (!authStorage) {
              throw new Error('No auth storage found')
            }

            const parsed = JSON.parse(authStorage)
            const refreshToken = parsed?.state?.refreshToken
            
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            console.log('API Client: Attempting token refresh...')
            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken
            }, {
              // Don't use apiClient to avoid interceptor loop
              timeout: API_CONFIG.TIMEOUT,
              validateStatus: (status) => status < 500 // Don't throw on 4xx errors
            })

            // Check if refresh was successful
            if (response.status === 200 && response.data && (response.data.success || response.data.data?.accessToken)) {
              const newAccessToken = response.data.data?.accessToken || response.data.accessToken
              const newRefreshToken = response.data.data?.refreshToken || response.data.refreshToken

              // Update stored tokens
              const newAuthData = {
                ...parsed,
                state: {
                  ...parsed.state,
                  token: newAccessToken,
                  refreshToken: newRefreshToken || refreshToken // Keep old refresh token if new one not provided
                }
              }
              localStorage.setItem('auth-storage', JSON.stringify(newAuthData))
              
              console.log('API Client: Token refreshed successfully')
              return newAccessToken
            } else {
              // Refresh endpoint returned error (401 or other)
              const errorMessage = response.data?.message || 'Refresh token response invalid'
              const error = new Error(errorMessage)
              error.response = response
              throw error
            }
          } catch (refreshError) {
            console.error('API Client: Token refresh failed:', refreshError)
            
            if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
              console.error('❌ [API Client] CREATE INVENTORY: Token refresh thất bại')
              console.error('❌ [API Client] Refresh error:', refreshError.message)
              console.error('❌ [API Client] Refresh error status:', refreshError.response?.status)
            }
            
            // Only logout if refresh token is invalid (401) or missing
            // Don't logout on network errors or 500 errors
            const shouldLogout = (refreshError.response?.status === 401) || 
                                (refreshError.message === 'No refresh token available') ||
                                (refreshError.message === 'No auth storage found')
            
            if (shouldLogout) {
              console.log('⚠️ API Client: Logging out due to invalid refresh token')
              if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
                console.error('❌ [API Client] CREATE INVENTORY: Sẽ logout do refresh token không hợp lệ')
              }
              localStorage.removeItem('auth-storage')
              // Use setTimeout to avoid navigation during render
              setTimeout(() => {
                window.location.href = '/login'
              }, 100)
            } else {
              // Don't logout on network errors or other errors
              console.log('⚠️ API Client: Refresh token failed but NOT logging out (network error or other)')
              if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
                console.log('⚠️ [API Client] CREATE INVENTORY: Không logout - lỗi network hoặc lỗi khác')
              }
            }
            
            throw refreshError
          } finally {
            refreshTokenPromise = null
          }
        })()
      }

      try {
        const newToken = await refreshTokenPromise
        
        // Process queued requests with new token
        processQueue(null, newToken)
        isRefreshing = false
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        originalRequest._retry = false // Reset retry flag for the retry
        
        try {
          return await apiClient(originalRequest)
        } catch (retryError) {
          // If retry still gets 401, it means the new token is also invalid
          // Don't retry again to avoid infinite loop
          if (retryError.response?.status === 401) {
            console.error('API Client: Retry with new token still returned 401')
            // Don't logout here, let the error propagate to component
          }
          return Promise.reject(retryError)
        }
      } catch (refreshError) {
        // Process queue with error
        processQueue(refreshError, null)
        isRefreshing = false
        
        if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
          console.error('❌ [API Client] CREATE INVENTORY: Refresh token thất bại, trả về lỗi gốc')
        }
        
        // Don't throw refresh error directly, return original error instead
        // This prevents logout on network errors during refresh
        // But if refresh token is truly invalid, logout will happen in the catch block above
        return Promise.reject(error)
      }
    }

    // For other errors (404, etc.), just reject
    if (originalRequest.url?.includes('/inventory') && originalRequest.method === 'post') {
      console.log('⚠️ [API Client] CREATE INVENTORY: Lỗi khác (không phải 400/401/403/500):', error.response?.status)
    }

    return Promise.reject(error)
  }
)

export default apiClient
