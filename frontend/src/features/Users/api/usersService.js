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

export const usersAPI = {
  // Lấy danh sách người dùng
  getUsers: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.USERS.BASE, { params })
    return response.data
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/${id}`)
    return response.data
  },

  // Tạo người dùng mới
  createUser: async (data) => {
    const response = await api.post(API_ENDPOINTS.USERS.BASE, data)
    return response.data
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, data)
    return response.data
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.USERS.BASE}/${id}`)
    return response.data
  },

  // Cập nhật trạng thái người dùng
  updateUserStatus: async (id, isActive) => {
    const response = await api.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, { isActive })
    return response.data
  },

  // Đặt lại mật khẩu
  resetPassword: async (id, newPassword) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/${id}/reset-password`, { 
      newPassword 
    })
    return response.data
  },

  // Thay đổi mật khẩu của chính mình
  changePassword: async (data) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/change-password`, data)
    return response.data
  },

  // Cập nhật profile
  updateProfile: async (data) => {
    const response = await api.put(`${API_ENDPOINTS.USERS.BASE}/profile`, data)
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (id, file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Lấy danh sách vai trò
  getRoles: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.ROLES)
    return response.data
  },

  // Gán vai trò cho người dùng
  assignRole: async (userId, roleId) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/${userId}/roles`, { 
      roleId 
    })
    return response.data
  },

  // Xóa vai trò của người dùng
  removeRole: async (userId, roleId) => {
    const response = await api.delete(`${API_ENDPOINTS.USERS.BASE}/${userId}/roles/${roleId}`)
    return response.data
  },

  // Lấy danh sách quyền
  getPermissions: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.PERMISSIONS)
    return response.data
  },

  // Gán quyền cho người dùng
  assignPermission: async (userId, permissionId) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/${userId}/permissions`, { 
      permissionId 
    })
    return response.data
  },

  // Xóa quyền của người dùng
  removePermission: async (userId, permissionId) => {
    const response = await api.delete(`${API_ENDPOINTS.USERS.BASE}/${userId}/permissions/${permissionId}`)
    return response.data
  },

  // Lấy lịch sử hoạt động của người dùng
  getUserActivity: async (userId, params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/${userId}/activity`, { params })
    return response.data
  },

  // Lấy thống kê người dùng
  getUserStats: async () => {
    const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/stats`)
    return response.data
  },

  // Xuất danh sách người dùng
  exportUsers: async (params = {}) => {
    const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Import danh sách người dùng
  importUsers: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Gửi email mời người dùng
  inviteUser: async (data) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/invite`, data)
    return response.data
  },

  // Xác nhận lời mời
  confirmInvitation: async (token, data) => {
    const response = await api.post(`${API_ENDPOINTS.USERS.BASE}/confirm-invitation/${token}`, data)
    return response.data
  }
}

export default usersAPI
