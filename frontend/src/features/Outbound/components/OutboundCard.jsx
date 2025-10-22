import React from 'react'
import { FiTruck, FiPackage, FiCalendar, FiDollarSign, FiFileText, FiEdit, FiTrash2, FiEye, FiCheckCircle, FiXCircle, FiCopy, FiUser, FiMapPin, FiAlertCircle, FiDownload } from 'react-icons/fi'
import Button from '@components/ui/Button'

const OutboundCard = ({ 
  outbound, 
  detailed = false, 
  onEdit, 
  onView, 
  onDelete, 
  onConfirm,
  onCancel,
  onDuplicate,
  onClose 
}) => {
  if (!outbound) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Chờ xử lý'
      case 'processing':
        return 'Đang xử lý'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-4 w-4" />
      case 'pending':
        return <FiAlertCircle className="h-4 w-4" />
      case 'processing':
        return <FiPackage className="h-4 w-4" />
      case 'cancelled':
        return <FiXCircle className="h-4 w-4" />
      default:
        return <FiPackage className="h-4 w-4" />
    }
  }

  const getTypeText = (type) => {
    switch (type) {
      case 'normal':
        return 'Xuất kho thường'
      case 'return':
        return 'Trả hàng'
      case 'transfer':
        return 'Chuyển kho'
      case 'sample':
        return 'Mẫu hàng'
      case 'damaged':
        return 'Hàng hỏng'
      default:
        return 'Xuất kho thường'
    }
  }

  const getShippingMethodText = (method) => {
    switch (method) {
      case 'standard':
        return 'Giao hàng tiêu chuẩn'
      case 'express':
        return 'Giao hàng nhanh'
      case 'overnight':
        return 'Giao hàng trong ngày'
      case 'pickup':
        return 'Khách hàng tự lấy'
      default:
        return 'Giao hàng tiêu chuẩn'
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${detailed ? 'p-6' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiTruck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{outbound.outboundNumber}</h3>
            <p className="text-sm text-gray-500">
              {getTypeText(outbound.type)} • {new Date(outbound.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(outbound.status)}`}>
            {getStatusIcon(outbound.status)}
            <span className="ml-1">{getStatusText(outbound.status)}</span>
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiUser className="h-4 w-4 mr-2" />
          <span className="font-medium">Khách hàng:</span>
        </div>
        {outbound.customer ? (
          <div className="flex items-center ml-6">
            <div className="flex-shrink-0 h-6 w-6">
              <img
                className="h-6 w-6 rounded-full object-cover"
                src={outbound.customer.avatar || '/images/default-avatar.png'}
                alt={outbound.customer.name}
              />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">
                {outbound.customer.name}
              </div>
              <div className="text-xs text-gray-500">
                {outbound.customer.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 ml-6">Chưa chọn khách hàng</div>
        )}
      </div>

      {/* Warehouse Info */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiMapPin className="h-4 w-4 mr-2" />
          <span className="font-medium">Kho xuất:</span>
        </div>
        <div className="text-sm text-gray-900 ml-6">
          {outbound.warehouse?.name || 'Chưa chọn kho'}
        </div>
      </div>

      {/* Items Summary */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiPackage className="h-4 w-4 mr-2" />
          <span className="font-medium">Sản phẩm:</span>
        </div>
        <div className="ml-6">
          <div className="text-sm text-gray-900">
            {outbound.totalItems || 0} sản phẩm
          </div>
          <div className="text-sm text-gray-500">
            Tổng số lượng: {outbound.totalQuantity || 0} đơn vị
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiDollarSign className="h-4 w-4 mr-2" />
          <span className="font-medium">Tổng giá trị:</span>
        </div>
        <div className="text-lg font-bold text-primary-600 ml-6">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(outbound.totalValue || 0)}
        </div>
      </div>

      {/* Detailed Info */}
      {detailed && (
        <div className="space-y-4 mb-4">
          {/* Items Detail */}
          {outbound.items && outbound.items.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Chi tiết sản phẩm</h4>
              <div className="space-y-2">
                {outbound.items.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded object-cover"
                            src={item.product?.image || '/images/default-product.png'}
                            alt={item.product?.name}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {item.product?.sku}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.quantity} x {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.unitPrice)}
                        </div>
                        <div className="text-sm text-primary-600 font-medium">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 text-xs text-gray-500">
                        Ghi chú: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin vận chuyển</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Phương thức:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getShippingMethodText(outbound.shippingMethod)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Mã vận đơn:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {outbound.trackingNumber || 'Chưa có'}
                  </div>
                </div>
              </div>
              {outbound.shippingAddress && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">Địa chỉ giao hàng:</div>
                  <div className="text-sm text-gray-900">{outbound.shippingAddress}</div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {outbound.attachments && outbound.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tài liệu đính kèm</h4>
              <div className="space-y-2">
                {outbound.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FiFileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {attachment.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <FiDownload className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {outbound.history && outbound.history.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Lịch sử</h4>
              <div className="space-y-2">
                {outbound.history.slice(0, 5).map((history, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="flex-shrink-0 h-6 w-6">
                      <img
                        className="h-6 w-6 rounded-full object-cover"
                        src={history.user?.avatar || '/images/default-avatar.png'}
                        alt={history.user?.name}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm text-gray-900">
                        {history.action}
                      </div>
                      <div className="text-xs text-gray-500">
                        {history.user?.name} - {new Date(history.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {outbound.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ghi chú</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {outbound.notes}
              </p>
            </div>
          )}

          {/* Expected Date */}
          {outbound.expectedDate && (
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="h-4 w-4 mr-2" />
              Ngày dự kiến xuất: {new Date(outbound.expectedDate).toLocaleDateString('vi-VN')}
            </div>
          )}

          {/* Created By */}
          <div className="flex items-center text-sm text-gray-500">
            <FiUser className="h-4 w-4 mr-2" />
            Tạo bởi: {outbound.createdBy?.name || 'Không xác định'}
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
            
            {outbound.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onConfirm}
                className="text-green-600 hover:text-green-700"
              >
                <FiCheckCircle className="h-4 w-4 mr-2" />
                Xác nhận
              </Button>
            )}
            
            {outbound.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="text-red-600 hover:text-red-700"
              >
                <FiXCircle className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={onDuplicate}
            >
              <FiCopy className="h-4 w-4 mr-2" />
              Sao chép
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
            
            {outbound.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onConfirm}
                className="text-green-600 hover:text-green-700"
              >
                <FiCheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {outbound.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="text-red-600 hover:text-red-700"
              >
                <FiXCircle className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={onDuplicate}
            >
              <FiCopy className="h-4 w-4" />
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

export default OutboundCard
