import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../api/inventoryService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách tồn kho
export const useInventory = (params = {}) => {
  return useQuery(
    ['inventory', params],
    () => inventoryAPI.getInventory(params),
    {
      staleTime: 0, // Luôn coi là stale để force refresh
      cacheTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
      refetchOnMount: true, // Force refetch khi mount
      refetchOnWindowFocus: true, // Force refetch khi focus window
    }
  )
}

// Hook để lấy tồn kho theo sản phẩm
export const useInventoryByProduct = (productId) => {
  return useQuery(
    ['inventory', 'product', productId],
    () => inventoryAPI.getInventoryByProduct(productId),
    {
      enabled: !!productId,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy tồn kho theo kho
export const useInventoryByWarehouse = (warehouseId) => {
  return useQuery(
    ['inventory', 'warehouse', warehouseId],
    () => inventoryAPI.getInventoryByWarehouse(warehouseId),
    {
      enabled: !!warehouseId,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy tồn kho theo vị trí
export const useInventoryByLocation = (locationId) => {
  return useQuery(
    ['inventory', 'location', locationId],
    () => inventoryAPI.getInventoryByLocation(locationId),
    {
      enabled: !!locationId,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm sắp hết hàng
export const useLowStockItems = () => {
  return useQuery(
    ['inventory', 'low-stock'],
    inventoryAPI.getLowStockItems,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm hết hàng
export const useZeroStockItems = () => {
  return useQuery(
    ['inventory', 'zero-stock'],
    inventoryAPI.getZeroStockItems,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm tồn kho cao
export const useOverstockItems = () => {
  return useQuery(
    ['inventory', 'overstock'],
    inventoryAPI.getOverstockItems,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy lịch sử di chuyển tồn kho
export const useInventoryMovements = (params = {}) => {
  return useQuery(
    ['inventory', 'movements', params],
    () => inventoryAPI.getInventoryMovements(params),
    {
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để điều chỉnh tồn kho
export const useAdjustInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(inventoryAPI.adjustInventory, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['inventory', 'movements'])
      toast.success('Điều chỉnh tồn kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Điều chỉnh tồn kho thất bại')
    },
  })
}

// Hook để cập nhật tồn kho
export const useUpdateInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => inventoryAPI.updateInventory(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inventory'])
        queryClient.invalidateQueries(['inventory', 'product', variables.id])
        toast.success('Cập nhật tồn kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật tồn kho thất bại')
      },
    }
  )
}

// Hook để tạo bản ghi tồn kho mới
export const useCreateInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(inventoryAPI.createInventory, {
    onSuccess: (data) => {
      // Invalidate và refetch tất cả queries liên quan đến inventory
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['inventory', 'low-stock'])
      queryClient.invalidateQueries(['inventory', 'zero-stock'])
      queryClient.invalidateQueries(['inventory', 'overstock'])
      
      // Force refetch ngay lập tức
      queryClient.refetchQueries(['inventory'])
      
      toast.success('Tạo bản ghi tồn kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo bản ghi tồn kho thất bại')
    },
  })
}

// Hook để xóa bản ghi tồn kho
export const useDeleteInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(inventoryAPI.deleteInventory, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory'])
      toast.success('Xóa bản ghi tồn kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa bản ghi tồn kho thất bại')
    },
  })
}

// Hook để chuyển kho
export const useTransferInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(inventoryAPI.transferInventory, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['inventory', 'movements'])
      toast.success('Chuyển kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Chuyển kho thất bại')
    },
  })
}

// Hook để kiểm kê tồn kho
export const useConductStocktake = () => {
  const queryClient = useQueryClient()

  return useMutation(inventoryAPI.conductStocktake, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['inventory', 'stocktake-history'])
      toast.success('Kiểm kê tồn kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kiểm kê tồn kho thất bại')
    },
  })
}

// Hook để lấy lịch sử kiểm kê
export const useStocktakeHistory = (params = {}) => {
  return useQuery(
    ['inventory', 'stocktake-history', params],
    () => inventoryAPI.getStocktakeHistory(params),
    {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để cập nhật giá trị tồn kho
export const useUpdateInventoryValue = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, valueData }) => inventoryAPI.updateInventoryValue(id, valueData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['inventory'])
        queryClient.invalidateQueries(['inventory', 'product', variables.id])
        toast.success('Cập nhật giá trị tồn kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật giá trị tồn kho thất bại')
      },
    }
  )
}

// Hook để lấy cảnh báo tồn kho
export const useInventoryAlerts = () => {
  return useQuery(
    ['inventory', 'alerts'],
    inventoryAPI.getInventoryAlerts,
    {
      staleTime: 30 * 1000, // 30 giây
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo tồn kho
export const useInventoryReport = (params = {}) => {
  return useQuery(
    ['inventory', 'report', params],
    () => inventoryAPI.getInventoryReport(params),
    {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để xuất báo cáo tồn kho
export const useExportInventory = () => {
  return useMutation(
    (params) => inventoryAPI.exportInventory(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất báo cáo tồn kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất báo cáo tồn kho thất bại')
      },
    }
  )
}
