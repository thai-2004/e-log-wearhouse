import React from 'react'
import { API_CONFIG } from '@config'
import { FiEdit, FiTrash2, FiEye, FiPackage, FiTag } from 'react-icons/fi'
import Button from '@components/ui/Button'

const getImageUrl = (url) => {
  if (!url) return '/images/no-image.png'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    const backendBase = API_CONFIG.BASE_URL.replace('/api', '')
    return `${backendBase}${url}`
  }
  return url
}

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onView, 
  showActions = true 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getStockStatus = (stock, minStock) => {
    const stockValue = stock ?? 0
    const minStockValue = minStock ?? 0
    if (stockValue <= minStockValue) {
      return { text: 'Sắp hết', color: 'text-red-600 bg-red-100' }
    } else if (stockValue <= minStockValue * 2) {
      return { text: 'Cảnh báo', color: 'text-yellow-600 bg-yellow-100' }
    } else {
      return { text: 'Đủ hàng', color: 'text-green-600 bg-green-100' }
    }
  }

  const stockStatus = getStockStatus(product.stock, product.minStock)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img
          src={getImageUrl(product.imageUrl || product.image)}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.src = '/images/no-image.png' }}
        />
        {product.status === 'inactive' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Ngừng bán</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name & SKU */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>

        {/* Category */}
        {product.category && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <FiTag className="h-3 w-3 mr-1" />
              {product.category.name}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          {product.cost && (
            <span className="text-sm text-gray-500 ml-2">
              (Giá nhập: {formatPrice(product.cost)})
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tồn kho:</span>
            <span className="text-sm font-medium text-gray-900">
              {product.stock ?? 0} / {product.minStock ?? 0} min
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
              <FiPackage className="h-3 w-3 mr-1" />
              {stockStatus.text}
            </span>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{product.tags.length - 3} khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView?.(product)}
              className="flex-1"
            >
              <FiEye className="h-4 w-4 mr-1" />
              Xem
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(product)}
              className="flex-1"
            >
              <FiEdit className="h-4 w-4 mr-1" />
              Sửa
            </Button>
            <Button
              size="sm"
              variant="error"
              onClick={() => onDelete?.(product)}
              className="flex-1"
            >
              <FiTrash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Tạo: {new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
          <span>Cập nhật: {new Date(product.updatedAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
