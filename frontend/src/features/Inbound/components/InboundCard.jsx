import React from 'react'
import { FiPackage, FiTruck, FiCalendar, FiDollarSign, FiFileText, FiEdit, FiTrash2, FiEye, FiCheckCircle, FiXCircle, FiCopy, FiUser, FiMapPin, FiAlertCircle, FiDownload } from 'react-icons/fi'
import Button from '@components/ui/Button'

const InboundCard = ({ 
  inbound, 
  detailed = false, 
  onEdit, 
  onView, 
  onDelete, 
  onConfirm,
  onCancel,
  onDuplicate,
  onClose 
}) => {
  if (!inbound) return null

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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${detailed ? 'p-6' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiFileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{inbound.inboundNumber}</h3>
            <p className="text-sm text-gray-500">
              {new Date(inbound.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inbound.status)}`}>
            {getStatusIcon(inbound.status)}
            <span className="ml-1">{getStatusText(inbound.status)}</span>
          </span>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiTruck className="h-4 w-4 mr-2" />
          <span className="font-medium">Nhà cung cấp:</span>
        </div>
        {inbound.supplier ? (
          <div className="flex items-center ml-6">
            <div className="flex-shrink-0 h-6 w-6">
              <img
                className="h-6 w-6 rounded-full object-cover"
                src={inbound.supplier.logo || '/images/default-supplier.png'}
                alt={inbound.supplier.name}
              />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">
                {inbound.supplier.name}
              </div>
              <div className="text-xs text-gray-500">
                {inbound.supplier.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 ml-6">Chưa chọn nhà cung cấp</div>
        )}
      </div>

      {/* Warehouse Info */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiMapPin className="h-4 w-4 mr-2" />
          <span className="font-medium">Kho nhập:</span>
        </div>
        <div className="text-sm text-gray-900 ml-6">
          {inbound.warehouse?.name || 'Chưa chọn kho'}
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
            {inbound.totalItems || 0} sản phẩm
          </div>
          <div className="text-sm text-gray-500">
            Tổng số lượng: {inbound.totalQuantity || 0} đơn vị
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
          }).format(inbound.totalValue || 0)}
        </div>
      </div>

      {/* Detailed Info */}
      {detailed && (
        <div className="space-y-4 mb-4">
          {/* Items Detail */}
          {inbound.items && inbound.items.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Chi tiết sản phẩm</h4>
              <div className="space-y-2">
                {inbound.items.map((item, index) => (
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

          {/* Attachments */}
          {inbound.attachments && inbound.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tài liệu đính kèm</h4>
              <div className="space-y-2">
                {inbound.attachments.map((attachment, index) => (
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
          {inbound.history && inbound.history.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Lịch sử</h4>
              <div className="space-y-2">
                {inbound.history.slice(0, 5).map((history, index) => (
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
          {inbound.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ghi chú</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {inbound.notes}
              </p>
            </div>
          )}

          {/* Expected Date */}
          {inbound.expectedDate && (
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="h-4 w-4 mr-2" />
              Ngày dự kiến: {new Date(inbound.expectedDate).toLocaleDateString('vi-VN')}
            </div>
          )}

          {/* Created By */}
          <div className="flex items-center text-sm text-gray-500">
            <FiUser className="h-4 w-4 mr-2" />
            Tạo bởi: {inbound.createdBy?.name || 'Không xác định'}
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
            
            {inbound.status === 'pending' && (
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
            
            {inbound.status === 'pending' && (
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
            
            {inbound.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onConfirm}
                className="text-green-600 hover:text-green-700"
              >
                <FiCheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {inbound.status === 'pending' && (
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

export default InboundCard
