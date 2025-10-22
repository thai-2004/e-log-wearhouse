import React from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin, FiStar, FiEdit, FiTrash2, FiEye, FiUserCheck, FiUserX, FiCalendar, FiDollarSign } from 'react-icons/fi'
import Button from '@components/ui/Button'

const CustomerCard = ({ 
  customer, 
  detailed = false, 
  onEdit, 
  onView, 
  onDelete, 
  onToggleStatus,
  onClose 
}) => {
  if (!customer) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
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
      case 'pending':
        return 'Chờ xác nhận'
      default:
        return 'Không xác định'
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${detailed ? 'p-6' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={customer.avatar || '/images/default-avatar.png'}
              alt={customer.name}
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
              {customer.isVip && (
                <FiStar className="h-5 w-5 text-yellow-500 ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
            {getStatusText(customer.status)}
          </span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 mb-4">
        {customer.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="h-4 w-4 mr-2" />
            {customer.phone}
          </div>
        )}
        
        {customer.group && (
          <div className="flex items-center text-sm text-gray-600">
            <FiUser className="h-4 w-4 mr-2" />
            {customer.group.name}
          </div>
        )}
        
        {customer.defaultAddress && (
          <div className="flex items-center text-sm text-gray-600">
            <FiMapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{customer.defaultAddress.address}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{customer.points || 0}</div>
          <div className="text-xs text-blue-800">Điểm tích lũy</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{customer.totalOrders || 0}</div>
          <div className="text-xs text-green-800">Đơn hàng</div>
        </div>
      </div>

      {/* Detailed Info */}
      {detailed && (
        <div className="space-y-4 mb-4">
          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ</h4>
              <div className="space-y-2">
                {customer.addresses.map((address, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {address.address}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.ward}, {address.district}, {address.city}
                        </div>
                        {address.postalCode && (
                          <div className="text-xs text-gray-400">
                            Mã bưu điện: {address.postalCode}
                          </div>
                        )}
                      </div>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {customer.recentOrders && customer.recentOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Đơn hàng gần đây</h4>
              <div className="space-y-2">
                {customer.recentOrders.slice(0, 3).map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(order.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ghi chú</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center text-sm text-gray-500">
            <FiCalendar className="h-4 w-4 mr-2" />
            Tạo ngày: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        {detailed ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              <FiEdit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleStatus}
            >
              {customer.status === 'active' ? (
                <>
                  <FiUserX className="h-4 w-4 mr-2" />
                  Vô hiệu hóa
                </>
              ) : (
                <>
                  <FiUserCheck className="h-4 w-4 mr-2" />
                  Kích hoạt
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onView}
            >
              <FiEye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              <FiEdit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleStatus}
            >
              {customer.status === 'active' ? <FiUserX className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerCard
