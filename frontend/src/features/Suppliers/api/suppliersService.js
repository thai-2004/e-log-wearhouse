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

export const suppliersAPI = {
  // Lấy danh sách nhà cung cấp
  getSuppliers: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.BASE, { params })
    return response.data
  },

  // Lấy thông tin nhà cung cấp theo ID
  getSupplierById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`)
    return response.data
  },

  // Tạo nhà cung cấp mới
  createSupplier: async (data) => {
    const response = await api.post(API_ENDPOINTS.SUPPLIERS.BASE, data)
    return response.data
  },

  // Cập nhật thông tin nhà cung cấp
  updateSupplier: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa nhà cung cấp
  deleteSupplier: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`)
    return response.data
  },

  // Cập nhật trạng thái nhà cung cấp
  updateSupplierStatus: async (id, status) => {
    const response = await api.patch(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}/status`, { status })
    return response.data
  },

  // Upload logo nhà cung cấp
  uploadSupplierLogo: async (id, file) => {
    const formData = new FormData()
    formData.append('logo', file)
    
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Lấy lịch sử giao dịch với nhà cung cấp
  getSupplierTransactions: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/transactions`, { params })
    return response.data
  },

  // Lấy lịch sử đơn hàng với nhà cung cấp
  getSupplierOrders: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/orders`, { params })
    return response.data
  },

  // Lấy thống kê nhà cung cấp
  getSupplierStats: async (supplierId) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/stats`)
    return response.data
  },

  // Lấy danh sách sản phẩm của nhà cung cấp
  getSupplierProducts: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/products`, { params })
    return response.data
  },

  // Thêm sản phẩm cho nhà cung cấp
  addSupplierProduct: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/products`, data)
    return response.data
  },

  // Cập nhật sản phẩm của nhà cung cấp
  updateSupplierProduct: async (supplierId, productId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/products/${productId}`, data)
    return response.data
  },

  // Xóa sản phẩm khỏi nhà cung cấp
  removeSupplierProduct: async (supplierId, productId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/products/${productId}`)
    return response.data
  },

  // Lấy danh sách địa chỉ của nhà cung cấp
  getSupplierAddresses: async (supplierId) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses`)
    return response.data
  },

  // Thêm địa chỉ cho nhà cung cấp
  addSupplierAddress: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses`, data)
    return response.data
  },

  // Cập nhật địa chỉ nhà cung cấp
  updateSupplierAddress: async (supplierId, addressId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}`, data)
    return response.data
  },

  // Xóa địa chỉ nhà cung cấp
  deleteSupplierAddress: async (supplierId, addressId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}`)
    return response.data
  },

  // Đặt địa chỉ mặc định
  setDefaultSupplierAddress: async (supplierId, addressId) => {
    const response = await api.patch(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}/default`)
    return response.data
  },

  // Lấy danh sách liên hệ của nhà cung cấp
  getSupplierContacts: async (supplierId) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts`)
    return response.data
  },

  // Thêm liên hệ cho nhà cung cấp
  addSupplierContact: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts`, data)
    return response.data
  },

  // Cập nhật liên hệ nhà cung cấp
  updateSupplierContact: async (supplierId, contactId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts/${contactId}`, data)
    return response.data
  },

  // Xóa liên hệ nhà cung cấp
  deleteSupplierContact: async (supplierId, contactId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts/${contactId}`)
    return response.data
  },

  // Lấy thống kê tổng quan nhà cung cấp
  getSuppliersOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/overview`)
    return response.data
  },

  // Xuất danh sách nhà cung cấp
  exportSuppliers: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import danh sách nhà cung cấp
  importSuppliers: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Tìm kiếm nhà cung cấp
  searchSuppliers: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy nhà cung cấp tốt nhất
  getTopSuppliers: async () => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/top`)
    return response.data
  },

  // Đánh giá nhà cung cấp
  rateSupplier: async (supplierId, rating, comment) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/rating`, {
      rating,
      comment
    })
    return response.data
  },

  // Lấy lịch sử đánh giá
  getSupplierRatings: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/ratings`, { params })
    return response.data
  },

  // Lấy danh sách hợp đồng
  getSupplierContracts: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts`, { params })
    return response.data
  },

  // Tạo hợp đồng mới
  createSupplierContract: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts`, data)
    return response.data
  },

  // Cập nhật hợp đồng
  updateSupplierContract: async (supplierId, contractId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts/${contractId}`, data)
    return response.data
  },

  // Xóa hợp đồng
  deleteSupplierContract: async (supplierId, contractId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts/${contractId}`)
    return response.data
  }
}

export default suppliersAPI
