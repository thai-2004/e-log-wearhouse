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

export const productAPI = {
  // Lấy danh sách sản phẩm
  getProducts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params })
    return response.data
  },

  // Lấy sản phẩm theo ID
  getProduct: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`)
    return response.data
  },

  // Tạo sản phẩm mới
  createProduct: async (data) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.BASE, data)
    return response.data
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`)
    return response.data
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: { q: query }
    })
    return response.data
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_CATEGORY}/${categoryId}`)
    return response.data
  },

  // Lấy sản phẩm theo SKU
  getProductBySKU: async (sku) => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SKU}/${sku}`)
    return response.data
  },

  // Lấy sản phẩm theo barcode
  getProductByBarcode: async (barcode) => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_BARCODE}/${barcode}`)
    return response.data
  },

  // Lấy sản phẩm sắp hết hàng
  getLowStockProducts: async () => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.LOW_STOCK)
    return response.data
  },

  // Cập nhật giá sản phẩm
  updateProductPrice: async (id, priceData) => {
    const response = await api.put(`${API_ENDPOINTS.PRODUCTS.UPDATE_PRICE.replace(':id', id)}`, priceData)
    return response.data
  },

  // Upload hình ảnh sản phẩm
  uploadProductImage: async (id, formData) => {
    const response = await api.post(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Xóa hình ảnh sản phẩm
  deleteProductImage: async (id, imageId) => {
    const response = await api.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}/image/${imageId}`)
    return response.data
  },

  // Xuất danh sách sản phẩm
  exportProducts: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import sản phẩm từ file
  importProducts: async (formData) => {
    const response = await api.post(`${API_ENDPOINTS.PRODUCTS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export default productAPI
