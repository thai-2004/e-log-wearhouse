import React from 'react'
import { FiAlertTriangle, FiTrendingDown, FiTrendingUp, FiPackage, FiEye } from 'react-icons/fi'
import Button from '@components/ui/Button'

const StockAlert = ({ 
  type = 'low', // low, zero, overstock
  items = [],
  onViewDetails,
  maxItems = 5 
}) => {
  const getAlertConfig = (type) => {
    switch (type) {
      case 'zero':
        return {
          title: 'Hết hàng',
          icon: FiAlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          countColor: 'text-red-900',
          buttonColor: 'bg-red-100 hover:bg-red-200 text-red-800'
        }
      case 'low':
        return {
          title: 'Sắp hết hàng',
          icon: FiTrendingDown,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          countColor: 'text-yellow-900',
          buttonColor: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        }
      case 'overstock':
        return {
          title: 'Tồn kho cao',
          icon: FiTrendingUp,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          countColor: 'text-blue-900',
          buttonColor: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        }
      default:
        return {
          title: 'Cảnh báo tồn kho',
          icon: FiPackage,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          countColor: 'text-gray-900',
          buttonColor: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }
    }
  }

  const config = getAlertConfig(type)
  const Icon = config.icon
  const displayItems = items.slice(0, maxItems)

  if (!items || items.length === 0) {
    return (
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
        <div className="flex items-center">
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
          <div className="ml-3">
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {config.title}
            </p>
            <p className={`text-2xl font-bold ${config.countColor}`}>
              0
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Không có sản phẩm nào trong tình trạng này
        </p>
      </div>
    )
  }

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
          <div className="ml-3">
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {config.title}
            </p>
            <p className={`text-2xl font-bold ${config.countColor}`}>
              {items.length}
            </p>
          </div>
        </div>
        
        {items.length > maxItems && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails?.(type)}
            className={config.buttonColor}
          >
            <FiEye className="h-4 w-4 mr-1" />
            Xem tất cả
          </Button>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={item.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex items-center space-x-3">
              <img
                src={item.product?.image || '/images/no-image.png'}
                alt={item.product?.name}
                className="h-8 w-8 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product?.name}
                </p>
                <p className="text-xs text-gray-500">
                  SKU: {item.product?.sku}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${
                type === 'zero' ? 'text-red-600' :
                type === 'low' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {item.currentStock}
              </p>
              <p className="text-xs text-gray-500">
                Min: {item.product?.minStock || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(type)}
            className="w-full"
          >
            Xem chi tiết
          </Button>
        </div>
      )}
    </div>
  )
}

export default StockAlert
