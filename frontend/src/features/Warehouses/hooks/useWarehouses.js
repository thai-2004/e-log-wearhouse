import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warehousesAPI } from '../api/warehousesService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách kho
export const useWarehouses = (params = {}) => {
  return useQuery(
    ['warehouses', params],
    () => warehousesAPI.getWarehouses(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      cacheTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin kho theo ID
export const useWarehouse = (id) => {
  return useQuery(
    ['warehouse', id],
    () => warehousesAPI.getWarehouseById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo kho mới
export const useCreateWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation(warehousesAPI.createWarehouse, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['warehouses'])
      toast.success('Tạo kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo kho thất bại')
    },
  })
}

// Hook để cập nhật kho
export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => warehousesAPI.updateWarehouse(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouses'])
        queryClient.invalidateQueries(['warehouse', variables.id])
        toast.success('Cập nhật kho thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật kho thất bại')
      },
    }
  )
}

// Hook để xóa kho
export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation(warehousesAPI.deleteWarehouse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses'])
      toast.success('Xóa kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa kho thất bại')
    },
  })
}

// Hook để lấy danh sách sản phẩm trong kho
export const useWarehouseProducts = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'products', params],
    () => warehousesAPI.getWarehouseProducts(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê kho
export const useWarehouseStats = (id) => {
  return useQuery(
    ['warehouse', id, 'stats'],
    () => warehousesAPI.getWarehouseStats(id),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy lịch sử hoạt động kho
export const useWarehouseHistory = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'history', params],
    () => warehousesAPI.getWarehouseHistory(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách nhân viên kho
export const useWarehouseStaff = (id) => {
  return useQuery(
    ['warehouse', id, 'staff'],
    () => warehousesAPI.getWarehouseStaff(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm nhân viên vào kho
export const useAddWarehouseStaff = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, staffData }) => warehousesAPI.addWarehouseStaff(id, staffData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'staff'])
        toast.success('Thêm nhân viên thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm nhân viên thất bại')
      },
    }
  )
}

// Hook để xóa nhân viên khỏi kho
export const useRemoveWarehouseStaff = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, staffId }) => warehousesAPI.removeWarehouseStaff(id, staffId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'staff'])
        toast.success('Xóa nhân viên thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa nhân viên thất bại')
      },
    }
  )
}

// Hook để cập nhật vai trò nhân viên trong kho
export const useUpdateWarehouseStaffRole = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, staffId, roleData }) => warehousesAPI.updateWarehouseStaffRole(id, staffId, roleData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'staff'])
        toast.success('Cập nhật vai trò thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật vai trò thất bại')
      },
    }
  )
}

// Hook để lấy danh sách khu vực trong kho
export const useWarehouseZones = (id) => {
  return useQuery(
    ['warehouse', id, 'zones'],
    () => warehousesAPI.getWarehouseZones(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo khu vực mới trong kho
export const useCreateWarehouseZone = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, zoneData }) => warehousesAPI.createWarehouseZone(id, zoneData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'zones'])
        toast.success('Tạo khu vực thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo khu vực thất bại')
      },
    }
  )
}

// Hook để cập nhật khu vực trong kho
export const useUpdateWarehouseZone = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, zoneId, zoneData }) => warehousesAPI.updateWarehouseZone(id, zoneId, zoneData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'zones'])
        toast.success('Cập nhật khu vực thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật khu vực thất bại')
      },
    }
  )
}

// Hook để xóa khu vực trong kho
export const useDeleteWarehouseZone = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, zoneId }) => warehousesAPI.deleteWarehouseZone(id, zoneId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'zones'])
        toast.success('Xóa khu vực thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa khu vực thất bại')
      },
    }
  )
}

// Hook để lấy danh sách kệ trong kho
export const useWarehouseShelves = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'shelves', params],
    () => warehousesAPI.getWarehouseShelves(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo kệ mới trong kho
export const useCreateWarehouseShelf = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, shelfData }) => warehousesAPI.createWarehouseShelf(id, shelfData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'shelves'])
        toast.success('Tạo kệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo kệ thất bại')
      },
    }
  )
}

// Hook để cập nhật kệ trong kho
export const useUpdateWarehouseShelf = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, shelfId, shelfData }) => warehousesAPI.updateWarehouseShelf(id, shelfId, shelfData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'shelves'])
        toast.success('Cập nhật kệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật kệ thất bại')
      },
    }
  )
}

