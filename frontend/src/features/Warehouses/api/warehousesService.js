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

export const warehousesAPI = {
  // Lấy danh sách kho
  getWarehouses: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.WAREHOUSES.BASE, { params })
    return response.data
  },

  // Lấy thông tin kho theo ID
  getWarehouseById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}`)
    return response.data
  },

  // Tạo kho mới
  createWarehouse: async (data) => {
    const response = await api.post(API_ENDPOINTS.WAREHOUSES.BASE, data)
    return response.data
  },

  // Cập nhật kho
  updateWarehouse: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}`, data)
    return response.data
  },

  // Xóa kho
  deleteWarehouse: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}`)
    return response.data
  },

  // Lấy danh sách sản phẩm trong kho
  getWarehouseProducts: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/products`, { params })
    return response.data
  },

  // Lấy thống kê kho
  getWarehouseStats: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/stats`)
    return response.data
  },

  // Lấy lịch sử hoạt động kho
  getWarehouseHistory: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/history`, { params })
    return response.data
  },

  // Lấy danh sách nhân viên kho
  getWarehouseStaff: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/staff`)
    return response.data
  },

  // Thêm nhân viên vào kho
  addWarehouseStaff: async (id, staffData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/staff`, staffData)
    return response.data
  },

  // Xóa nhân viên khỏi kho
  removeWarehouseStaff: async (id, staffId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/staff/${staffId}`)
    return response.data
  },

  // Cập nhật vai trò nhân viên trong kho
  updateWarehouseStaffRole: async (id, staffId, roleData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/staff/${staffId}`, roleData)
    return response.data
  },

  // Lấy danh sách khu vực trong kho
  getWarehouseZones: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/zones`)
    return response.data
  },

  // Tạo khu vực mới trong kho
  createWarehouseZone: async (id, zoneData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/zones`, zoneData)
    return response.data
  },

  // Cập nhật khu vực trong kho
  updateWarehouseZone: async (id, zoneId, zoneData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/zones/${zoneId}`, zoneData)
    return response.data
  },

  // Xóa khu vực trong kho
  deleteWarehouseZone: async (id, zoneId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/zones/${zoneId}`)
    return response.data
  },

  // Lấy danh sách kệ trong kho
  getWarehouseShelves: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/shelves`, { params })
    return response.data
  },

  // Tạo kệ mới trong kho
  createWarehouseShelf: async (id, shelfData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/shelves`, shelfData)
    return response.data
  },

  // Cập nhật kệ trong kho
  updateWarehouseShelf: async (id, shelfId, shelfData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/shelves/${shelfId}`, shelfData)
    return response.data
  },

  // Xóa kệ trong kho
  deleteWarehouseShelf: async (id, shelfId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/shelves/${shelfId}`)
    return response.data
  },

  // Lấy danh sách vị trí trong kho
  getWarehouseLocations: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/locations`, { params })
    return response.data
  },

  // Tạo vị trí mới trong kho
  createWarehouseLocation: async (id, locationData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/locations`, locationData)
    return response.data
  },

  // Cập nhật vị trí trong kho
  updateWarehouseLocation: async (id, locationId, locationData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/locations/${locationId}`, locationData)
    return response.data
  },

  // Xóa vị trí trong kho
  deleteWarehouseLocation: async (id, locationId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/locations/${locationId}`)
    return response.data
  },

  // Lấy danh sách phiếu nhập kho
  getWarehouseInbounds: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/inbounds`, { params })
    return response.data
  },

  // Lấy danh sách phiếu xuất kho
  getWarehouseOutbounds: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/outbounds`, { params })
    return response.data
  },

  // Lấy danh sách điều chỉnh tồn kho
  getWarehouseAdjustments: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/adjustments`, { params })
    return response.data
  },

  // Lấy danh sách chuyển kho
  getWarehouseTransfers: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/transfers`, { params })
    return response.data
  },

  // Lấy danh sách kiểm kê
  getWarehouseInventories: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/inventories`, { params })
    return response.data
  },

  // Tạo phiếu kiểm kê
  createWarehouseInventory: async (id, inventoryData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/inventories`, inventoryData)
    return response.data
  },

  // Cập nhật phiếu kiểm kê
  updateWarehouseInventory: async (id, inventoryId, inventoryData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/inventories/${inventoryId}`, inventoryData)
    return response.data
  },

  // Xóa phiếu kiểm kê
  deleteWarehouseInventory: async (id, inventoryId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/inventories/${inventoryId}`)
    return response.data
  },

  // Lấy danh sách cảnh báo kho
  getWarehouseAlerts: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/alerts`)
    return response.data
  },

  // Đánh dấu cảnh báo đã xử lý
  markAlertAsResolved: async (id, alertId) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/alerts/${alertId}/resolve`)
    return response.data
  },

  // Lấy danh sách báo cáo kho
  getWarehouseReports: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports`, { params })
    return response.data
  },

  // Lấy báo cáo tồn kho
  getWarehouseStockReport: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports/stock`, { params })
    return response.data
  },

  // Lấy báo cáo xuất nhập kho
  getWarehouseMovementReport: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports/movement`, { params })
    return response.data
  },

  // Lấy báo cáo hiệu suất kho
  getWarehousePerformanceReport: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports/performance`, { params })
    return response.data
  },

  // Lấy báo cáo sử dụng không gian
  getWarehouseSpaceReport: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports/space`)
    return response.data
  },

  // Lấy báo cáo nhiệt độ và độ ẩm
  getWarehouseEnvironmentReport: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/reports/environment`, { params })
    return response.data
  },

  // Lấy danh sách thiết bị kho
  getWarehouseEquipment: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/equipment`)
    return response.data
  },

  // Thêm thiết bị vào kho
  addWarehouseEquipment: async (id, equipmentData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/equipment`, equipmentData)
    return response.data
  },

  // Cập nhật thiết bị kho
  updateWarehouseEquipment: async (id, equipmentId, equipmentData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/equipment/${equipmentId}`, equipmentData)
    return response.data
  },

  // Xóa thiết bị khỏi kho
  removeWarehouseEquipment: async (id, equipmentId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/equipment/${equipmentId}`)
    return response.data
  },

  // Lấy danh sách bảo trì thiết bị
  getWarehouseMaintenance: async (id, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/maintenance`, { params })
    return response.data
  },

  // Tạo lịch bảo trì
  createWarehouseMaintenance: async (id, maintenanceData) => {
    const response = await api.post(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/maintenance`, maintenanceData)
    return response.data
  },

  // Cập nhật lịch bảo trì
  updateWarehouseMaintenance: async (id, maintenanceId, maintenanceData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/maintenance/${maintenanceId}`, maintenanceData)
    return response.data
  },

  // Xóa lịch bảo trì
  deleteWarehouseMaintenance: async (id, maintenanceId) => {
    const response = await api.delete(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/maintenance/${maintenanceId}`)
    return response.data
  },

  // Lấy danh sách quyền truy cập kho
  getWarehousePermissions: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/permissions`)
    return response.data
  },

  // Cập nhật quyền truy cập kho
  updateWarehousePermissions: async (id, permissionsData) => {
    const response = await api.put(`${API_ENDPOINTS.WAREHOUSES.BASE}/${id}/permissions`, permissionsData)
    return response.data
  },

  // Lấy danh sách kho theo loại
  getWarehousesByType: async (type, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/type/${type}`, { params })
    return response.data
  },

  // Lấy danh sách kho theo trạng thái
  getWarehousesByStatus: async (status, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/status/${status}`, { params })
    return response.data
  },

  // Lấy danh sách kho theo khu vực
  getWarehousesByRegion: async (region, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/region/${region}`, { params })
    return response.data
  },

  // Lấy danh sách kho theo người quản lý
  getWarehousesByManager: async (managerId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/manager/${managerId}`, { params })
    return response.data
  },

  // Tìm kiếm kho
  searchWarehouses: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/search`, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy danh sách kho gần đây
  getRecentWarehouses: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/recent`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy danh sách kho phổ biến
  getPopularWarehouses: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/popular`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy danh sách kho được đề xuất
  getRecommendedWarehouses: async (limit = 10) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/recommended`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy thống kê tổng quan kho
  getWarehousesOverview: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/overview`)
    return response.data
  },

  // Lấy danh sách kho có cảnh báo
  getWarehousesWithAlerts: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/alerts`)
    return response.data
  },

  // Lấy danh sách kho có tồn kho thấp
  getWarehousesWithLowStock: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/low-stock`)
    return response.data
  },

  // Lấy danh sách kho có tồn kho cao
  getWarehousesWithHighStock: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/high-stock`)
    return response.data
  },

  // Lấy danh sách kho có sản phẩm hết hạn
  getWarehousesWithExpiredProducts: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/expired-products`)
    return response.data
  },

  // Lấy danh sách kho có sản phẩm sắp hết hạn
  getWarehousesWithExpiringProducts: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/expiring-products`)
    return response.data
  },

  // Lấy danh sách kho có sản phẩm tồn kho lâu
  getWarehousesWithSlowMovingProducts: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/slow-moving-products`)
    return response.data
  },

  // Lấy danh sách kho có sản phẩm bán chạy
  getWarehousesWithFastMovingProducts: async () => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/fast-moving-products`)
    return response.data
  },

  // Lấy danh sách kho theo hiệu suất
  getWarehousesByPerformance: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/performance`, { params })
    return response.data
  },

  // Lấy danh sách kho theo sử dụng không gian
  getWarehousesBySpaceUsage: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/space-usage`, { params })
    return response.data
  },

  // Lấy danh sách kho theo chi phí vận hành
  getWarehousesByOperatingCost: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/operating-cost`, { params })
    return response.data
  },

  // Lấy danh sách kho theo doanh thu
  getWarehousesByRevenue: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/revenue`, { params })
    return response.data
  },

  // Lấy danh sách kho theo lợi nhuận
  getWarehousesByProfit: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/profit`, { params })
    return response.data
  },

  // Lấy danh sách kho theo ROI
  getWarehousesByROI: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/roi`, { params })
    return response.data
  },

  // Lấy danh sách kho theo thời gian hoạt động
  getWarehousesByOperatingHours: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/operating-hours`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng nhân viên
  getWarehousesByStaffCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/staff-count`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng thiết bị
  getWarehousesByEquipmentCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/equipment-count`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng sản phẩm
  getWarehousesByProductCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/product-count`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng khu vực
  getWarehousesByZoneCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/zone-count`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng kệ
  getWarehousesByShelfCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/shelf-count`, { params })
    return response.data
  },

  // Lấy danh sách kho theo số lượng vị trí
  getWarehousesByLocationCount: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.WAREHOUSES.BASE}/location-count`, { params })
    return response.data
  }
}

export default warehousesAPI
