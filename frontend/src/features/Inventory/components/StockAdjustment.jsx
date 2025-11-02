import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useAdjustInventory, useInventory } from '../hooks/useInventory'

const StockAdjustment = ({ inventory, onClose }) => {
  const adjustInventoryMutation = useAdjustInventory()
  const [selectedInventoryId, setSelectedInventoryId] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('increase') // increase, decrease
  
  // Lấy danh sách inventory để chọn
  const { data: inventoriesData } = useInventory({ limit: 100 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      inventoryId: '',
      adjustment: '',
      notes: ''
    }
  })

  // Set inventoryId nếu được truyền vào
  useEffect(() => {
    if (inventory?._id || inventory?.id) {
      const invId = inventory._id || inventory.id
      setSelectedInventoryId(invId)
      setValue('inventoryId', invId)
    }
  }, [inventory, setValue])

  const watchedAdjustment = watch('adjustment')
  const currentInventory = inventoriesData?.data?.inventories?.find(
    inv => (inv._id || inv.id) === selectedInventoryId
  ) || inventory

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      // Tính adjustment dựa trên type
      let adjustmentValue = parseFloat(data.adjustment) || 0
      if (adjustmentType === 'decrease') {
        adjustmentValue = -Math.abs(adjustmentValue)
      } else {
        adjustmentValue = Math.abs(adjustmentValue)
      }

      const formData = {
        inventoryId: data.inventoryId,
        adjustment: adjustmentValue,
        notes: data.notes || ''
      }

      await adjustInventoryMutation.mutateAsync(formData)
      onClose()
    } catch (error) {
      console.error('Error adjusting inventory:', error)
    }
  }

  // Tính toán tồn kho sau điều chỉnh
  const calculateNewStock = () => {
    const current = currentInventory?.quantity || 0
    const adjustment = parseFloat(watchedAdjustment) || 0
    
    if (adjustmentType === 'increase') {
      return current + adjustment
    } else {
      return Math.max(0, current - adjustment)
    }
  }

  const newStock = calculateNewStock()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Inventory Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn bản ghi tồn kho *
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={selectedInventoryId}
          onChange={(e) => {
            setSelectedInventoryId(e.target.value)
            setValue('inventoryId', e.target.value)
          }}
          disabled={!!inventory}
          {...register('inventoryId', {
            required: 'Vui lòng chọn bản ghi tồn kho'
          })}
        >
          <option value="">Chọn bản ghi tồn kho</option>
          {inventoriesData?.data?.inventories?.map((inv) => (
            <option key={inv._id || inv.id} value={inv._id || inv.id}>
              {inv.productId?.name || inv.product?.name} - {inv.warehouseId?.name || inv.warehouse?.name} 
              {inv.locationId?.name ? ` - ${inv.locationId.name}` : ''} 
              (Tồn: {inv.quantity || 0})
            </option>
          ))}
        </select>
        {errors.inventoryId && (
          <p className="text-sm text-red-600 mt-1">{errors.inventoryId.message}</p>
        )}
      </div>

      {/* Current Stock Info */}
      {currentInventory && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin hiện tại</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tồn kho:</span>
              <span className="ml-2 font-medium text-gray-900">{currentInventory.quantity || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Đã giữ:</span>
              <span className="ml-2 font-medium text-gray-900">{currentInventory.reservedQuantity || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Có thể dùng:</span>
              <span className="ml-2 font-medium text-gray-900">{currentInventory.availableQuantity || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại điều chỉnh *
        </label>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>

      {/* Adjustment Quantity */}
      <div>
        <Input
          label={`Số lượng ${adjustmentType === 'increase' ? 'tăng' : 'giảm'} *`}
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.adjustment?.message}
          {...register('adjustment', {
            required: 'Số lượng điều chỉnh là bắt buộc',
            min: {
              value: 0,
              message: 'Số lượng phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Stock Preview */}
      {currentInventory && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Xem trước</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {currentInventory.quantity || 0}
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
      )}

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
          disabled={adjustInventoryMutation.isLoading || newStock < 0 || !selectedInventoryId}
        >
          Điều chỉnh tồn kho
        </Button>
      </div>
    </form>
  )
}

export default StockAdjustment