// Hook để xóa kệ trong kho
export const useDeleteWarehouseShelf = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, shelfId }) => warehousesAPI.deleteWarehouseShelf(id, shelfId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'shelves'])
        toast.success('Xóa kệ thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa kệ thất bại')
      },
    }
  )
}

// Hook để lấy danh sách vị trí trong kho
export const useWarehouseLocations = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'locations', params],
    () => warehousesAPI.getWarehouseLocations(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo vị trí mới trong kho
export const useCreateWarehouseLocation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, locationData }) => warehousesAPI.createWarehouseLocation(id, locationData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'locations'])
        toast.success('Tạo vị trí thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo vị trí thất bại')
      },
    }
  )
}

// Hook để cập nhật vị trí trong kho
export const useUpdateWarehouseLocation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, locationId, locationData }) => warehousesAPI.updateWarehouseLocation(id, locationId, locationData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'locations'])
        toast.success('Cập nhật vị trí thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật vị trí thất bại')
      },
    }
  )
}

// Hook để xóa vị trí trong kho
export const useDeleteWarehouseLocation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, locationId }) => warehousesAPI.deleteWarehouseLocation(id, locationId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'locations'])
        toast.success('Xóa vị trí thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa vị trí thất bại')
      },
    }
  )
}

// Hook để lấy danh sách phiếu nhập kho
export const useWarehouseInbounds = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'inbounds', params],
    () => warehousesAPI.getWarehouseInbounds(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách phiếu xuất kho
export const useWarehouseOutbounds = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'outbounds', params],
    () => warehousesAPI.getWarehouseOutbounds(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách điều chỉnh tồn kho
export const useWarehouseAdjustments = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'adjustments', params],
    () => warehousesAPI.getWarehouseAdjustments(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách chuyển kho
export const useWarehouseTransfers = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'transfers', params],
    () => warehousesAPI.getWarehouseTransfers(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kiểm kê
export const useWarehouseInventories = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'inventories', params],
    () => warehousesAPI.getWarehouseInventories(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để tạo phiếu kiểm kê
export const useCreateWarehouseInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, inventoryData }) => warehousesAPI.createWarehouseInventory(id, inventoryData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'inventories'])
        toast.success('Tạo phiếu kiểm kê thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo phiếu kiểm kê thất bại')
      },
    }
  )
}

// Hook để cập nhật phiếu kiểm kê
export const useUpdateWarehouseInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, inventoryId, inventoryData }) => warehousesAPI.updateWarehouseInventory(id, inventoryId, inventoryData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'inventories'])
        toast.success('Cập nhật phiếu kiểm kê thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật phiếu kiểm kê thất bại')
      },
    }
  )
}

// Hook để xóa phiếu kiểm kê
export const useDeleteWarehouseInventory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, inventoryId }) => warehousesAPI.deleteWarehouseInventory(id, inventoryId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'inventories'])
        toast.success('Xóa phiếu kiểm kê thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa phiếu kiểm kê thất bại')
      },
    }
  )
}

// Hook để lấy danh sách cảnh báo kho
export const useWarehouseAlerts = (id) => {
  return useQuery(
    ['warehouse', id, 'alerts'],
    () => warehousesAPI.getWarehouseAlerts(id),
    {
      enabled: !!id,
      staleTime: 30 * 1000, // 30 giây
      retry: 2,
    }
  )
}

// Hook để đánh dấu cảnh báo đã xử lý
export const useMarkAlertAsResolved = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, alertId }) => warehousesAPI.markAlertAsResolved(id, alertId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'alerts'])
        toast.success('Đánh dấu cảnh báo đã xử lý!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đánh dấu cảnh báo thất bại')
      },
    }
  )
}

// Hook để lấy danh sách báo cáo kho
export const useWarehouseReports = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'reports', params],
    () => warehousesAPI.getWarehouseReports(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo tồn kho
export const useWarehouseStockReport = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'stock-report', params],
    () => warehousesAPI.getWarehouseStockReport(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo xuất nhập kho
export const useWarehouseMovementReport = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'movement-report', params],
    () => warehousesAPI.getWarehouseMovementReport(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo hiệu suất kho
export const useWarehousePerformanceReport = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'performance-report', params],
    () => warehousesAPI.getWarehousePerformanceReport(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sử dụng không gian
export const useWarehouseSpaceReport = (id) => {
  return useQuery(
    ['warehouse', id, 'space-report'],
    () => warehousesAPI.getWarehouseSpaceReport(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo nhiệt độ và độ ẩm
export const useWarehouseEnvironmentReport = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'environment-report', params],
    () => warehousesAPI.getWarehouseEnvironmentReport(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách thiết bị kho
export const useWarehouseEquipment = (id) => {
  return useQuery(
    ['warehouse', id, 'equipment'],
    () => warehousesAPI.getWarehouseEquipment(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm thiết bị vào kho
export const useAddWarehouseEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, equipmentData }) => warehousesAPI.addWarehouseEquipment(id, equipmentData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'equipment'])
        toast.success('Thêm thiết bị thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thêm thiết bị thất bại')
      },
    }
  )
}

