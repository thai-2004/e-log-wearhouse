import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateInventory } from '../hooks/useInventory'
import { useProducts } from '@features/Products/hooks/useProducts'
import { useWarehouses } from '@features/Warehouses/hooks/useWarehouses'

const InventoryForm = ({ onClose }) => {
  const createInventoryMutation = useCreateInventory()
  const { data: productsData } = useProducts({ limit: 100 })
  const { data: warehousesData } = useWarehouses({ limit: 100 })

  const {
    register,
    handleSubmit,
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

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const formData = {
        productId: data.productId,
        warehouseId: data.warehouseId,
        locationId: data.locationId || undefined,
        quantity: parseInt(data.quantity) || 0,
        reservedQuantity: parseInt(data.reservedQuantity) || 0,
      }

      await createInventoryMutation.mutateAsync(formData)
      onClose()
    } catch (error) {
      console.error('Error creating inventory:', error)
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
        <Input
          type="text"
          placeholder="Nhập ID vị trí hoặc để trống"
          {...register('locationId')}
        />
        <p className="text-xs text-gray-500 mt-1">
          Nhập ID vị trí nếu có, hoặc để trống nếu không cần
        </p>
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
