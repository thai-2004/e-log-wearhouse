import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useAdjustInventory, useCreateInventory, useUpdateInventory } from '../hooks/useInventory'

const InventoryForm = ({ inventory, onClose }) => {
  const [adjustmentType, setAdjustmentType] = useState('adjust') // adjust, transfer, stocktake
  
  const adjustInventoryMutation = useAdjustInventory()
  const createInventoryMutation = useCreateInventory()
  const updateInventoryMutation = useUpdateInventory()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: '',
      locationId: '',
      currentStock: '',
      adjustmentQuantity: '',
      adjustmentType: 'increase', // increase, decrease, set
      reason: '',
      notes: '',
      reference: '',
      value: ''
    }
  })

  // Load inventory data khi edit
  useEffect(() => {
    if (inventory) {
      reset({
        productId: inventory.productId || '',
        warehouseId: inventory.warehouseId || '',
        locationId: inventory.locationId || '',
        currentStock: inventory.currentStock || '',
        adjustmentQuantity: '',
        adjustmentType: 'increase',
        reason: '',
        notes: '',
        reference: '',
        value: inventory.value || ''
      })
    }
  }, [inventory, reset])

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        currentStock: parseFloat(data.currentStock),
        adjustmentQuantity: parseFloat(data.adjustmentQuantity),
        value: parseFloat(data.value)
      }

      if (adjustmentType === 'adjust') {
        await adjustInventoryMutation.mutateAsync(formData)
      } else if (inventory?.id) {
        await updateInventoryMutation.mutateAsync({
          id: inventory.id,
          data: formData
        })
      } else {
        await createInventoryMutation.mutateAsync(formData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving inventory:', error)
    }
  }

  const isLoading = adjustInventoryMutation.isLoading || 
                   createInventoryMutation.isLoading || 
                   updateInventoryMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại điều chỉnh
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAdjustmentType('adjust')}
            className={`p-3 border rounded-lg text-center ${
              adjustmentType === 'adjust' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiPackage className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Điều chỉnh</div>
          </button>
          
          <button
            type="button"
            onClick={() => setAdjustmentType('transfer')}
            className={`p-3 border rounded-lg text-center ${
              adjustmentType === 'transfer' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiTrendingUp className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Chuyển kho</div>
          </button>
          
          <button
            type="button"
            onClick={() => setAdjustmentType('stocktake')}
            className={`p-3 border rounded-lg text-center ${
              adjustmentType === 'stocktake' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiTrendingDown className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Kiểm kê</div>
          </button>
        </div>
      </div>

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
          <option value="product1">Sản phẩm 1</option>
          <option value="product2">Sản phẩm 2</option>
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
          <option value="warehouse1">Kho chính</option>
          <option value="warehouse2">Kho phụ</option>
        </select>
        {errors.warehouseId && (
          <p className="text-sm text-red-600 mt-1">{errors.warehouseId.message}</p>
        )}
      </div>

      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vị trí
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('locationId')}
        >
          <option value="">Chọn vị trí</option>
          <option value="location1">Khu A - Tầng 1</option>
          <option value="location2">Khu B - Tầng 2</option>
        </select>
      </div>

      {/* Current Stock */}
      <div>
        <Input
          label="Tồn kho hiện tại"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.currentStock?.message}
          {...register('currentStock', {
            min: {
              value: 0,
              message: 'Tồn kho phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Adjustment Quantity */}
      <div>
        <Input
          label="Số lượng điều chỉnh *"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.adjustmentQuantity?.message}
          {...register('adjustmentQuantity', {
            required: 'Số lượng điều chỉnh là bắt buộc',
            min: {
              value: 0,
              message: 'Số lượng phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại điều chỉnh số lượng
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex items-center">
            <input
              type="radio"
              value="increase"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              {...register('adjustmentType')}
            />
            <span className="ml-2 text-sm text-gray-700">Tăng</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="decrease"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              {...register('adjustmentType')}
            />
            <span className="ml-2 text-sm text-gray-700">Giảm</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="set"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              {...register('adjustmentType')}
            />
            <span className="ml-2 text-sm text-gray-700">Đặt lại</span>
          </label>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do điều chỉnh *
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('reason', {
            required: 'Lý do điều chỉnh là bắt buộc'
          })}
        >
          <option value="">Chọn lý do</option>
          <option value="damage">Hàng hỏng</option>
          <option value="loss">Hàng mất</option>
          <option value="found">Hàng tìm thấy</option>
          <option value="return">Hàng trả về</option>
          <option value="stocktake">Kiểm kê</option>
          <option value="other">Khác</option>
        </select>
        {errors.reason && (
          <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
        )}
      </div>

      {/* Reference */}
      <div>
        <Input
          label="Số tham chiếu"
          placeholder="Nhập số tham chiếu (phiếu nhập, phiếu xuất, etc.)"
          {...register('reference')}
        />
      </div>

      {/* Value */}
      <div>
        <Input
          label="Giá trị tồn kho"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.value?.message}
          {...register('value', {
            min: {
              value: 0,
              message: 'Giá trị phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={3}
          placeholder="Nhập ghi chú bổ sung..."
          {...register('notes')}
        />
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
          loading={isLoading}
          disabled={isLoading}
        >
          {inventory?.id ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}

export default InventoryForm
