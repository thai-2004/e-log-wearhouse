import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@config'
import apiClient from '@api/client'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      initializeAuth: () => {
        // Check localStorage directly for debugging
        const storedData = localStorage.getItem('auth-storage')
        console.log('AuthStore: Raw localStorage data:', storedData)

        const state = get()

        // Check if we have either token or refreshToken with user data
        if ((state.token || state.refreshToken) && state.user) {
          set({ isAuthenticated: true })
          console.log('AuthStore: Auth initialized from Zustand persistence:', state.user)
        } else {
          console.log('AuthStore: No valid auth data found, setting isAuthenticated to false')
          set({ isAuthenticated: false })
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          // Use apiClient for consistent API calls
          const response = await apiClient.post('/auth/login', credentials)
          const data = response.data

          console.log('AuthStore: Login response:', data)

          if (!data.success) {
            throw new Error(data.message || 'Đăng nhập thất bại')
          }

          const { user, accessToken, refreshToken } = data.data
          const token = accessToken // Map accessToken to token for consistency
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          localStorage.setItem('auth_token', token)
          return { user, token, refreshToken }
        } catch (error) {
          if (error.response?.status === 429) {
            throw new Error('Quá nhiều lần thử đăng nhập. Vui lòng đợi 15 phút trước khi thử lại.')
          }

          set({
            isLoading: false,
            error: error.message || 'Đăng nhập thất bại',
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          // Call backend logout endpoint using apiClient
          await apiClient.post('/auth/logout')
        } catch (error) {
          console.error('Logout API call failed:', error)
        } finally {
          // Clear local state regardless of API call result
          // Zustand persistence will handle localStorage cleanup
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          localStorage.removeItem('auth_token')
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Getters
      getIsAuthenticated: () => {
        const { token, user } = get()
        return !!(token && user)
      },

      getUserRole: () => {
        const { user } = get()
        return user?.role || null
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false

        const role = user.role
        const permissions = {
          admin: ['*'], // Admin has all permissions
          manager: [
            'product_management',
            'category_management',
            'inventory_management',
            'customer_management',
            'supplier_management',
            'inbound_management',
            'outbound_management',
            'report_view',
          ],
          staff: [
            'inventory_management',
            'inbound_management',
            'outbound_management',
          ],
          viewer: [
            'report_view',
          ],
        }

        const userPermissions = permissions[role] || []
        return userPermissions.includes('*') || userPermissions.includes(permission)
      },

      isAdmin: () => {
        return get().getUserRole() === 'admin'
      },

      isManager: () => {
        return get().getUserRole() === 'manager'
      },

      isStaff: () => {
        return get().getUserRole() === 'staff'
      },

      isViewer: () => {
        return get().getUserRole() === 'viewer'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('AuthStore: Rehydration completed', state)
        if (state && (state.token || state.refreshToken) && state.user) {
          console.log('AuthStore: Setting isAuthenticated to true after rehydration')
          state.isAuthenticated = true
        }
      },
    }
  )
)

export { useAuthStore }