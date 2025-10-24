import React, { useState } from 'react'
import { FiX, FiSave, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Textarea from '@components/ui/Textarea'
import { useCreateWarehouse, useUpdateWarehouse } from '../hooks/useWarehouses'

const WarehouseForm = ({ warehouse, onClose }) => {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    type: warehouse?.type || 'normal',
    address: warehouse?.address || '',
    capacity: warehouse?.capacity || '',
    description: warehouse?.description || '',
    status: warehouse?.status || 'active'
  })

  const createWarehouseMutation = useCreateWarehouse()
  const updateWarehouseMutation = useUpdateWarehouse()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (warehouse) {
        await updateWarehouseMutation.mutateAsync({
          id: warehouse.id,
          ...formData
        })
      } else {
        await createWarehouseMutation.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving warehouse:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isLoading = createWarehouseMutation.isLoading || updateWarehouseMutation.isLoading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên kho *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nhập tên kho"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã kho *
          </label>
          <Input
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="Nhập mã kho"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại kho
          </label>
          <Select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={[
              { value: 'normal', label: 'Kho thường' },
              { value: 'main', label: 'Kho chính' },
              { value: 'branch', label: 'Kho chi nhánh' },
              { value: 'cold', label: 'Kho lạnh' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dung tích (m²)
          </label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            placeholder="Nhập dung tích"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <Select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={[
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
              { value: 'maintenance', label: 'Bảo trì' }
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <Textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Nhập địa chỉ kho"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Nhập mô tả kho"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          <FiX className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          <FiSave className="h-4 w-4 mr-2" />
          {warehouse ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}

export default WarehouseForm
