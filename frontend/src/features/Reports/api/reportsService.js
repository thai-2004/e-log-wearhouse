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

export const reportsAPI = {
  // Lấy danh sách báo cáo
  getReports: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.REPORTS.BASE, { params })
    return response.data
  },

  // Lấy thông tin báo cáo theo ID
  getReportById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}`)
    return response.data
  },

  // Tạo báo cáo mới
  createReport: async (data) => {
    const response = await api.post(API_ENDPOINTS.REPORTS.BASE, data)
    return response.data
  },

  // Cập nhật báo cáo
  updateReport: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.REPORTS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa báo cáo
  deleteReport: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.REPORTS.BASE}/${id}`)
    return response.data
  },

  // Chạy báo cáo
  runReport: async (id, params = {}) => {
    const response = await api.post(`${API_ENDPOINTS.REPORTS.BASE}/${id}/run`, params)
    return response.data
  },

  // Lấy dữ liệu báo cáo
  getReportData: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}/data`, { params })
    return response.data
  },

  // Xuất báo cáo
  exportReport: async (id, format = 'pdf', params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}/export`, {
      params: { format, ...params },
      responseType: 'blob'
    })
    return response.data
  },

  // Lấy danh sách template báo cáo
  getReportTemplates: async () => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/templates`)
    return response.data
  },

  // Tạo báo cáo từ template
  createReportFromTemplate: async (templateId, data) => {
    const response = await api.post(`${API_ENDPOINTS.REPORTS.BASE}/from-template/${templateId}`, data)
    return response.data
  },

  // Lấy danh sách loại báo cáo
  getReportTypes: async () => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/types`)
    return response.data
  },

  // Lấy thống kê tổng quan
  getOverviewStats: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/overview`, { params })
    return response.data
  },

  // Báo cáo tồn kho
  getInventoryReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/inventory`, { params })
    return response.data
  },

  // Báo cáo xuất nhập kho
  getInboundOutboundReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/inbound-outbound`, { params })
    return response.data
  },

  // Báo cáo doanh thu
  getRevenueReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/revenue`, { params })
    return response.data
  },

  // Báo cáo khách hàng
  getCustomerReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/customer`, { params })
    return response.data
  },

  // Báo cáo nhà cung cấp
  getSupplierReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/supplier`, { params })
    return response.data
  },

  // Báo cáo sản phẩm
  getProductReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/product`, { params })
    return response.data
  },

  // Báo cáo theo khoảng thời gian
  getTimeRangeReport: async (startDate, endDate, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/time-range`, {
      params: { startDate, endDate, ...params }
    })
    return response.data
  },

  // Báo cáo theo kho
  getWarehouseReport: async (warehouseId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/warehouse/${warehouseId}`, { params })
    return response.data
  },

  // Báo cáo theo sản phẩm
  getProductDetailReport: async (productId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/product/${productId}`, { params })
    return response.data
  },

  // Báo cáo theo khách hàng
  getCustomerDetailReport: async (customerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/customer/${customerId}`, { params })
    return response.data
  },

  // Báo cáo theo nhà cung cấp
  getSupplierDetailReport: async (supplierId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/supplier/${supplierId}`, { params })
    return response.data
  },

  // Báo cáo cảnh báo tồn kho
  getStockAlertReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/stock-alert`, { params })
    return response.data
  },

  // Báo cáo sản phẩm sắp hết hạn
  getExpiringProductsReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/expiring-products`, { params })
    return response.data
  },

  // Báo cáo sản phẩm hết hạn
  getExpiredProductsReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/expired-products`, { params })
    return response.data
  },

  // Báo cáo sản phẩm tồn kho lâu
  getSlowMovingProductsReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/slow-moving-products`, { params })
    return response.data
  },

  // Báo cáo sản phẩm bán chạy
  getTopSellingProductsReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/top-selling-products`, { params })
    return response.data
  },

  // Báo cáo khách hàng mua nhiều
  getTopCustomersReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/top-customers`, { params })
    return response.data
  },

  // Báo cáo nhà cung cấp tốt nhất
  getTopSuppliersReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/top-suppliers`, { params })
    return response.data
  },

  // Báo cáo theo ngày
  getDailyReport: async (date, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/daily/${date}`, { params })
    return response.data
  },

  // Báo cáo theo tuần
  getWeeklyReport: async (week, year, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/weekly/${year}/${week}`, { params })
    return response.data
  },

  // Báo cáo theo tháng
  getMonthlyReport: async (month, year, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/monthly/${year}/${month}`, { params })
    return response.data
  },

  // Báo cáo theo quý
  getQuarterlyReport: async (quarter, year, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/quarterly/${year}/${quarter}`, { params })
    return response.data
  },

  // Báo cáo theo năm
  getYearlyReport: async (year, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/yearly/${year}`, { params })
    return response.data
  },

  // Báo cáo so sánh
  getComparisonReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/comparison`, { params })
    return response.data
  },

  // Báo cáo xu hướng
  getTrendReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/trend`, { params })
    return response.data
  },

  // Báo cáo dự báo
  getForecastReport: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/forecast`, { params })
    return response.data
  },

  // Lưu báo cáo
  saveReport: async (id, data) => {
    const response = await api.post(`${API_ENDPOINTS.REPORTS.BASE}/${id}/save`, data)
    return response.data
  },

  // Chia sẻ báo cáo
  shareReport: async (id, data) => {
    const response = await api.post(`${API_ENDPOINTS.REPORTS.BASE}/${id}/share`, data)
    return response.data
  },

  // Lấy danh sách báo cáo đã lưu
  getSavedReports: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/saved`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo đã chia sẻ
  getSharedReports: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/shared`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo yêu thích
  getFavoriteReports: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/favorites`, { params })
    return response.data
  },

  // Thêm báo cáo vào yêu thích
  addToFavorites: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.REPORTS.BASE}/${id}/favorite`)
    return response.data
  },

  // Xóa báo cáo khỏi yêu thích
  removeFromFavorites: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.REPORTS.BASE}/${id}/favorite`)
    return response.data
  },

  // Lấy lịch sử chạy báo cáo
  getReportHistory: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}/history`)
    return response.data
  },

  // Lấy thống kê báo cáo
  getReportStats: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}/stats`)
    return response.data
  },

  // Lấy danh sách báo cáo theo loại
  getReportsByType: async (type, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/type/${type}`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo theo trạng thái
  getReportsByStatus: async (status, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/status/${status}`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo theo người tạo
  getReportsByCreator: async (creatorId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/creator/${creatorId}`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo theo ngày tạo
  getReportsByDate: async (date, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/date/${date}`, { params })
    return response.data
  },

  // Lấy danh sách báo cáo theo khoảng thời gian
  getReportsByDateRange: async (startDate, endDate, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/date-range`, {
      params: { startDate, endDate, ...params }
    })
    return response.data
  },

  // Tìm kiếm báo cáo
  searchReports: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy danh sách báo cáo gần đây
  getRecentReports: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/recent`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy danh sách báo cáo phổ biến
  getPopularReports: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/popular`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy danh sách báo cáo được đề xuất
  getRecommendedReports: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.REPORTS.BASE}/recommended`, {
      params: { limit }
    })
    return response.data
  }
}

export default reportsAPI
