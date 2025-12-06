import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@store/authStore'
import { authAPI } from '../api/authService'
import toast from 'react-hot-toast'

export const useLogin = () => {
  const { login } = useAuthStore()

  return useMutation(login, {
    onSuccess: (data) => {
      console.log('useLogin: onSuccess called with data:', data)
      toast.success('Đăng nhập thành công!')
    },
    onError: (error) => {
      console.error('useLogin: onError called with error:', error)
      toast.error(error.message || 'Đăng nhập thất bại')
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()

  return useMutation(logout, {
    onSuccess: () => {
      toast.success('Đăng xuất thành công!')
    },
    onError: (error) => {
      toast.error(error.message || 'Đăng xuất thất bại')
    },
  })
}

export const useRegister = () => {
  return useMutation(authAPI.register, {
    onSuccess: (data) => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại'
      toast.error(errorMessage)
    },
  })
}

export const useForgotPassword = () => {
  return useMutation(authAPI.forgotPassword, {
    onSuccess: () => {
      toast.success('Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gửi email khôi phục thất bại'
      toast.error(errorMessage)
    },
  })
}

export const useResetPassword = () => {
  return useMutation(
    ({ token, password }) => authAPI.resetPassword(token, password),
    {
      onSuccess: () => {
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.')
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Đặt lại mật khẩu thất bại'
        toast.error(errorMessage)
      },
    }
  )
}

export const useChangePassword = () => {
  return useMutation(async ({ currentPassword, newPassword }) => {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      throw new Error('Change password failed')
    }

    return response.json()
  }, {
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!')
    },
    onError: (error) => {
      toast.error(error.message || 'Đổi mật khẩu thất bại')
    },
  })
}

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore()

  return useMutation(async (userData) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Update profile failed')
    }

    const data = await response.json()
    updateUser(data.user)
    return data
  }, {
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công!')
    },
    onError: (error) => {
      toast.error(error.message || 'Cập nhật thông tin thất bại')
    },
  })
}

export const useRefreshToken = () => {
  const { token, refreshToken, updateUser } = useAuthStore()

  return useMutation(async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }

    const data = await response.json()
    updateUser(data.user)
    return data
  }, {
    onError: (error) => {
      // If refresh fails, logout user
      const { logout } = useAuthStore.getState()
      logout()
      toast.error('Phiên đăng nhập đã hết hạn')
    },
  })
}