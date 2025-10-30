import { API_ENDPOINTS } from '@config'
import apiClient from '@api/client'

// Sử dụng apiClient thay vì tạo axios instance riêng
// apiClient đã có sẵn interceptor để tự động thêm token từ Zustand store
const api = apiClient

export const categoryAPI = {
  // Lấy danh sách danh mục
  getCategories: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.BASE, { params })
    return response.data
  },

  // Lấy danh mục theo ID
  getCategory: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`)
    return response.data
  },

  // Tạo danh mục mới
  createCategory: async (data) => {
    const response = await api.post(API_ENDPOINTS.CATEGORIES.BASE, data)
    return response.data
  },

  // Cập nhật danh mục
  updateCategory: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`, data)
    return response.data
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`)
    return response.data
  },

  // Lấy cây danh mục
  getCategoryTree: async () => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.TREE)
    return response.data
  },

  // Lấy danh mục con theo parent
  getCategoriesByParent: async (parentId) => {
    const response = await api.get(`${API_ENDPOINTS.CATEGORIES.BY_PARENT}/${parentId}`)
    return response.data
  },

  // Di chuyển danh mục
  moveCategory: async (id, newParentId) => {
    const response = await api.put(`${API_ENDPOINTS.CATEGORIES.MOVE.replace(':id', id)}`, {
      parentId: newParentId
    })
    return response.data
  },

  // Cập nhật hàng loạt
  bulkUpdateCategories: async (data) => {
    const response = await api.put(API_ENDPOINTS.CATEGORIES.BULK_UPDATE, data)
    return response.data
  },

  // Thống kê danh mục
  getCategoryStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.STATISTICS)
    return response.data
  },

  // Tìm kiếm danh mục nâng cao
  searchCategories: async (query) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.SEARCH, {
      params: { q: query }
    })
    return response.data
  },

  // Xuất dữ liệu danh mục
  exportCategories: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.EXPORT, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Upload hình ảnh danh mục
  uploadCategoryImage: async (id, formData) => {
    const response = await api.post(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Xóa hình ảnh danh mục
  deleteCategoryImage: async (id, imageId) => {
    const response = await api.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}/image/${imageId}`)
    return response.data
  }
}

export default categoryAPI
