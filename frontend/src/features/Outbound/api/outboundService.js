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

export const outboundAPI = {
  // Lấy danh sách phiếu xuất kho
  getOutbounds: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.OUTBOUNDS.BASE, { params })
    return response.data
  },

  // Lấy thông tin phiếu xuất kho theo ID
  getOutboundById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}`)
    return response.data
  },

  // Tạo phiếu xuất kho mới
  createOutbound: async (data) => {
    const response = await api.post(API_ENDPOINTS.OUTBOUNDS.BASE, data)
    return response.data
  },

  // Cập nhật phiếu xuất kho
  updateOutbound: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa phiếu xuất kho
  deleteOutbound: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}`)
    return response.data
  },

  // Cập nhật trạng thái phiếu xuất kho
  updateOutboundStatus: async (id, status) => {
    const response = await api.patch(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}/status`, { status })
    return response.data
  },

  // Xác nhận phiếu xuất kho
  confirmOutbound: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}/confirm`)
    return response.data
  },

  // Hủy phiếu xuất kho
  cancelOutbound: async (id, reason) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}/cancel`, { reason })
    return response.data
  },

  // Lấy danh sách sản phẩm trong phiếu xuất
  getOutboundItems: async (outboundId) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/items`)
    return response.data
  },

  // Thêm sản phẩm vào phiếu xuất
  addOutboundItem: async (outboundId, data) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/items`, data)
    return response.data
  },

  // Cập nhật sản phẩm trong phiếu xuất
  updateOutboundItem: async (outboundId, itemId, data) => {
    const response = await api.put(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/items/${itemId}`, data)
    return response.data
  },

  // Xóa sản phẩm khỏi phiếu xuất
  removeOutboundItem: async (outboundId, itemId) => {
    const response = await api.delete(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/items/${itemId}`)
    return response.data
  },

  // Upload tài liệu đính kèm
  uploadOutboundAttachment: async (outboundId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Xóa tài liệu đính kèm
  deleteOutboundAttachment: async (outboundId, attachmentId) => {
    const response = await api.delete(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/attachments/${attachmentId}`)
    return response.data
  },

  // Lấy lịch sử phiếu xuất kho
  getOutboundHistory: async (outboundId) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/history`)
    return response.data
  },

  // Lấy thống kê phiếu xuất kho
  getOutboundStats: async (outboundId) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/stats`)
    return response.data
  },

  // Lấy thống kê tổng quan phiếu xuất kho
  getOutboundsOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/overview`)
    return response.data
  },

  // Xuất phiếu xuất kho
  exportOutbound: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}/export`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Xuất danh sách phiếu xuất kho
  exportOutbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import phiếu xuất kho từ file
  importOutbounds: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Tìm kiếm phiếu xuất kho
  searchOutbounds: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy phiếu xuất kho theo khách hàng
  getOutboundsByCustomer: async (customerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/customer/${customerId}`, { params })
    return response.data
  },

  // Lấy phiếu xuất kho theo kho
  getOutboundsByWarehouse: async (warehouseId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/warehouse/${warehouseId}`, { params })
    return response.data
  },

  // Lấy phiếu xuất kho theo sản phẩm
  getOutboundsByProduct: async (productId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/product/${productId}`, { params })
    return response.data
  },

  // Tạo phiếu xuất kho từ đơn hàng
  createOutboundFromOrder: async (orderId, data) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/from-order/${orderId}`, data)
    return response.data
  },

  // Sao chép phiếu xuất kho
  duplicateOutbound: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${id}/duplicate`)
    return response.data
  },

  // Lấy danh sách phiếu xuất kho chờ xử lý
  getPendingOutbounds: async () => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/pending`)
    return response.data
  },

  // Lấy danh sách phiếu xuất kho đã hoàn thành
  getCompletedOutbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/completed`, { params })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho bị hủy
  getCancelledOutbounds: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/cancelled`, { params })
    return response.data
  },

  // Tính toán tổng giá trị phiếu xuất
  calculateOutboundTotal: async (items) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/calculate-total`, { items })
    return response.data
  },

  // Kiểm tra tồn kho trước khi xuất
  checkInventoryBeforeOutbound: async (items) => {
    const response = await api.post(`${API_ENDPOINTS.OUTBOUNDS.BASE}/check-inventory`, { items })
    return response.data
  },

  // Lấy báo cáo phiếu xuất kho
  getOutboundReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/report`, { params })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho theo ngày
  getOutboundsByDate: async (date, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/date/${date}`, { params })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho theo khoảng thời gian
  getOutboundsByDateRange: async (startDate, endDate, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/date-range`, {
      params: { startDate, endDate, ...params }
    })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho theo loại
  getOutboundsByType: async (type, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/type/${type}`, { params })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho theo phương thức vận chuyển
  getOutboundsByShippingMethod: async (shippingMethod, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/shipping/${shippingMethod}`, { params })
    return response.data
  },

  // Cập nhật thông tin vận chuyển
  updateShippingInfo: async (outboundId, shippingInfo) => {
    const response = await api.patch(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/shipping`, shippingInfo)
    return response.data
  },

  // Lấy mã vận đơn
  getTrackingNumber: async (outboundId) => {
    const response = await api.get(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/tracking`)
    return response.data
  },

  // Cập nhật mã vận đơn
  updateTrackingNumber: async (outboundId, trackingNumber) => {
    const response = await api.patch(`${API_ENDPOINTS.OUTBOUNDS.BASE}/${outboundId}/tracking`, { trackingNumber })
    return response.data
  }
}

export default outboundAPI
