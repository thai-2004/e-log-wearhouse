import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inboundAPI } from '../api/inboundService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách phiếu nhập kho
export const useInbounds = (params = {}) => {
  return useQuery(
    ['inbounds', params],
    () => inboundAPI.getInbounds(params),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      cacheTime: 3 * 60 * 1000, // 3 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin phiếu nhập kho theo ID
export const useInbound = (id) => {
  return useQuery(
    ['inbound', id],
    () => inboundAPI.getInboundById(id),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo phiếu nhập kho mới
export const useCreateInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(inboundAPI.createInbound, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['inbounds'])
      toast.success('Tạo phiếu nhập kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo phiếu nhập kho thất bại')
    },
  })
}

// Hook để cập nhật phiếu nhập kho
export const useUpdateInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => inboundAPI.updateInbound(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbounds'])
        queryClient.invalidateQueries(['inbound', variables.id])
        toast.success('Cập nhật phiếu nhập kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật phiếu nhập kho thất bại')
      },
    }
  )
}

// Hook để xóa phiếu nhập kho
export const useDeleteInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(inboundAPI.deleteInbound, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inbounds'])
      toast.success('Xóa phiếu nhập kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa phiếu nhập kho thất bại')
    },
  })
}

// Hook để cập nhật trạng thái phiếu nhập kho
export const useUpdateInboundStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, status }) => inboundAPI.updateInboundStatus(id, status),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbounds'])
        queryClient.invalidateQueries(['inbound', variables.id])
        toast.success('Cập nhật trạng thái thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại')
      },
    }
  )
}

// Hook để xác nhận phiếu nhập kho
export const useConfirmInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(inboundAPI.confirmInbound, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['inbounds'])
      queryClient.invalidateQueries(['inbound', variables])
      toast.success('Xác nhận phiếu nhập kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xác nhận phiếu nhập kho thất bại')
    },
  })
}

// Hook để hủy phiếu nhập kho
export const useCancelInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, reason }) => inboundAPI.cancelInbound(id, reason),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbounds'])
        queryClient.invalidateQueries(['inbound', variables.id])
        toast.success('Hủy phiếu nhập kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Hủy phiếu nhập kho thất bại')
      },
    }
  )
}

// Hook để lấy danh sách sản phẩm trong phiếu nhập
export const useInboundItems = (inboundId) => {
  return useQuery(
    ['inbound', inboundId, 'items'],
    () => inboundAPI.getInboundItems(inboundId),
    {
      enabled: !!inboundId,
      staleTime: 1 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để thêm sản phẩm vào phiếu nhập
export const useAddInboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ inboundId, data }) => inboundAPI.addInboundItem(inboundId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbound', variables.inboundId, 'items'])
        queryClient.invalidateQueries(['inbound', variables.inboundId])
        toast.success('Thêm sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm sản phẩm thất bại')
      },
    }
  )
}

// Hook để cập nhật sản phẩm trong phiếu nhập
export const useUpdateInboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ inboundId, itemId, data }) => inboundAPI.updateInboundItem(inboundId, itemId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbound', variables.inboundId, 'items'])
        queryClient.invalidateQueries(['inbound', variables.inboundId])
        toast.success('Cập nhật sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại')
      },
    }
  )
}

// Hook để xóa sản phẩm khỏi phiếu nhập
export const useRemoveInboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ inboundId, itemId }) => inboundAPI.removeInboundItem(inboundId, itemId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbound', variables.inboundId, 'items'])
        queryClient.invalidateQueries(['inbound', variables.inboundId])
        toast.success('Xóa sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại')
      },
    }
  )
}

// Hook để upload tài liệu đính kèm
export const useUploadInboundAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ inboundId, file }) => inboundAPI.uploadInboundAttachment(inboundId, file),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbound', variables.inboundId])
        toast.success('Upload tài liệu thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload tài liệu thất bại')
      },
    }
  )
}

