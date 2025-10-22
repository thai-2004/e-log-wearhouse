import apiClient from '@api/client'
import { API_ENDPOINTS } from '@config'

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE)
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, userData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
    return response.data
  },
}

export default apiClient