// Hook để cập nhật thiết bị kho
export const useUpdateWarehouseEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, equipmentId, equipmentData }) => warehousesAPI.updateWarehouseEquipment(id, equipmentId, equipmentData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'equipment'])
        toast.success('Cập nhật thiết bị thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật thiết bị thất bại')
      },
    }
  )
}

// Hook để xóa thiết bị khỏi kho
export const useRemoveWarehouseEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, equipmentId }) => warehousesAPI.removeWarehouseEquipment(id, equipmentId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'equipment'])
        toast.success('Xóa thiết bị thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa thiết bị thất bại')
      },
    }
  )
}

// Hook để lấy danh sách bảo trì thiết bị
export const useWarehouseMaintenance = (id, params = {}) => {
  return useQuery(
    ['warehouse', id, 'maintenance', params],
    () => warehousesAPI.getWarehouseMaintenance(id, params),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tạo lịch bảo trì
export const useCreateWarehouseMaintenance = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, maintenanceData }) => warehousesAPI.createWarehouseMaintenance(id, maintenanceData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'maintenance'])
        toast.success('Tạo lịch bảo trì thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo lịch bảo trì thất bại')
      },
    }
  )
}

// Hook để cập nhật lịch bảo trì
export const useUpdateWarehouseMaintenance = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, maintenanceId, maintenanceData }) => warehousesAPI.updateWarehouseMaintenance(id, maintenanceId, maintenanceData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'maintenance'])
        toast.success('Cập nhật lịch bảo trì thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật lịch bảo trì thất bại')
      },
    }
  )
}

// Hook để xóa lịch bảo trì
export const useDeleteWarehouseMaintenance = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, maintenanceId }) => warehousesAPI.deleteWarehouseMaintenance(id, maintenanceId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'maintenance'])
        toast.success('Xóa lịch bảo trì thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa lịch bảo trì thất bại')
      },
    }
  )
}

// Hook để lấy danh sách quyền truy cập kho
export const useWarehousePermissions = (id) => {
  return useQuery(
    ['warehouse', id, 'permissions'],
    () => warehousesAPI.getWarehousePermissions(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để cập nhật quyền truy cập kho
export const useUpdateWarehousePermissions = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, permissionsData }) => warehousesAPI.updateWarehousePermissions(id, permissionsData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['warehouse', variables.id, 'permissions'])
        toast.success('Cập nhật quyền truy cập thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật quyền truy cập thất bại')
      },
    }
  )
}

