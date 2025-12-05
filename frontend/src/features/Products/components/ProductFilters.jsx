import React, { useMemo, useState } from 'react'
import { FiX, FiSearch } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCategories } from '../../Categories/hooks/useCategories'

const ProductFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const { data: categoriesData, isLoading: loadingCategories } = useCategories({ limit: 1000 })

  const priceOptions = useMemo(() => ([
    { value: '', label: 'Tất cả giá', min: '', max: '' },
    { value: '0-100k', label: '0 - 100K', min: 0, max: 100000 },
    { value: '100k-500k', label: '100K - 500K', min: 100000, max: 500000 },
    { value: '500k-1m', label: '500K - 1 triệu', min: 500000, max: 1000000 },
    { value: '1m-5m', label: '1 - 5 triệu', min: 1000000, max: 5000000 },
    { value: '5m+', label: 'Trên 5 triệu', min: 5000000, max: '' },
  ]), [])

  const [priceOption, setPriceOption] = useState(() => {
    const matched = priceOptions.find(
      (opt) => `${opt.min}` === `${filters.priceRange?.min ?? ''}` && `${opt.max}` === `${filters.priceRange?.max ?? ''}`
    )
    return matched?.value ?? ''
  })

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

  const handlePriceOptionChange = (value) => {
    setPriceOption(value)
    const option = priceOptions.find(opt => opt.value === value)
    setLocalFilters(prev => ({
      ...prev,
      priceRange: {
        min: option?.min ?? '',
        max: option?.max ?? ''
      }
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters = {
      categoryId: '',
      status: '',
      priceRange: { min: '', max: '' },
      stockRange: { min: '', max: '' }
    }
    setPriceOption('')
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
          value={localFilters.categoryId}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          disabled={loadingCategories}
        >
          <option value="">Tất cả danh mục</option>
          {categoriesData?.data?.categories?.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id}>
              {cat.name}
            </option>
          ))}
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
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={priceOption}
          onChange={(e) => handlePriceOptionChange(e.target.value)}
        >
          {priceOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
