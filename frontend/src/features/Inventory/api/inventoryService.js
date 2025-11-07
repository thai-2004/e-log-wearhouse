import { API_ENDPOINTS } from '@config'
import apiClient from '@api/client'

export const inventoryAPI = {
  // Lấy danh sách tồn kho
  getInventory: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.BASE, { params })
    return response.data
  },

  // Lấy tồn kho theo sản phẩm
  getInventoryByProduct: async (productId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.BY_PRODUCT}/${productId}`)
    return response.data
  },

  // Lấy tồn kho theo kho
  getInventoryByWarehouse: async (warehouseId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.BY_WAREHOUSE}/${warehouseId}`)
    return response.data
  },

  // Lấy tồn kho theo vị trí
  getInventoryByLocation: async (locationId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.BY_LOCATION}/${locationId}`)
    return response.data
  },

  // Lấy sản phẩm sắp hết hàng
  getLowStockItems: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOW_STOCK)
    return response.data
  },

  // Lấy sản phẩm hết hàng
  getZeroStockItems: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.ZERO_STOCK)
    return response.data
  },

  // Lấy sản phẩm tồn kho cao
  getOverstockItems: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.OVERSTOCK)
    return response.data
  },

  // Lấy lịch sử di chuyển tồn kho
  getInventoryMovements: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.MOVEMENTS, { params })
    return response.data
  },

  // Điều chỉnh tồn kho
  adjustInventory: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.ADJUST, data)
    return response.data
  },

  // Lấy báo cáo tồn kho
  getInventoryReport: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.REPORT, { params })
    return response.data
  },

  // Xuất báo cáo tồn kho
  exportInventory: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.EXPORT, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Cập nhật tồn kho
  updateInventory: async (id, data) => {
    const response = await apiClient.put(`${API_ENDPOINTS.INVENTORY.BASE}/${id}`, data)
    return response.data
  },

  // Tạo bản ghi tồn kho mới
  createInventory: async (data) => {
    console.log('📤 [inventoryService] createInventory called with data:', data)
    
    // Kiểm tra token trước khi gọi API
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        const token = parsed?.state?.token
        if (token) {
          console.log('✅ [inventoryService] Token available, will be sent via apiClient interceptor')
        } else {
          console.error('❌ [inventoryService] No token in auth-storage!')
        }
      } catch (e) {
        console.error('❌ [inventoryService] Error checking token:', e)
      }
    } else {
      console.error('❌ [inventoryService] No auth-storage found!')
    }
    
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.BASE, data)
    console.log('✅ [inventoryService] createInventory response:', response.data)
    return response.data
  },

  // Xóa bản ghi tồn kho
  deleteInventory: async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.INVENTORY.BASE}/${id}`)
    return response.data
  },

  // Chuyển kho
  transferInventory: async (data) => {
    const response = await apiClient.post(`${API_ENDPOINTS.INVENTORY.BASE}/transfer`, data)
    return response.data
  },

  // Kiểm kê tồn kho
  conductStocktake: async (data) => {
    const response = await apiClient.post(`${API_ENDPOINTS.INVENTORY.BASE}/stocktake`, data)
    return response.data
  },

  // Lấy lịch sử kiểm kê
  getStocktakeHistory: async (params = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.BASE}/stocktake-history`, { params })
    return response.data
  },

  // Cập nhật giá trị tồn kho
  updateInventoryValue: async (id, valueData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.INVENTORY.BASE}/${id}/value`, valueData)
    return response.data
  },

  // Lấy cảnh báo tồn kho
  getInventoryAlerts: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.BASE}/alerts`)
    return response.data
  }
}

export default inventoryAPI
