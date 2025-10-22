import React from 'react'
import { FiTruck, FiMail, FiPhone, FiMapPin, FiStar, FiEdit, FiTrash2, FiEye, FiCheckCircle, FiXCircle, FiCalendar, FiDollarSign, FiPackage, FiUser, FiGlobe } from 'react-icons/fi'
import Button from '@components/ui/Button'

const SupplierCard = ({ 
  supplier, 
  detailed = false, 
  onEdit, 
  onView, 
  onDelete, 
  onToggleStatus,
  onClose 
}) => {
  if (!supplier) return null

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

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating || 0)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${detailed ? 'p-6' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={supplier.logo || '/images/default-supplier.png'}
              alt={supplier.name}
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
              {supplier.isTopSupplier && (
                <FiStar className="h-5 w-5 text-yellow-500 ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-500">{supplier.email}</p>
            {supplier.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {supplier.category}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
            {getStatusText(supplier.status)}
          </span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 mb-4">
        {supplier.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="h-4 w-4 mr-2" />
            {supplier.phone}
          </div>
        )}
        
        {supplier.website && (
          <div className="flex items-center text-sm text-gray-600">
            <FiGlobe className="h-4 w-4 mr-2" />
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              {supplier.website}
            </a>
          </div>
        )}
        
        {supplier.taxCode && (
          <div className="flex items-center text-sm text-gray-600">
            <FiPackage className="h-4 w-4 mr-2" />
            MST: {supplier.taxCode}
          </div>
        )}
        
        {supplier.defaultAddress && (
          <div className="flex items-center text-sm text-gray-600">
            <FiMapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{supplier.defaultAddress.address}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {renderStars(supplier.averageRating)}
          </div>
          <div className="text-xs text-blue-800">
            ({supplier.totalRatings || 0} đánh giá)
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{supplier.totalProducts || 0}</div>
          <div className="text-xs text-green-800">Sản phẩm</div>
        </div>
      </div>

      {/* Detailed Info */}
      {detailed && (
        <div className="space-y-4 mb-4">
          {/* Addresses */}
          {supplier.addresses && supplier.addresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ</h4>
              <div className="space-y-2">
                {supplier.addresses.map((address, index) => (
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

          {/* Contacts */}
          {supplier.contacts && supplier.contacts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Liên hệ</h4>
              <div className="space-y-2">
                {supplier.contacts.map((contact, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <FiUser className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.position}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="text-sm text-gray-500">
                            {contact.phone}
                          </div>
                        )}
                        {contact.department && (
                          <div className="text-xs text-gray-400">
                            {contact.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {supplier.recentOrders && supplier.recentOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Đơn hàng gần đây</h4>
              <div className="space-y-2">
                {supplier.recentOrders.slice(0, 3).map((order, index) => (
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

          {/* Contracts */}
          {supplier.contracts && supplier.contracts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Hợp đồng</h4>
              <div className="space-y-2">
                {supplier.contracts.slice(0, 3).map((contract, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status === 'active' ? 'Hoạt động' :
                         contract.status === 'expired' ? 'Hết hạn' : 'Chờ ký'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {supplier.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Mô tả</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {supplier.description}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center text-sm text-gray-500">
            <FiCalendar className="h-4 w-4 mr-2" />
            Tạo ngày: {new Date(supplier.createdAt).toLocaleDateString('vi-VN')}
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
              {supplier.status === 'active' ? (
                <>
                  <FiXCircle className="h-4 w-4 mr-2" />
                  Vô hiệu hóa
                </>
              ) : (
                <>
                  <FiCheckCircle className="h-4 w-4 mr-2" />
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
              {supplier.status === 'active' ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
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

export default SupplierCard
