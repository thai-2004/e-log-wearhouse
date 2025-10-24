import React, { useState } from 'react'
import { FiChevronRight, FiChevronDown, FiFolder, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import Button from '@components/ui/Button'

const CategoryTree = ({ 
  categories = [], 
  onEdit, 
  onDelete, 
  onAddChild,
  onMove,
  showActions = true,
  level = 0 
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategory = (category) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div key={category.id} className="select-none">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer ${
            level === 0 ? 'font-medium' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="mr-2 text-gray-400 hover:text-gray-600 p-1"
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {/* Category Icon */}
          <div className="mr-2">
            <FiFolder className={`h-4 w-4 ${isExpanded ? 'text-blue-600' : 'text-blue-500'}`} />
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 truncate">
                {category.name}
              </span>
              {category.productCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {category.productCount} sản phẩm
                </span>
              )}
              {!category.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Tạm dừng
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {category.description}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(category)
                }}
                className="p-1"
              >
                <FiEdit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddChild?.(category)
                }}
                className="p-1"
              >
                <FiPlus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(category)
                }}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children.map(child => renderCategory(child))}
          </div>
        )}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiFolder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Không có danh mục nào</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Cây danh mục</h3>
        <p className="text-sm text-gray-500">Cấu trúc phân cấp danh mục sản phẩm</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  )
}

export default CategoryTree
