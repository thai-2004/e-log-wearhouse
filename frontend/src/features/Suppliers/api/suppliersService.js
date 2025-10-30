import { API_ENDPOINTS } from '@config'
import apiClient from '@api/client'

const api = apiClient

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
      headers: { 'Content-Type': 'multipart/form-data' }
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

  // Địa chỉ
  getSupplierAddresses: async (supplierId) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses`)
    return response.data
  },
  addSupplierAddress: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses`, data)
    return response.data
  },
  updateSupplierAddress: async (supplierId, addressId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}`, data)
    return response.data
  },
  deleteSupplierAddress: async (supplierId, addressId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}`)
    return response.data
  },
  setDefaultSupplierAddress: async (supplierId, addressId) => {
    const response = await api.patch(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/addresses/${addressId}/default`)
    return response.data
  },

  // Liên hệ
  getSupplierContacts: async (supplierId) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts`)
    return response.data
  },
  addSupplierContact: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts`, data)
    return response.data
  },
  updateSupplierContact: async (supplierId, contactId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts/${contactId}`, data)
    return response.data
  },
  deleteSupplierContact: async (supplierId, contactId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contacts/${contactId}`)
    return response.data
  },

  // Tổng quan / export / import / search / top
  getSuppliersOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/overview`)
    return response.data
  },
  exportSuppliers: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/export`, { params, responseType: 'blob' })
    return response.data
  },
  importSuppliers: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },
  searchSuppliers: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/search`, { params: { q: query } })
    return response.data
  },
  getTopSuppliers: async () => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/top`)
    return response.data
  },
  rateSupplier: async (supplierId, rating, comment) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/rating`, { rating, comment })
    return response.data
  },
  getSupplierRatings: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/ratings`, { params })
    return response.data
  },
  getSupplierContracts: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts`, { params })
    return response.data
  },
  createSupplierContract: async (supplierId, data) => {
    const response = await api.post(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts`, data)
    return response.data
  },
  updateSupplierContract: async (supplierId, contractId, data) => {
    const response = await api.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts/${contractId}`, data)
    return response.data
  },
  deleteSupplierContract: async (supplierId, contractId) => {
    const response = await api.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${supplierId}/contracts/${contractId}`)
    return response.data
  }
}

export default suppliersAPI
