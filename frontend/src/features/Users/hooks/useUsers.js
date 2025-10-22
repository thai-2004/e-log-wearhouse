import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../api/usersService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách người dùng
export const useUsers = (params = {}) => {
  return useQuery(
    ['users', params],
    () => usersAPI.getUsers(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      cacheTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin người dùng theo ID
export const useUser = (id) => {
  return useQuery(
    ['user', id],
    () => usersAPI.getUserById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo người dùng mới
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation(usersAPI.createUser, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users'])
      toast.success('Tạo người dùng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo người dùng thất bại')
    },
  })
}

// Hook để cập nhật người dùng
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => usersAPI.updateUser(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['users'])
        queryClient.invalidateQueries(['user', variables.id])
        toast.success('Cập nhật người dùng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật người dùng thất bại')
      },
    }
  )
}

// Hook để xóa người dùng
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Xóa người dùng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại')
    },
  })
}

// Hook để cập nhật trạng thái người dùng
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, status }) => usersAPI.updateUserStatus(id, status),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['users'])
        queryClient.invalidateQueries(['user', variables.id])
        toast.success('Cập nhật trạng thái thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại')
      },
    }
  )
}

// Hook để đặt lại mật khẩu
export const useResetPassword = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, newPassword }) => usersAPI.resetPassword(id, newPassword),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users'])
        toast.success('Đặt lại mật khẩu thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại')
      },
    }
  )
}

// Hook để thay đổi mật khẩu
export const useChangePassword = () => {
  return useMutation(usersAPI.changePassword, {
    onSuccess: () => {
      toast.success('Thay đổi mật khẩu thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thay đổi mật khẩu thất bại')
    },
  })
}

// Hook để cập nhật profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation(usersAPI.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user'])
      queryClient.invalidateQueries(['users'])
      toast.success('Cập nhật profile thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật profile thất bại')
    },
  })
}

// Hook để upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, file }) => usersAPI.uploadAvatar(id, file),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.id])
        queryClient.invalidateQueries(['users'])
        toast.success('Upload avatar thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload avatar thất bại')
      },
    }
  )
}

// Hook để lấy danh sách vai trò
export const useRoles = () => {
  return useQuery(
    ['roles'],
    usersAPI.getRoles,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để gán vai trò
export const useAssignRole = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ userId, roleId }) => usersAPI.assignRole(userId, roleId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.userId])
        queryClient.invalidateQueries(['users'])
        toast.success('Gán vai trò thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gán vai trò thất bại')
      },
    }
  )
}

// Hook để xóa vai trò
export const useRemoveRole = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ userId, roleId }) => usersAPI.removeRole(userId, roleId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.userId])
        queryClient.invalidateQueries(['users'])
        toast.success('Xóa vai trò thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa vai trò thất bại')
      },
    }
  )
}

// Hook để lấy danh sách quyền
export const usePermissions = () => {
  return useQuery(
    ['permissions'],
    usersAPI.getPermissions,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để gán quyền
export const useAssignPermission = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ userId, permissionId }) => usersAPI.assignPermission(userId, permissionId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.userId])
        queryClient.invalidateQueries(['users'])
        toast.success('Gán quyền thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gán quyền thất bại')
      },
    }
  )
}

// Hook để xóa quyền
export const useRemovePermission = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ userId, permissionId }) => usersAPI.removePermission(userId, permissionId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.userId])
        queryClient.invalidateQueries(['users'])
        toast.success('Xóa quyền thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa quyền thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử hoạt động
export const useUserActivity = (userId, params = {}) => {
  return useQuery(
    ['user', userId, 'activity', params],
    () => usersAPI.getUserActivity(userId, params),
    {
      enabled: !!userId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê người dùng
export const useUserStats = () => {
  return useQuery(
    ['user-stats'],
    usersAPI.getUserStats,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để xuất danh sách người dùng
export const useExportUsers = () => {
  return useMutation(
    (params) => usersAPI.exportUsers(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách người dùng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách người dùng thất bại')
      },
    }
  )
}

// Hook để import danh sách người dùng
export const useImportUsers = () => {
  const queryClient = useQueryClient()

  return useMutation(usersAPI.importUsers, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users'])
      toast.success(`Import thành công ${data.successCount} người dùng!`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import danh sách người dùng thất bại')
    },
  })
}

// Hook để mời người dùng
export const useInviteUser = () => {
  const queryClient = useQueryClient()

  return useMutation(usersAPI.inviteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Gửi lời mời thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi lời mời thất bại')
    },
  })
}

// Hook để xác nhận lời mời
export const useConfirmInvitation = () => {
  return useMutation(
    ({ token, data }) => usersAPI.confirmInvitation(token, data),
    {
      onSuccess: () => {
        toast.success('Xác nhận lời mời thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xác nhận lời mời thất bại')
      },
    }
  )
}