// Hook để lấy danh sách kho theo loại
export const useWarehousesByType = (type, params = {}) => {
  return useQuery(
    ['warehouses', 'type', type, params],
    () => warehousesAPI.getWarehousesByType(type, params),
    {
      enabled: !!type,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo trạng thái
export const useWarehousesByStatus = (status, params = {}) => {
  return useQuery(
    ['warehouses', 'status', status, params],
    () => warehousesAPI.getWarehousesByStatus(status, params),
    {
      enabled: !!status,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo khu vực
export const useWarehousesByRegion = (region, params = {}) => {
  return useQuery(
    ['warehouses', 'region', region, params],
    () => warehousesAPI.getWarehousesByRegion(region, params),
    {
      enabled: !!region,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo người quản lý
export const useWarehousesByManager = (managerId, params = {}) => {
  return useQuery(
    ['warehouses', 'manager', managerId, params],
    () => warehousesAPI.getWarehousesByManager(managerId, params),
    {
      enabled: !!managerId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tìm kiếm kho
export const useSearchWarehouses = (query) => {
  return useQuery(
    ['warehouses', 'search', query],
    () => warehousesAPI.searchWarehouses(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho gần đây
export const useRecentWarehouses = (limit = 10) => {
  return useQuery(
    ['recent-warehouses', limit],
    () => warehousesAPI.getRecentWarehouses(limit),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho phổ biến
export const usePopularWarehouses = (limit = 10) => {
  return useQuery(
    ['popular-warehouses', limit],
    () => warehousesAPI.getPopularWarehouses(limit),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho được đề xuất
export const useRecommendedWarehouses = (limit = 10) => {
  return useQuery(
    ['recommended-warehouses', limit],
    () => warehousesAPI.getRecommendedWarehouses(limit),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê tổng quan kho
export const useWarehousesOverview = () => {
  return useQuery(
    ['warehouses-overview'],
    warehousesAPI.getWarehousesOverview,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có cảnh báo
export const useWarehousesWithAlerts = () => {
  return useQuery(
    ['warehouses-with-alerts'],
    warehousesAPI.getWarehousesWithAlerts,
    {
      staleTime: 30 * 1000, // 30 giây
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có tồn kho thấp
export const useWarehousesWithLowStock = () => {
  return useQuery(
    ['warehouses-with-low-stock'],
    warehousesAPI.getWarehousesWithLowStock,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có tồn kho cao
export const useWarehousesWithHighStock = () => {
  return useQuery(
    ['warehouses-with-high-stock'],
    warehousesAPI.getWarehousesWithHighStock,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có sản phẩm hết hạn
export const useWarehousesWithExpiredProducts = () => {
  return useQuery(
    ['warehouses-with-expired-products'],
    warehousesAPI.getWarehousesWithExpiredProducts,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có sản phẩm sắp hết hạn
export const useWarehousesWithExpiringProducts = () => {
  return useQuery(
    ['warehouses-with-expiring-products'],
    warehousesAPI.getWarehousesWithExpiringProducts,
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có sản phẩm tồn kho lâu
export const useWarehousesWithSlowMovingProducts = () => {
  return useQuery(
    ['warehouses-with-slow-moving-products'],
    warehousesAPI.getWarehousesWithSlowMovingProducts,
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho có sản phẩm bán chạy
export const useWarehousesWithFastMovingProducts = () => {
  return useQuery(
    ['warehouses-with-fast-moving-products'],
    warehousesAPI.getWarehousesWithFastMovingProducts,
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo hiệu suất
export const useWarehousesByPerformance = (params = {}) => {
  return useQuery(
    ['warehouses-by-performance', params],
    () => warehousesAPI.getWarehousesByPerformance(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo sử dụng không gian
export const useWarehousesBySpaceUsage = (params = {}) => {
  return useQuery(
    ['warehouses-by-space-usage', params],
    () => warehousesAPI.getWarehousesBySpaceUsage(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo chi phí vận hành
export const useWarehousesByOperatingCost = (params = {}) => {
  return useQuery(
    ['warehouses-by-operating-cost', params],
    () => warehousesAPI.getWarehousesByOperatingCost(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo doanh thu
export const useWarehousesByRevenue = (params = {}) => {
  return useQuery(
    ['warehouses-by-revenue', params],
    () => warehousesAPI.getWarehousesByRevenue(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo lợi nhuận
export const useWarehousesByProfit = (params = {}) => {
  return useQuery(
    ['warehouses-by-profit', params],
    () => warehousesAPI.getWarehousesByProfit(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo ROI
export const useWarehousesByROI = (params = {}) => {
  return useQuery(
    ['warehouses-by-roi', params],
    () => warehousesAPI.getWarehousesByROI(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo thời gian hoạt động
export const useWarehousesByOperatingHours = (params = {}) => {
  return useQuery(
    ['warehouses-by-operating-hours', params],
    () => warehousesAPI.getWarehousesByOperatingHours(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng nhân viên
export const useWarehousesByStaffCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-staff-count', params],
    () => warehousesAPI.getWarehousesByStaffCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng thiết bị
export const useWarehousesByEquipmentCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-equipment-count', params],
    () => warehousesAPI.getWarehousesByEquipmentCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng sản phẩm
export const useWarehousesByProductCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-product-count', params],
    () => warehousesAPI.getWarehousesByProductCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng khu vực
export const useWarehousesByZoneCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-zone-count', params],
    () => warehousesAPI.getWarehousesByZoneCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng kệ
export const useWarehousesByShelfCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-shelf-count', params],
    () => warehousesAPI.getWarehousesByShelfCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách kho theo số lượng vị trí
export const useWarehousesByLocationCount = (params = {}) => {
  return useQuery(
    ['warehouses-by-location-count', params],
    () => warehousesAPI.getWarehousesByLocationCount(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}