// Hook để xóa tài liệu đính kèm
export const useDeleteInboundAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ inboundId, attachmentId }) => inboundAPI.deleteInboundAttachment(inboundId, attachmentId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inbound', variables.inboundId])
        toast.success('Xóa tài liệu thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa tài liệu thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử phiếu nhập kho
export const useInboundHistory = (inboundId) => {
  return useQuery(
    ['inbound', inboundId, 'history'],
    () => inboundAPI.getInboundHistory(inboundId),
    {
      enabled: !!inboundId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê phiếu nhập kho
export const useInboundStats = (inboundId) => {
  return useQuery(
    ['inbound', inboundId, 'stats'],
    () => inboundAPI.getInboundStats(inboundId),
    {
      enabled: !!inboundId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê tổng quan phiếu nhập kho
export const useInboundsOverview = () => {
  return useQuery(
    ['inbounds-overview'],
    inboundAPI.getInboundsOverview,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để xuất phiếu nhập kho
export const useExportInbound = () => {
  return useMutation(
    (id) => inboundAPI.exportInbound(id),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inbound_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất phiếu nhập kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất phiếu nhập kho thất bại')
      },
    }
  )
}

// Hook để xuất danh sách phiếu nhập kho
export const useExportInbounds = () => {
  return useMutation(
    (params) => inboundAPI.exportInbounds(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inbounds_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách phiếu nhập kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách phiếu nhập kho thất bại')
      },
    }
  )
}

// Hook để import phiếu nhập kho từ file
export const useImportInbounds = () => {
  const queryClient = useQueryClient()

  return useMutation(inboundAPI.importInbounds, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['inbounds'])
      toast.success(`Import thành công ${data.successCount} phiếu nhập kho!`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import phiếu nhập kho thất bại')
    },
  })
}

// Hook để tìm kiếm phiếu nhập kho
export const useSearchInbounds = (query) => {
  return useQuery(
    ['inbounds', 'search', query],
    () => inboundAPI.searchInbounds(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu nhập kho theo nhà cung cấp
export const useInboundsBySupplier = (supplierId, params = {}) => {
  return useQuery(
    ['inbounds', 'supplier', supplierId, params],
    () => inboundAPI.getInboundsBySupplier(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu nhập kho theo kho
export const useInboundsByWarehouse = (warehouseId, params = {}) => {
  return useQuery(
    ['inbounds', 'warehouse', warehouseId, params],
    () => inboundAPI.getInboundsByWarehouse(warehouseId, params),
    {
      enabled: !!warehouseId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu nhập kho theo sản phẩm
export const useInboundsByProduct = (productId, params = {}) => {
  return useQuery(
    ['inbounds', 'product', productId, params],
    () => inboundAPI.getInboundsByProduct(productId, params),
    {
      enabled: !!productId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo phiếu nhập kho từ đơn hàng
export const useCreateInboundFromOrder = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ orderId, data }) => inboundAPI.createInboundFromOrder(orderId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inbounds'])
        toast.success('Tạo phiếu nhập kho từ đơn hàng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo phiếu nhập kho từ đơn hàng thất bại')
      },
    }
  )
}

// Hook để sao chép phiếu nhập kho
export const useDuplicateInbound = () => {
  const queryClient = useQueryClient()

  return useMutation(inboundAPI.duplicateInbound, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inbounds'])
      toast.success('Sao chép phiếu nhập kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Sao chép phiếu nhập kho thất bại')
    },
  })
}

// Hook để lấy danh sách phiếu nhập kho chờ xử lý
export const usePendingInbounds = () => {
  return useQuery(
    ['inbounds', 'pending'],
    inboundAPI.getPendingInbounds,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu nhập kho đã hoàn thành
export const useCompletedInbounds = (params = {}) => {
  return useQuery(
    ['inbounds', 'completed', params],
    () => inboundAPI.getCompletedInbounds(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu nhập kho bị hủy
export const useCancelledInbounds = (params = {}) => {
  return useQuery(
    ['inbounds', 'cancelled', params],
    () => inboundAPI.getCancelledInbounds(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tính toán tổng giá trị phiếu nhập
export const useCalculateInboundTotal = () => {
  return useMutation(inboundAPI.calculateInboundTotal, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tính toán tổng giá trị thất bại')
    },
  })
}

// Hook để kiểm tra tồn kho trước khi nhập
export const useCheckInventoryBeforeInbound = () => {
  return useMutation(inboundAPI.checkInventoryBeforeInbound, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kiểm tra tồn kho thất bại')
    },
  })
}

// Hook để lấy báo cáo phiếu nhập kho
export const useInboundReport = (params = {}) => {
  return useQuery(
    ['inbounds', 'report', params],
    () => inboundAPI.getInboundReport(params),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu nhập kho theo ngày
export const useInboundsByDate = (date, params = {}) => {
  return useQuery(
    ['inbounds', 'date', date, params],
    () => inboundAPI.getInboundsByDate(date, params),
    {
      enabled: !!date,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu nhập kho theo khoảng thời gian
export const useInboundsByDateRange = (startDate, endDate, params = {}) => {
  return useQuery(
    ['inbounds', 'date-range', startDate, endDate, params],
    () => inboundAPI.getInboundsByDateRange(startDate, endDate, params),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}
