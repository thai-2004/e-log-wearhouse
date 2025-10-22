import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersAPI } from '../api/customersService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách khách hàng
export const useCustomers = (params = {}) => {
  return useQuery(
    ['customers', params],
    () => customersAPI.getCustomers(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      cacheTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin khách hàng theo ID
export const useCustomer = (id) => {
  return useQuery(
    ['customer', id],
    () => customersAPI.getCustomerById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo khách hàng mới
export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation(customersAPI.createCustomer, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['customers'])
      toast.success('Tạo khách hàng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo khách hàng thất bại')
    },
  })
}

// Hook để cập nhật khách hàng
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => customersAPI.updateCustomer(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customers'])
        queryClient.invalidateQueries(['customer', variables.id])
        toast.success('Cập nhật khách hàng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật khách hàng thất bại')
      },
    }
  )
}

// Hook để xóa khách hàng
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation(customersAPI.deleteCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customers'])
      toast.success('Xóa khách hàng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa khách hàng thất bại')
    },
  })
}

// Hook để cập nhật trạng thái khách hàng
export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, status }) => customersAPI.updateCustomerStatus(id, status),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customers'])
        queryClient.invalidateQueries(['customer', variables.id])
        toast.success('Cập nhật trạng thái thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại')
      },
    }
  )
}

// Hook để upload avatar khách hàng
export const useUploadCustomerAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, file }) => customersAPI.uploadCustomerAvatar(id, file),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.id])
        queryClient.invalidateQueries(['customers'])
        toast.success('Upload avatar thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload avatar thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử giao dịch
export const useCustomerTransactions = (customerId, params = {}) => {
  return useQuery(
    ['customer', customerId, 'transactions', params],
    () => customersAPI.getCustomerTransactions(customerId, params),
    {
      enabled: !!customerId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy lịch sử đơn hàng
export const useCustomerOrders = (customerId, params = {}) => {
  return useQuery(
    ['customer', customerId, 'orders', params],
    () => customersAPI.getCustomerOrders(customerId, params),
    {
      enabled: !!customerId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê khách hàng
export const useCustomerStats = (customerId) => {
  return useQuery(
    ['customer', customerId, 'stats'],
    () => customersAPI.getCustomerStats(customerId),
    {
      enabled: !!customerId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách nhóm khách hàng
export const useCustomerGroups = () => {
  return useQuery(
    ['customer-groups'],
    customersAPI.getCustomerGroups,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để tạo nhóm khách hàng
export const useCreateCustomerGroup = () => {
  const queryClient = useQueryClient()

  return useMutation(customersAPI.createCustomerGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-groups'])
      toast.success('Tạo nhóm khách hàng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo nhóm khách hàng thất bại')
    },
  })
}

// Hook để cập nhật nhóm khách hàng
export const useUpdateCustomerGroup = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => customersAPI.updateCustomerGroup(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['customer-groups'])
        toast.success('Cập nhật nhóm khách hàng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật nhóm khách hàng thất bại')
      },
    }
  )
}

// Hook để xóa nhóm khách hàng
export const useDeleteCustomerGroup = () => {
  const queryClient = useQueryClient()

  return useMutation(customersAPI.deleteCustomerGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-groups'])
      toast.success('Xóa nhóm khách hàng thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa nhóm khách hàng thất bại')
    },
  })
}

// Hook để gán khách hàng vào nhóm
export const useAssignCustomerToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, groupId }) => customersAPI.assignCustomerToGroup(customerId, groupId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId])
        queryClient.invalidateQueries(['customers'])
        toast.success('Gán khách hàng vào nhóm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gán khách hàng vào nhóm thất bại')
      },
    }
  )
}

// Hook để xóa khách hàng khỏi nhóm
export const useRemoveCustomerFromGroup = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, groupId }) => customersAPI.removeCustomerFromGroup(customerId, groupId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId])
        queryClient.invalidateQueries(['customers'])
        toast.success('Xóa khách hàng khỏi nhóm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa khách hàng khỏi nhóm thất bại')
      },
    }
  )
}

// Hook để lấy danh sách địa chỉ
export const useCustomerAddresses = (customerId) => {
  return useQuery(
    ['customer', customerId, 'addresses'],
    () => customersAPI.getCustomerAddresses(customerId),
    {
      enabled: !!customerId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm địa chỉ
export const useAddCustomerAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, data }) => customersAPI.addCustomerAddress(customerId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId, 'addresses'])
        toast.success('Thêm địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm địa chỉ thất bại')
      },
    }
  )
}

// Hook để cập nhật địa chỉ
export const useUpdateCustomerAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, addressId, data }) => customersAPI.updateCustomerAddress(customerId, addressId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId, 'addresses'])
        toast.success('Cập nhật địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật địa chỉ thất bại')
      },
    }
  )
}

// Hook để xóa địa chỉ
export const useDeleteCustomerAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, addressId }) => customersAPI.deleteCustomerAddress(customerId, addressId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId, 'addresses'])
        toast.success('Xóa địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa địa chỉ thất bại')
      },
    }
  )
}

// Hook để đặt địa chỉ mặc định
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, addressId }) => customersAPI.setDefaultAddress(customerId, addressId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId, 'addresses'])
        toast.success('Đặt địa chỉ mặc định thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đặt địa chỉ mặc định thất bại')
      },
    }
  )
}

// Hook để lấy thống kê tổng quan
export const useCustomersOverview = () => {
  return useQuery(
    ['customers-overview'],
    customersAPI.getCustomersOverview,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để xuất danh sách khách hàng
export const useExportCustomers = () => {
  return useMutation(
    (params) => customersAPI.exportCustomers(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách khách hàng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách khách hàng thất bại')
      },
    }
  )
}

// Hook để import danh sách khách hàng
export const useImportCustomers = () => {
  const queryClient = useQueryClient()

  return useMutation(customersAPI.importCustomers, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['customers'])
      toast.success(`Import thành công ${data.successCount} khách hàng!`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import danh sách khách hàng thất bại')
    },
  })
}

// Hook để tìm kiếm khách hàng
export const useSearchCustomers = (query) => {
  return useQuery(
    ['customers', 'search', query],
    () => customersAPI.searchCustomers(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy khách hàng VIP
export const useVipCustomers = () => {
  return useQuery(
    ['customers', 'vip'],
    customersAPI.getVipCustomers,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để cập nhật điểm tích lũy
export const useUpdateCustomerPoints = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ customerId, points, reason }) => customersAPI.updateCustomerPoints(customerId, points, reason),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['customer', variables.customerId])
        queryClient.invalidateQueries(['customer', variables.customerId, 'points-history'])
        toast.success('Cập nhật điểm tích lũy thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật điểm tích lũy thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử điểm tích lũy
export const useCustomerPointsHistory = (customerId, params = {}) => {
  return useQuery(
    ['customer', customerId, 'points-history', params],
    () => customersAPI.getCustomerPointsHistory(customerId, params),
    {
      enabled: !!customerId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}
