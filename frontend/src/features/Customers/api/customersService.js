import { API_CONFIG, API_ENDPOINTS } from '@config'
import axios from 'axios'

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Request interceptor để thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const customersAPI = {
  // Lấy danh sách khách hàng
  getCustomers: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.BASE, { params })
    return response.data
  },

  // Lấy thông tin khách hàng theo ID
  getCustomerById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`)
    return response.data
  },

  // Tạo khách hàng mới
  createCustomer: async (data) => {
    const response = await api.post(API_ENDPOINTS.CUSTOMERS.BASE, data)
    return response.data
  },

  // Cập nhật thông tin khách hàng
  updateCustomer: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa khách hàng
  deleteCustomer: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`)
    return response.data
  },

  // Cập nhật trạng thái khách hàng
  updateCustomerStatus: async (id, status) => {
    const response = await api.patch(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}/status`, { status })
    return response.data
  },

  // Upload avatar khách hàng
  uploadCustomerAvatar: async (id, file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Lấy lịch sử giao dịch của khách hàng
  getCustomerTransactions: async (customerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/transactions`, { params })
    return response.data
  },

  // Lấy lịch sử đơn hàng của khách hàng
  getCustomerOrders: async (customerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/orders`, { params })
    return response.data
  },

  // Lấy thống kê khách hàng
  getCustomerStats: async (customerId) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/stats`)
    return response.data
  },

  // Lấy danh sách nhóm khách hàng
  getCustomerGroups: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.GROUPS)
    return response.data
  },

  // Tạo nhóm khách hàng
  createCustomerGroup: async (data) => {
    const response = await api.post(API_ENDPOINTS.CUSTOMERS.GROUPS, data)
    return response.data
  },

  // Cập nhật nhóm khách hàng
  updateCustomerGroup: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.CUSTOMERS.GROUPS}/${id}`, data)
    return response.data
  },

  // Xóa nhóm khách hàng
  deleteCustomerGroup: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS.GROUPS}/${id}`)
    return response.data
  },

  // Gán khách hàng vào nhóm
  assignCustomerToGroup: async (customerId, groupId) => {
    const response = await api.post(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/groups`, { groupId })
    return response.data
  },

  // Xóa khách hàng khỏi nhóm
  removeCustomerFromGroup: async (customerId, groupId) => {
    const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/groups/${groupId}`)
    return response.data
  },

  // Lấy danh sách địa chỉ của khách hàng
  getCustomerAddresses: async (customerId) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/addresses`)
    return response.data
  },

  // Thêm địa chỉ cho khách hàng
  addCustomerAddress: async (customerId, data) => {
    const response = await api.post(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/addresses`, data)
    return response.data
  },

  // Cập nhật địa chỉ khách hàng
  updateCustomerAddress: async (customerId, addressId, data) => {
    const response = await api.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/addresses/${addressId}`, data)
    return response.data
  },

  // Xóa địa chỉ khách hàng
  deleteCustomerAddress: async (customerId, addressId) => {
    const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/addresses/${addressId}`)
    return response.data
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (customerId, addressId) => {
    const response = await api.patch(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/addresses/${addressId}/default`)
    return response.data
  },

  // Lấy thống kê tổng quan khách hàng
  getCustomersOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/overview`)
    return response.data
  },

  // Xuất danh sách khách hàng
  exportCustomers: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import danh sách khách hàng
  importCustomers: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.CUSTOMERS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Tìm kiếm khách hàng
  searchCustomers: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy khách hàng VIP
  getVipCustomers: async () => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/vip`)
    return response.data
  },

  // Cập nhật điểm tích lũy
  updateCustomerPoints: async (customerId, points, reason) => {
    const response = await api.post(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/points`, {
      points,
      reason
    })
    return response.data
  },

  // Lấy lịch sử điểm tích lũy
  getCustomerPointsHistory: async (customerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/points-history`, { params })
    return response.data
  }
}

export default customersAPI
