import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateInventory } from '../hooks/useInventory'
import { useProducts } from '@features/Products/hooks/useProducts'
import { useWarehouses } from '@features/Warehouses/hooks/useWarehouses'
import { useWarehouse } from '@features/Warehouses/hooks/useWarehouses'

const InventoryForm = ({ onClose }) => {
  const createInventoryMutation = useCreateInventory()
  const { data: productsData } = useProducts({ limit: 100 })
  const { data: warehousesData } = useWarehouses({ limit: 100 })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: '',
      locationId: '',
      quantity: 0,
      reservedQuantity: 0,
    }
  })

  // Watch warehouseId để load locations khi warehouse thay đổi
  const selectedWarehouseId = watch('warehouseId')
  const { data: warehouseData } = useWarehouse(selectedWarehouseId)

  // Extract tất cả locations từ zones của warehouse
  const availableLocations = useMemo(() => {
    if (!warehouseData?.data?.warehouse?.zones) return []
    
    const locations = []
    warehouseData.data.warehouse.zones.forEach(zone => {
      if (zone.locations && zone.locations.length > 0) {
        zone.locations.forEach(location => {
          if (location.isActive !== false) { // Chỉ lấy locations active
            locations.push({
              _id: location._id,
              code: location.code,
              name: location.name,
              zoneCode: zone.code,
              zoneName: zone.name
            })
          }
        })
      }
    })
    return locations
  }, [warehouseData])

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      // Kiểm tra token trước khi submit
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) {
        toast.error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        return
      }

      try {
        const parsed = JSON.parse(authStorage)
        const token = parsed?.state?.token
        if (!token) {
          toast.error('Token không tồn tại. Vui lòng đăng nhập lại.')
          return
        }
      } catch (parseError) {
        toast.error('Lỗi xác thực. Vui lòng đăng nhập lại.')
        return
      }

      const formData = {
        productId: data.productId,
        warehouseId: data.warehouseId,
        locationId: data.locationId || undefined,
        quantity: parseInt(data.quantity) || 0,
        reservedQuantity: parseInt(data.reservedQuantity) || 0,
      }

      await createInventoryMutation.mutateAsync(formData)
      
      // Đợi một chút để đảm bảo cache được invalidate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      onClose()
    } catch (error) {
      
      // Xử lý các loại lỗi khác nhau
      const status = error.response?.status
      const errorData = error.response?.data
      
      if (status === 400) {
        // Validation error - hiển thị chi tiết lỗi
        const errorCode = errorData?.code
        let errorMessage = errorData?.message || 'Dữ liệu không hợp lệ'
        
        // Nếu là lỗi location code not found, hiển thị thêm danh sách codes có sẵn
        if (errorCode === 'LOCATION_CODE_NOT_FOUND' && errorData?.availableCodes && errorData.availableCodes.length > 0) {
          const availableCodesList = errorData.availableCodes.slice(0, 10).join(', ')
          errorMessage += `\nCác mã vị trí có sẵn trong kho: ${availableCodesList}${errorData.availableCodes.length >= 10 ? '...' : ''}`
        }
        
        const errors = errorData?.errors || []
        const errorDetails = errors.length > 0 
          ? errors.map(e => e.msg || e.message).join(', ')
          : errorMessage
        toast.error(`Lỗi validation: ${errorDetails}`)
      } else if (status === 401) {
        // Unauthorized - token invalid/expired
        // KHÔNG logout ở đây, để apiClient interceptor xử lý
        toast.error('Token không hợp lệ hoặc đã hết hạn. Hệ thống sẽ tự động refresh token hoặc yêu cầu đăng nhập lại.')
      } else if (status === 403) {
        // Forbidden - không đủ quyền
        toast.error('Bạn không có quyền tạo tồn kho. Vui lòng liên hệ quản trị viên.')
      } else if (status === 500) {
        // Server error
        toast.error('Lỗi server. Vui lòng thử lại sau.')
      } else {
        // Lỗi khác
        const errorMessage = errorData?.message || error.message || 'Có lỗi xảy ra khi tạo tồn kho'
        toast.error(`Lỗi: ${errorMessage}`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sản phẩm *
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('productId', {
            required: 'Sản phẩm là bắt buộc'
          })}
        >
          <option value="">Chọn sản phẩm</option>
          {productsData?.data?.products?.map((product) => (
            <option key={product._id || product.id} value={product._id || product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="text-sm text-red-600 mt-1">{errors.productId.message}</p>
        )}
      </div>

      {/* Warehouse Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kho *
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('warehouseId', {
            required: 'Kho là bắt buộc'
          })}
        >
          <option value="">Chọn kho</option>
          {warehousesData?.data?.warehouses?.map((warehouse) => (
            <option key={warehouse._id || warehouse.id} value={warehouse._id || warehouse.id}>
              {warehouse.name} ({warehouse.code || ''})
            </option>
          ))}
        </select>
        {errors.warehouseId && (
          <p className="text-sm text-red-600 mt-1">{errors.warehouseId.message}</p>
        )}
      </div>

      {/* Location Selection - Optional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vị trí (tùy chọn)
        </label>
        {selectedWarehouseId && availableLocations.length > 0 ? (
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('locationId')}
          >
            <option value="">Không chọn vị trí (để trống)</option>
            {availableLocations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.code} - {location.name} ({location.zoneCode})
              </option>
            ))}
          </select>
        ) : selectedWarehouseId && availableLocations.length === 0 ? (
          <>
            <Input
              type="text"
              placeholder="Kho này chưa có vị trí nào. Để trống hoặc nhập mã vị trí"
              {...register('locationId')}
            />
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ Kho này chưa có vị trí nào. Bạn có thể để trống hoặc nhập mã vị trí nếu biết.
            </p>
          </>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Chọn kho trước để xem danh sách vị trí, hoặc để trống"
              {...register('locationId')}
              disabled={!selectedWarehouseId}
            />
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng chọn kho trước để xem danh sách vị trí, hoặc để trống nếu không cần
            </p>
          </>
        )}
      </div>

      {/* Quantity */}
      <div>
        <Input
          label="Số lượng ban đầu *"
          type="number"
          step="1"
          placeholder="0"
          error={errors.quantity?.message}
          {...register('quantity', {
            required: 'Số lượng là bắt buộc',
            min: {
              value: 0,
              message: 'Số lượng phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Reserved Quantity */}
      <div>
        <Input
          label="Số lượng đã giữ"
          type="number"
          step="1"
          placeholder="0"
          error={errors.reservedQuantity?.message}
          {...register('reservedQuantity', {
            min: {
              value: 0,
              message: 'Số lượng đã giữ phải lớn hơn hoặc bằng 0'
            }
          })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Số lượng đã được đặt trước/giữ lại (tùy chọn, mặc định 0)
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={createInventoryMutation.isLoading}
          disabled={createInventoryMutation.isLoading}
        >
          Tạo mới
        </Button>
      </div>
    </form>
  )
}

export default InventoryForm
