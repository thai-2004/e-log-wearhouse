import React from 'react'
import { FiMapPin, FiPackage, FiTruck, FiEdit, FiTrash2, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Button from '@components/ui/Button'

const WarehouseCard = ({ warehouse, detailed = false, onEdit, onView, onDelete, onToggleStatus, onClose }) => {
  if (!warehouse) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động'
      case 'inactive':
        return 'Không hoạt động'
      case 'maintenance':
        return 'Bảo trì'
      default:
        return 'Không xác định'
    }
  }

  const getTypeText = (type) => {
    switch (type) {
      case 'main':
        return 'Kho chính'
      case 'branch':
        return 'Kho chi nhánh'
      case 'cold':
        return 'Kho lạnh'
      default:
        return 'Kho thường'
    }
  }

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <FiMapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
              <p className="text-sm text-gray-500">Mã: {warehouse.code}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(warehouse.status)}`}>
            {getStatusText(warehouse.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Loại kho:</span>
                  <span className="text-sm text-gray-900">{getTypeText(warehouse.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Dung tích:</span>
                  <span className="text-sm text-gray-900">{warehouse.capacity ? `${warehouse.capacity} m²` : 'Chưa xác định'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sản phẩm:</span>
                  <span className="text-sm text-gray-900">{warehouse.totalProducts || 0} sản phẩm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ngày tạo:</span>
                  <span className="text-sm text-gray-900">{new Date(warehouse.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Địa chỉ</h4>
              <p className="text-sm text-gray-900">{warehouse.address || 'Chưa có địa chỉ'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h4>
              <p className="text-sm text-gray-900">{warehouse.description || 'Chưa có mô tả'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thống kê</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <FiPackage className="h-5 w-5 text-blue-600" />
                    <div className="ml-2">
                      <p className="text-xs text-blue-800">Tổng sản phẩm</p>
                      <p className="text-lg font-bold text-blue-900">{warehouse.totalProducts || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <FiTruck className="h-5 w-5 text-green-600" />
                    <div className="ml-2">
                      <p className="text-xs text-green-800">Dung tích</p>
                      <p className="text-lg font-bold text-green-900">{warehouse.capacity || 0} m²</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {onClose && (
          <div className="flex justify-end pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FiMapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{warehouse.name}</h3>
            <p className="text-xs text-gray-500">{warehouse.code}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.status)}`}>
          {getStatusText(warehouse.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Loại:</span>
          <span className="text-gray-900">{getTypeText(warehouse.type)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Dung tích:</span>
          <span className="text-gray-900">{warehouse.capacity ? `${warehouse.capacity} m²` : 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sản phẩm:</span>
          <span className="text-gray-900">{warehouse.totalProducts || 0}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4 truncate">
        {warehouse.address || 'Chưa có địa chỉ'}
      </div>

      <div className="flex space-x-2">
        {onView && (
          <Button
            size="sm"
            variant="outline"
            onClick={onView}
            className="flex-1"
          >
            <FiEye className="h-4 w-4 mr-1" />
            Xem
          </Button>
        )}
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            <FiEdit className="h-4 w-4 mr-1" />
            Sửa
          </Button>
        )}
        {onToggleStatus && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleStatus}
            className={warehouse.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {warehouse.status === 'active' ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default WarehouseCard
