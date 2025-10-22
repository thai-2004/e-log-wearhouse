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
          console.log('API Client: Token added to request:', token.substring(0, 20) + '...')
        } else {
          console.log('API Client: No token found in auth storage')
        }
      } catch (error) {
        console.error('API Client: Error parsing auth storage:', error)
      }
    } else {
      console.log('API Client: No auth storage found')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          const refreshToken = parsed?.state?.refreshToken
          
          if (refreshToken) {
            console.log('API Client: Attempting token refresh...')
            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken
            })

            if (response.data.success) {
              // Update stored tokens
              const newAuthData = {
                ...parsed,
                state: {
                  ...parsed.state,
                  token: response.data.data.accessToken,
                  refreshToken: response.data.data.refreshToken
                }
              }
              localStorage.setItem('auth-storage', JSON.stringify(newAuthData))
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
              return apiClient(originalRequest)
            }
          }
        }
      } catch (refreshError) {
        console.error('API Client: Token refresh failed:', refreshError)
        // Redirect to login if refresh fails
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
