import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiPackage, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useAdjustInventory } from '../hooks/useInventory'

const StockAdjustment = ({ onClose }) => {
  const [adjustmentType, setAdjustmentType] = useState('increase') // increase, decrease, set
  
  const adjustInventoryMutation = useAdjustInventory()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: '',
      locationId: '',
      currentStock: '',
      adjustmentQuantity: '',
      reason: '',
      notes: '',
      reference: ''
    }
  })

  const watchedValues = watch()

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        adjustmentType,
        currentStock: parseFloat(data.currentStock),
        adjustmentQuantity: parseFloat(data.adjustmentQuantity)
      }

      await adjustInventoryMutation.mutateAsync(formData)
      onClose()
    } catch (error) {
      console.error('Error adjusting inventory:', error)
    }
  }

  // Tính toán tồn kho sau điều chỉnh
  const calculateNewStock = () => {
    const current = parseFloat(watchedValues.currentStock) || 0
    const adjustment = parseFloat(watchedValues.adjustmentQuantity) || 0
    
    switch (adjustmentType) {
      case 'increase':
        return current + adjustment
      case 'decrease':
        return Math.max(0, current - adjustment)
      case 'set':
        return adjustment
      default:
        return current
    }
  }

  const newStock = calculateNewStock()

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
          label="Tồn kho hiện tại *"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.currentStock?.message}
          {...register('currentStock', {
            required: 'Tồn kho hiện tại là bắt buộc',
            min: {
              value: 0,
              message: 'Tồn kho phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại điều chỉnh *
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAdjustmentType('increase')}
            className={`p-3 border rounded-lg text-center flex items-center justify-center ${
              adjustmentType === 'increase' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiTrendingUp className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Tăng</span>
          </button>
          
          <button
            type="button"
            onClick={() => setAdjustmentType('decrease')}
            className={`p-3 border rounded-lg text-center flex items-center justify-center ${
              adjustmentType === 'decrease' 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiTrendingDown className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Giảm</span>
          </button>
          
          <button
            type="button"
            onClick={() => setAdjustmentType('set')}
            className={`p-3 border rounded-lg text-center flex items-center justify-center ${
              adjustmentType === 'set' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiRefreshCw className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Adjustment Quantity */}
      <div>
        <Input
          label={`Số lượng ${adjustmentType === 'increase' ? 'tăng' : adjustmentType === 'decrease' ? 'giảm' : 'đặt lại'} *`}
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

      {/* Stock Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Xem trước</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
            <span className="ml-2 text-sm font-medium text-gray-900">
              {watchedValues.currentStock || 0}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Tồn kho sau điều chỉnh:</span>
            <span className={`ml-2 text-sm font-medium ${
              newStock < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {newStock}
            </span>
          </div>
        </div>
        {newStock < 0 && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ Tồn kho không thể âm. Vui lòng kiểm tra lại số lượng.
          </p>
        )}
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
          loading={adjustInventoryMutation.isLoading}
          disabled={adjustInventoryMutation.isLoading || newStock < 0}
        >
          Điều chỉnh tồn kho
        </Button>
      </div>
    </form>
  )
}

export default StockAdjustment
