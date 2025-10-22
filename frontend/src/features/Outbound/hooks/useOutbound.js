import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { outboundAPI } from '../api/outboundService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách phiếu xuất kho
export const useOutbounds = (params = {}) => {
  return useQuery(
    ['outbounds', params],
    () => outboundAPI.getOutbounds(params),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      cacheTime: 3 * 60 * 1000, // 3 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin phiếu xuất kho theo ID
export const useOutbound = (id) => {
  return useQuery(
    ['outbound', id],
    () => outboundAPI.getOutboundById(id),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo phiếu xuất kho mới
export const useCreateOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(outboundAPI.createOutbound, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['outbounds'])
      toast.success('Tạo phiếu xuất kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo phiếu xuất kho thất bại')
    },
  })
}

// Hook để cập nhật phiếu xuất kho
export const useUpdateOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => outboundAPI.updateOutbound(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbounds'])
        queryClient.invalidateQueries(['outbound', variables.id])
        toast.success('Cập nhật phiếu xuất kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật phiếu xuất kho thất bại')
      },
    }
  )
}

// Hook để xóa phiếu xuất kho
export const useDeleteOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(outboundAPI.deleteOutbound, {
    onSuccess: () => {
      queryClient.invalidateQueries(['outbounds'])
      toast.success('Xóa phiếu xuất kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa phiếu xuất kho thất bại')
    },
  })
}

// Hook để cập nhật trạng thái phiếu xuất kho
export const useUpdateOutboundStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, status }) => outboundAPI.updateOutboundStatus(id, status),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbounds'])
        queryClient.invalidateQueries(['outbound', variables.id])
        toast.success('Cập nhật trạng thái thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại')
      },
    }
  )
}

// Hook để xác nhận phiếu xuất kho
export const useConfirmOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(outboundAPI.confirmOutbound, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['outbounds'])
      queryClient.invalidateQueries(['outbound', variables])
      toast.success('Xác nhận phiếu xuất kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xác nhận phiếu xuất kho thất bại')
    },
  })
}

// Hook để hủy phiếu xuất kho
export const useCancelOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, reason }) => outboundAPI.cancelOutbound(id, reason),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbounds'])
        queryClient.invalidateQueries(['outbound', variables.id])
        toast.success('Hủy phiếu xuất kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Hủy phiếu xuất kho thất bại')
      },
    }
  )
}

// Hook để lấy danh sách sản phẩm trong phiếu xuất
export const useOutboundItems = (outboundId) => {
  return useQuery(
    ['outbound', outboundId, 'items'],
    () => outboundAPI.getOutboundItems(outboundId),
    {
      enabled: !!outboundId,
      staleTime: 1 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để thêm sản phẩm vào phiếu xuất
export const useAddOutboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, data }) => outboundAPI.addOutboundItem(outboundId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId, 'items'])
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Thêm sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm sản phẩm thất bại')
      },
    }
  )
}

// Hook để cập nhật sản phẩm trong phiếu xuất
export const useUpdateOutboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, itemId, data }) => outboundAPI.updateOutboundItem(outboundId, itemId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId, 'items'])
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Cập nhật sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại')
      },
    }
  )
}

// Hook để xóa sản phẩm khỏi phiếu xuất
export const useRemoveOutboundItem = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, itemId }) => outboundAPI.removeOutboundItem(outboundId, itemId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId, 'items'])
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Xóa sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại')
      },
    }
  )
}

// Hook để upload tài liệu đính kèm
export const useUploadOutboundAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, file }) => outboundAPI.uploadOutboundAttachment(outboundId, file),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Upload tài liệu thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload tài liệu thất bại')
      },
    }
  )
}

// Hook để xóa tài liệu đính kèm
export const useDeleteOutboundAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, attachmentId }) => outboundAPI.deleteOutboundAttachment(outboundId, attachmentId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Xóa tài liệu thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa tài liệu thất bại')
      },
    }
  )
}

