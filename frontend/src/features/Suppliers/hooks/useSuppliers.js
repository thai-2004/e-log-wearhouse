import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersAPI } from '../api/suppliersService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách nhà cung cấp
export const useSuppliers = (params = {}) => {
  return useQuery(
    ['suppliers', params],
    () => suppliersAPI.getSuppliers(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      cacheTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin nhà cung cấp theo ID
export const useSupplier = (id) => {
  return useQuery(
    ['supplier', id],
    () => suppliersAPI.getSupplierById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo nhà cung cấp mới
export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(suppliersAPI.createSupplier, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['suppliers'])
      toast.success('Tạo nhà cung cấp thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo nhà cung cấp thất bại')
    },
  })
}

// Hook để cập nhật nhà cung cấp
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => suppliersAPI.updateSupplier(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['suppliers'])
        queryClient.invalidateQueries(['supplier', variables.id])
        toast.success('Cập nhật nhà cung cấp thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật nhà cung cấp thất bại')
      },
    }
  )
}

// Hook để xóa nhà cung cấp
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(suppliersAPI.deleteSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers'])
      toast.success('Xóa nhà cung cấp thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa nhà cung cấp thất bại')
    },
  })
}

// Hook để cập nhật trạng thái nhà cung cấp
export const useUpdateSupplierStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, status }) => suppliersAPI.updateSupplierStatus(id, status),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['suppliers'])
        queryClient.invalidateQueries(['supplier', variables.id])
        toast.success('Cập nhật trạng thái thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại')
      },
    }
  )
}

// Hook để upload logo nhà cung cấp
export const useUploadSupplierLogo = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, file }) => suppliersAPI.uploadSupplierLogo(id, file),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.id])
        queryClient.invalidateQueries(['suppliers'])
        toast.success('Upload logo thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload logo thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử giao dịch
export const useSupplierTransactions = (supplierId, params = {}) => {
  return useQuery(
    ['supplier', supplierId, 'transactions', params],
    () => suppliersAPI.getSupplierTransactions(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy lịch sử đơn hàng
export const useSupplierOrders = (supplierId, params = {}) => {
  return useQuery(
    ['supplier', supplierId, 'orders', params],
    () => suppliersAPI.getSupplierOrders(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê nhà cung cấp
export const useSupplierStats = (supplierId) => {
  return useQuery(
    ['supplier', supplierId, 'stats'],
    () => suppliersAPI.getSupplierStats(supplierId),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách sản phẩm của nhà cung cấp
export const useSupplierProducts = (supplierId, params = {}) => {
  return useQuery(
    ['supplier', supplierId, 'products', params],
    () => suppliersAPI.getSupplierProducts(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm sản phẩm cho nhà cung cấp
export const useAddSupplierProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, data }) => suppliersAPI.addSupplierProduct(supplierId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'products'])
        toast.success('Thêm sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm sản phẩm thất bại')
      },
    }
  )
}

// Hook để cập nhật sản phẩm của nhà cung cấp
export const useUpdateSupplierProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, productId, data }) => suppliersAPI.updateSupplierProduct(supplierId, productId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'products'])
        toast.success('Cập nhật sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại')
      },
    }
  )
}

// Hook để xóa sản phẩm khỏi nhà cung cấp
export const useRemoveSupplierProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, productId }) => suppliersAPI.removeSupplierProduct(supplierId, productId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'products'])
        toast.success('Xóa sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại')
      },
    }
  )
}

// Hook để lấy danh sách địa chỉ
export const useSupplierAddresses = (supplierId) => {
  return useQuery(
    ['supplier', supplierId, 'addresses'],
    () => suppliersAPI.getSupplierAddresses(supplierId),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm địa chỉ
export const useAddSupplierAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, data }) => suppliersAPI.addSupplierAddress(supplierId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'addresses'])
        toast.success('Thêm địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm địa chỉ thất bại')
      },
    }
  )
}

// Hook để cập nhật địa chỉ
export const useUpdateSupplierAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, addressId, data }) => suppliersAPI.updateSupplierAddress(supplierId, addressId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'addresses'])
        toast.success('Cập nhật địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật địa chỉ thất bại')
      },
    }
  )
}

