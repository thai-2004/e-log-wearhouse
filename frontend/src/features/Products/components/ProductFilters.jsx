import React, { useState } from 'react'
import { FiX, FiSearch } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'

const ProductFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNestedFilterChange = (parentKey, childKey, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      status: '',
      priceRange: { min: '', max: '' },
      stockRange: { min: '', max: '' }
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onClose()
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={localFilters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          <option value="electronics">Điện tử</option>
          <option value="clothing">Quần áo</option>
          <option value="books">Sách</option>
          <option value="home">Gia dụng</option>
          <option value="sports">Thể thao</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={localFilters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng giá (VNĐ)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Từ"
            type="number"
            value={localFilters.priceRange.min}
            onChange={(e) => handleNestedFilterChange('priceRange', 'min', e.target.value)}
          />
          <Input
            placeholder="Đến"
            type="number"
            value={localFilters.priceRange.max}
            onChange={(e) => handleNestedFilterChange('priceRange', 'max', e.target.value)}
          />
        </div>
      </div>

      {/* Stock Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng tồn kho
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Từ"
            type="number"
            value={localFilters.stockRange.min}
            onChange={(e) => handleNestedFilterChange('stockRange', 'min', e.target.value)}
          />
          <Input
            placeholder="Đến"
            type="number"
            value={localFilters.stockRange.max}
            onChange={(e) => handleNestedFilterChange('stockRange', 'max', e.target.value)}
          />
        </div>
      </div>

      {/* Stock Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tình trạng tồn kho
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={localFilters.lowStock}
              onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">Sắp hết hàng</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={localFilters.outOfStock}
              onChange={(e) => handleFilterChange('outOfStock', e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">Hết hàng</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={localFilters.overstock}
              onChange={(e) => handleFilterChange('overstock', e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">Tồn kho cao</span>
          </label>
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày tạo
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          <Input
            type="date"
            value={localFilters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sắp xếp theo
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={localFilters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="name">Tên sản phẩm</option>
          <option value="price">Giá</option>
          <option value="stock">Tồn kho</option>
          <option value="createdAt">Ngày tạo</option>
          <option value="updatedAt">Ngày cập nhật</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thứ tự
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={localFilters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleResetFilters}
        >
          Đặt lại
        </Button>
        <Button
          onClick={handleApplyFilters}
        >
          Áp dụng bộ lọc
        </Button>
      </div>
    </div>
  )
}

export default ProductFilters