// Hook để lấy lịch sử phiếu xuất kho
export const useOutboundHistory = (outboundId) => {
  return useQuery(
    ['outbound', outboundId, 'history'],
    () => outboundAPI.getOutboundHistory(outboundId),
    {
      enabled: !!outboundId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê phiếu xuất kho
export const useOutboundStats = (outboundId) => {
  return useQuery(
    ['outbound', outboundId, 'stats'],
    () => outboundAPI.getOutboundStats(outboundId),
    {
      enabled: !!outboundId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê tổng quan phiếu xuất kho
export const useOutboundsOverview = () => {
  return useQuery(
    ['outbounds-overview'],
    outboundAPI.getOutboundsOverview,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để xuất phiếu xuất kho
export const useExportOutbound = () => {
  return useMutation(
    (id) => outboundAPI.exportOutbound(id),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `outbound_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất phiếu xuất kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất phiếu xuất kho thất bại')
      },
    }
  )
}

// Hook để xuất danh sách phiếu xuất kho
export const useExportOutbounds = () => {
  return useMutation(
    (params) => outboundAPI.exportOutbounds(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `outbounds_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách phiếu xuất kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách phiếu xuất kho thất bại')
      },
    }
  )
}

// Hook để import phiếu xuất kho từ file
export const useImportOutbounds = () => {
  const queryClient = useQueryClient()

  return useMutation(outboundAPI.importOutbounds, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['outbounds'])
      toast.success(`Import thành công ${data.successCount} phiếu xuất kho!`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import phiếu xuất kho thất bại')
    },
  })
}

// Hook để tìm kiếm phiếu xuất kho
export const useSearchOutbounds = (query) => {
  return useQuery(
    ['outbounds', 'search', query],
    () => outboundAPI.searchOutbounds(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu xuất kho theo khách hàng
export const useOutboundsByCustomer = (customerId, params = {}) => {
  return useQuery(
    ['outbounds', 'customer', customerId, params],
    () => outboundAPI.getOutboundsByCustomer(customerId, params),
    {
      enabled: !!customerId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu xuất kho theo kho
export const useOutboundsByWarehouse = (warehouseId, params = {}) => {
  return useQuery(
    ['outbounds', 'warehouse', warehouseId, params],
    () => outboundAPI.getOutboundsByWarehouse(warehouseId, params),
    {
      enabled: !!warehouseId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy phiếu xuất kho theo sản phẩm
export const useOutboundsByProduct = (productId, params = {}) => {
  return useQuery(
    ['outbounds', 'product', productId, params],
    () => outboundAPI.getOutboundsByProduct(productId, params),
    {
      enabled: !!productId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo phiếu xuất kho từ đơn hàng
export const useCreateOutboundFromOrder = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ orderId, data }) => outboundAPI.createOutboundFromOrder(orderId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['outbounds'])
        toast.success('Tạo phiếu xuất kho từ đơn hàng thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo phiếu xuất kho từ đơn hàng thất bại')
      },
    }
  )
}

// Hook để sao chép phiếu xuất kho
export const useDuplicateOutbound = () => {
  const queryClient = useQueryClient()

  return useMutation(outboundAPI.duplicateOutbound, {
    onSuccess: () => {
      queryClient.invalidateQueries(['outbounds'])
      toast.success('Sao chép phiếu xuất kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Sao chép phiếu xuất kho thất bại')
    },
  })
}

// Hook để lấy danh sách phiếu xuất kho chờ xử lý
export const usePendingOutbounds = () => {
  return useQuery(
    ['outbounds', 'pending'],
    outboundAPI.getPendingOutbounds,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho đã hoàn thành
export const useCompletedOutbounds = (params = {}) => {
  return useQuery(
    ['outbounds', 'completed', params],
    () => outboundAPI.getCompletedOutbounds(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho bị hủy
export const useCancelledOutbounds = (params = {}) => {
  return useQuery(
    ['outbounds', 'cancelled', params],
    () => outboundAPI.getCancelledOutbounds(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tính toán tổng giá trị phiếu xuất
export const useCalculateOutboundTotal = () => {
  return useMutation(outboundAPI.calculateOutboundTotal, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tính toán tổng giá trị thất bại')
    },
  })
}

// Hook để kiểm tra tồn kho trước khi xuất
export const useCheckInventoryBeforeOutbound = () => {
  return useMutation(outboundAPI.checkInventoryBeforeOutbound, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kiểm tra tồn kho thất bại')
    },
  })
}

// Hook để lấy báo cáo phiếu xuất kho
export const useOutboundReport = (params = {}) => {
  return useQuery(
    ['outbounds', 'report', params],
    () => outboundAPI.getOutboundReport(params),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho theo ngày
export const useOutboundsByDate = (date, params = {}) => {
  return useQuery(
    ['outbounds', 'date', date, params],
    () => outboundAPI.getOutboundsByDate(date, params),
    {
      enabled: !!date,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho theo khoảng thời gian
export const useOutboundsByDateRange = (startDate, endDate, params = {}) => {
  return useQuery(
    ['outbounds', 'date-range', startDate, endDate, params],
    () => outboundAPI.getOutboundsByDateRange(startDate, endDate, params),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho theo loại
export const useOutboundsByType = (type, params = {}) => {
  return useQuery(
    ['outbounds', 'type', type, params],
    () => outboundAPI.getOutboundsByType(type, params),
    {
      enabled: !!type,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho theo phương thức vận chuyển
export const useOutboundsByShippingMethod = (shippingMethod, params = {}) => {
  return useQuery(
    ['outbounds', 'shipping', shippingMethod, params],
    () => outboundAPI.getOutboundsByShippingMethod(shippingMethod, params),
    {
      enabled: !!shippingMethod,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để cập nhật thông tin vận chuyển
export const useUpdateShippingInfo = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, shippingInfo }) => outboundAPI.updateShippingInfo(outboundId, shippingInfo),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        toast.success('Cập nhật thông tin vận chuyển thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật thông tin vận chuyển thất bại')
      },
    }
  )
}

// Hook để lấy mã vận đơn
export const useTrackingNumber = (outboundId) => {
  return useQuery(
    ['outbound', outboundId, 'tracking'],
    () => outboundAPI.getTrackingNumber(outboundId),
    {
      enabled: !!outboundId,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để cập nhật mã vận đơn
export const useUpdateTrackingNumber = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ outboundId, trackingNumber }) => outboundAPI.updateTrackingNumber(outboundId, trackingNumber),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['outbound', variables.outboundId])
        queryClient.invalidateQueries(['outbound', variables.outboundId, 'tracking'])
        toast.success('Cập nhật mã vận đơn thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật mã vận đơn thất bại')
      },
    }
  )
}