// Hook để xóa địa chỉ
export const useDeleteSupplierAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, addressId }) => suppliersAPI.deleteSupplierAddress(supplierId, addressId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'addresses'])
        toast.success('Xóa địa chỉ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa địa chỉ thất bại')
      },
    }
  )
}

// Hook để đặt địa chỉ mặc định
export const useSetDefaultSupplierAddress = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, addressId }) => suppliersAPI.setDefaultSupplierAddress(supplierId, addressId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'addresses'])
        toast.success('Đặt địa chỉ mặc định thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đặt địa chỉ mặc định thất bại')
      },
    }
  )
}

// Hook để lấy danh sách liên hệ
export const useSupplierContacts = (supplierId) => {
  return useQuery(
    ['supplier', supplierId, 'contacts'],
    () => suppliersAPI.getSupplierContacts(supplierId),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm liên hệ
export const useAddSupplierContact = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, data }) => suppliersAPI.addSupplierContact(supplierId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contacts'])
        toast.success('Thêm liên hệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm liên hệ thất bại')
      },
    }
  )
}

// Hook để cập nhật liên hệ
export const useUpdateSupplierContact = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, contactId, data }) => suppliersAPI.updateSupplierContact(supplierId, contactId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contacts'])
        toast.success('Cập nhật liên hệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật liên hệ thất bại')
      },
    }
  )
}

// Hook để xóa liên hệ
export const useDeleteSupplierContact = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, contactId }) => suppliersAPI.deleteSupplierContact(supplierId, contactId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contacts'])
        toast.success('Xóa liên hệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa liên hệ thất bại')
      },
    }
  )
}

// Hook để lấy thống kê tổng quan
export const useSuppliersOverview = () => {
  return useQuery(
    ['suppliers-overview'],
    suppliersAPI.getSuppliersOverview,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để xuất danh sách nhà cung cấp
export const useExportSuppliers = () => {
  return useMutation(
    (params) => suppliersAPI.exportSuppliers(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách nhà cung cấp thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách nhà cung cấp thất bại')
      },
    }
  )
}

// Hook để import danh sách nhà cung cấp
export const useImportSuppliers = () => {
  const queryClient = useQueryClient()

  return useMutation(suppliersAPI.importSuppliers, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['suppliers'])
      toast.success(`Import thành công ${data.successCount} nhà cung cấp!`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import danh sách nhà cung cấp thất bại')
    },
  })
}

// Hook để tìm kiếm nhà cung cấp
export const useSearchSuppliers = (query) => {
  return useQuery(
    ['suppliers', 'search', query],
    () => suppliersAPI.searchSuppliers(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy nhà cung cấp tốt nhất
export const useTopSuppliers = () => {
  return useQuery(
    ['suppliers', 'top'],
    suppliersAPI.getTopSuppliers,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để đánh giá nhà cung cấp
export const useRateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, rating, comment }) => suppliersAPI.rateSupplier(supplierId, rating, comment),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId])
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'ratings'])
        toast.success('Đánh giá thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đánh giá thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử đánh giá
export const useSupplierRatings = (supplierId, params = {}) => {
  return useQuery(
    ['supplier', supplierId, 'ratings', params],
    () => suppliersAPI.getSupplierRatings(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách hợp đồng
export const useSupplierContracts = (supplierId, params = {}) => {
  return useQuery(
    ['supplier', supplierId, 'contracts', params],
    () => suppliersAPI.getSupplierContracts(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo hợp đồng mới
export const useCreateSupplierContract = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, data }) => suppliersAPI.createSupplierContract(supplierId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contracts'])
        toast.success('Tạo hợp đồng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo hợp đồng thất bại')
      },
    }
  )
}

// Hook để cập nhật hợp đồng
export const useUpdateSupplierContract = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, contractId, data }) => suppliersAPI.updateSupplierContract(supplierId, contractId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contracts'])
        toast.success('Cập nhật hợp đồng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật hợp đồng thất bại')
      },
    }
  )
}

// Hook để xóa hợp đồng
export const useDeleteSupplierContract = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ supplierId, contractId }) => suppliersAPI.deleteSupplierContract(supplierId, contractId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['supplier', variables.supplierId, 'contracts'])
        toast.success('Xóa hợp đồng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa hợp đồng thất bại')
      },
    }
  )
}
