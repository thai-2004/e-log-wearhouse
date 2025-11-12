import { API_ENDPOINTS } from '@config'
import apiClient from '@api/client'

export const dashboardAPI = {
  // Lấy tổng quan dashboard
  getOverview: async (params = {}) => {
    const response = await apiClient.get('/dashboard', { params })
    return response.data
  },

  // Lấy thống kê dashboard
  getStats: async (timeRange = '7d') => {
    const response = await apiClient.get('/dashboard/stats', { 
      params: { timeRange } 
    })
    return response.data
  },

  // Lấy cảnh báo
  getAlerts: async () => {
    const response = await apiClient.get('/dashboard/alerts')
    return response.data
  },

  // Lấy hoạt động gần đây
  getRecentActivities: async () => {
    const response = await apiClient.get('/dashboard/activities')
    return response.data
  },

  // Lấy thống kê theo khoảng thời gian
  getTimeRangeStats: async (timeRange, startDate, endDate) => {
    const response = await apiClient.get('/dashboard/time-range', {
      params: { timeRange, startDate, endDate }
    })
    return response.data
  },

  // Lấy thống kê cho Admin
  getAdminStats: async () => {
    const response = await apiClient.get('/dashboard/admin/stats')
    return response.data
  },

  // Lấy thống kê cho Manager
  getManagerStats: async () => {
    const response = await apiClient.get('/dashboard/manager/stats')
    return response.data
  },

  // Lấy thống kê cho Staff
  getStaffStats: async () => {
    const response = await apiClient.get('/dashboard/staff/stats')
    return response.data
  },


  // Lấy nhiệm vụ hôm nay (cho Staff)
  getTodayTasks: async () => {
    const response = await apiClient.get('/dashboard/staff/tasks')
    return response.data
  },

  // Lấy hiệu suất kho (cho Manager)
  getWarehousePerformance: async () => {
    const response = await apiClient.get('/dashboard/manager/performance')
    return response.data
  },

  // Lấy thống kê hệ thống (cho Admin)
  getSystemStats: async () => {
    const response = await apiClient.get('/dashboard/admin/system')
    return response.data
  }
}

export default apiClient
