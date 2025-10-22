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

export const inboundAPI = {
  // Lấy danh sách phiếu nhập kho
  getInbounds: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.INBOUNDS.BASE, { params })
    return response.data
  },

  // Lấy thông tin phiếu nhập kho theo ID
  getInboundById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}`)
    return response.data
  },

  // Tạo phiếu nhập kho mới
  createInbound: async (data) => {
    const response = await api.post(API_ENDPOINTS.INBOUNDS.BASE, data)
    return response.data
  },

  // Cập nhật phiếu nhập kho
  updateInbound: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa phiếu nhập kho
  deleteInbound: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}`)
    return response.data
  },

  // Cập nhật trạng thái phiếu nhập kho
  updateInboundStatus: async (id, status) => {
    const response = await api.patch(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}/status`, { status })
    return response.data
  },

  // Xác nhận phiếu nhập kho
  confirmInbound: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}/confirm`)
    return response.data
  },

  // Hủy phiếu nhập kho
  cancelInbound: async (id, reason) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}/cancel`, { reason })
    return response.data
  },

  // Lấy danh sách sản phẩm trong phiếu nhập
  getInboundItems: async (inboundId) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/items`)
    return response.data
  },

  // Thêm sản phẩm vào phiếu nhập
  addInboundItem: async (inboundId, data) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/items`, data)
    return response.data
  },

  // Cập nhật sản phẩm trong phiếu nhập
  updateInboundItem: async (inboundId, itemId, data) => {
    const response = await api.put(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/items/${itemId}`, data)
    return response.data
  },

  // Xóa sản phẩm khỏi phiếu nhập
  removeInboundItem: async (inboundId, itemId) => {
    const response = await api.delete(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/items/${itemId}`)
    return response.data
  },

  // Upload tài liệu đính kèm
  uploadInboundAttachment: async (inboundId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Xóa tài liệu đính kèm
  deleteInboundAttachment: async (inboundId, attachmentId) => {
    const response = await api.delete(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/attachments/${attachmentId}`)
    return response.data
  },

  // Lấy lịch sử phiếu nhập kho
  getInboundHistory: async (inboundId) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/history`)
    return response.data
  },

  // Lấy thống kê phiếu nhập kho
  getInboundStats: async (inboundId) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/${inboundId}/stats`)
    return response.data
  },

  // Lấy thống kê tổng quan phiếu nhập kho
  getInboundsOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/overview`)
    return response.data
  },

  // Xuất phiếu nhập kho
  exportInbound: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}/export`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Xuất danh sách phiếu nhập kho
  exportInbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import phiếu nhập kho từ file
  importInbounds: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Tìm kiếm phiếu nhập kho
  searchInbounds: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy phiếu nhập kho theo nhà cung cấp
  getInboundsBySupplier: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/supplier/${supplierId}`, { params })
    return response.data
  },

  // Lấy phiếu nhập kho theo kho
  getInboundsByWarehouse: async (warehouseId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/warehouse/${warehouseId}`, { params })
    return response.data
  },

  // Lấy phiếu nhập kho theo sản phẩm
  getInboundsByProduct: async (productId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/product/${productId}`, { params })
    return response.data
  },

  // Tạo phiếu nhập kho từ đơn hàng
  createInboundFromOrder: async (orderId, data) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/from-order/${orderId}`, data)
    return response.data
  },

  // Sao chép phiếu nhập kho
  duplicateInbound: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/${id}/duplicate`)
    return response.data
  },

  // Lấy danh sách phiếu nhập kho chờ xử lý
  getPendingInbounds: async () => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/pending`)
    return response.data
  },

  // Lấy danh sách phiếu nhập kho đã hoàn thành
  getCompletedInbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/completed`, { params })
    return response.data
  },

  // Lấy danh sách phiếu nhập kho bị hủy
  getCancelledInbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/cancelled`, { params })
    return response.data
  },

  // Tính toán tổng giá trị phiếu nhập
  calculateInboundTotal: async (items) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/calculate-total`, { items })
    return response.data
  },

  // Kiểm tra tồn kho trước khi nhập
  checkInventoryBeforeInbound: async (items) => {
    const response = await api.post(`${API_ENDPOINTS.INBOUNDS.BASE}/check-inventory`, { items })
    return response.data
  },

  // Lấy báo cáo phiếu nhập kho
  getInboundReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/report`, { params })
    return response.data
  },

  // Lấy danh sách phiếu nhập kho theo ngày
  getInboundsByDate: async (date, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/date/${date}`, { params })
    return response.data
  },

  // Lấy danh sách phiếu nhập kho theo khoảng thời gian
  getInboundsByDateRange: async (startDate, endDate, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.INBOUNDS.BASE}/date-range`, {
      params: { startDate, endDate, ...params }
    })
    return response.data
  }
}

export default inboundAPI
