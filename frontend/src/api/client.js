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
        }
      } catch (error) {
        // Error parsing auth storage - silently fail, request will fail anyway
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

    // Skip if this is a refresh token request to avoid infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // Handle 403 errors (Forbidden - no permission but authenticated)
    // Don't logout, just reject the error so component can handle it
    if (error.response?.status === 403) {
      return Promise.reject(error)
    }

    // Handle 400 errors (Validation errors) - don't logout, don't refresh token
    if (error.response?.status === 400) {
      return Promise.reject(error)
    }

    // Handle 500 errors - don't try to refresh token, don't logout
    if (error.response?.status === 500) {
      return Promise.reject(error)
    }

    // Handle 401 errors (token expired/invalid)
    // Chỉ xử lý refresh token cho 401 errors, không phải 400/403/500
    if (error.response?.status === 401 && !originalRequest._retry) {
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
              
              return newAccessToken
            } else {
              // Refresh endpoint returned error (401 or other)
              const errorMessage = response.data?.message || 'Refresh token response invalid'
              const error = new Error(errorMessage)
              error.response = response
              throw error
            }
          } catch (refreshError) {
            // Only logout if refresh token is invalid (401) or missing
            // Don't logout on network errors or 500 errors
            const shouldLogout = (refreshError.response?.status === 401) || 
                                (refreshError.message === 'No refresh token available') ||
                                (refreshError.message === 'No auth storage found')
            
            if (shouldLogout) {
              localStorage.removeItem('auth-storage')
              // Use setTimeout to avoid navigation during render
              setTimeout(() => {
                window.location.href = '/login'
              }, 100)
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
          return Promise.reject(retryError)
        }
      } catch (refreshError) {
        // Process queue with error
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Don't throw refresh error directly, return original error instead
        // This prevents logout on network errors during refresh
        // But if refresh token is truly invalid, logout will happen in the catch block above
        return Promise.reject(error)
      }
    }

    // For other errors (404, etc.), just reject
    return Promise.reject(error)
  }
)

export default apiClient
