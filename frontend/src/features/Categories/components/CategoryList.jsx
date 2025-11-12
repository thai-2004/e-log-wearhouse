import React, { useState, useMemo, useCallback } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Modal from '@components/ui/Modal'
import CategoryForm from './CategoryForm'
import { useCategoryTree, useDeleteCategory } from '../hooks/useCategories'
import Tooltip from '@components/ui/Tooltip'

const CategoryList = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  // API hooks
  const { data, isLoading, error } = useCategoryTree()

  const deleteCategoryMutation = useDeleteCategory()

  const getCategoryId = useCallback((category) => {
    if (!category) return ''
    if (typeof category === 'string') return category
    return category.id || category._id || ''
  }, [])

  const getParentIdValue = useCallback((category) => {
    if (!category) return ''
    const parent = category.parent || category.parentId
    if (!parent) return ''
    if (typeof parent === 'string') return parent
    return parent._id || parent.id || ''
  }, [])

  const getProductCount = useCallback((category) => {
    if (!category) return 0

    const directCount =
      category.productCount ??
      category.productsCount ??
      category.totalProducts ??
      category.productTotal ??
      category.productStats?.totalProducts ??
      category.statistics?.totalProducts

    if (typeof directCount === 'number') {
      return directCount
    }

    if (typeof directCount === 'string') {
      const parsed = Number(directCount)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    if (Array.isArray(category.products)) {
      return category.products.length
    }

    return 0
  }, [])

  // Xử lý mở rộng/thu gọn danh mục
  const toggleExpanded = useCallback((categoryId) => {
    if (!categoryId) return

    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId)
      } else {
        newExpanded.add(categoryId)
      }
      return newExpanded
    })
  }, [])

  // Xử lý xóa danh mục
  const handleDelete = async (categoryOrId) => {
    const categoryId = typeof categoryOrId === 'string' ? categoryOrId : getCategoryId(categoryOrId)
    if (!categoryId) return
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con và sản phẩm sẽ bị ảnh hưởng.')) {
      await deleteCategoryMutation.mutateAsync(categoryId)
    }
  }

  // Xử lý di chuyển danh mục
  // Render danh mục con
  const renderSubCategories = (categories, level = 0) => {
    return categories.map((category) => {
      const categoryId = getCategoryId(category)
      const hasChildren = Array.isArray(category.children) && category.children.length > 0
      const isExpanded = expandedCategories.has(categoryId)

      return (
        <React.Fragment key={categoryId}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(categoryId)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
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

              <FiFolder className={`h-4 w-4 mr-2 ${isExpanded ? 'text-blue-600' : 'text-blue-500'}`} />

              <div>
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500">{category.description}</div>
                )}
              </div>
            </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.parent?.name || category.parentId?.name || 'Danh mục gốc'}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {getProductCount(category)}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {hasChildren ? category.children.length : 0}
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
              }`}>
              {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </span>
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(category.createdAt).toLocaleDateString('vi-VN')}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2">
              <Tooltip text="Chỉnh sửa danh mục" position="top">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory({
                      ...category,
                      parentId: getParentIdValue(category)
                    })
                    setShowForm(true)
                  }}
                >
                  <FiEdit className="h-4 w-4" />
                </Button>
              </Tooltip >
              <Tooltip text="Thêm danh mục con" position="top">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory({
                      parentId: getCategoryId(category),
                      parent: {
                        name: category.name,
                        id: getCategoryId(category),
                      }
                    })
                    setShowForm(true)
                  }}
                >
                  <FiPlus className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip text="Xóa danh mục" position="top">
                <Button
                  size="sm"
                  variant="error"
                  onClick={() => handleDelete(categoryId)}
                  disabled={deleteCategoryMutation.isLoading}
                >
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </td>
        </tr>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <>
            {renderSubCategories(category.children, level + 1)}
          </>
        )}
        </React.Fragment>
      )
    })
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Tên danh mục',
      accessor: 'name',
      render: (category) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            {category.image ? (
              <img
                className="h-8 w-8 rounded-lg object-cover"
                src={category.image}
                alt={category.name}
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center">
                <FiFolder className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-500">{category.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Danh mục cha',
      accessor: 'parent',
      render: (category) => (
        <span className="text-sm text-gray-900">
          {category.parent?.name || category.parentId?.name || 'Danh mục gốc'}
        </span>
      )
    },
    {
      header: 'Số sản phẩm',
      accessor: 'productCount',
      render: (category) => (
        <span className="text-sm text-gray-900">
          {getProductCount(category)}
        </span>
      )
    },
    {
      header: 'Danh mục con',
      accessor: 'childrenCount',
      render: (category) => (
        <span className="text-sm text-gray-900">
          {category.children?.length || 0}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (category) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      render: (category) => (
        <span className="text-sm text-gray-500">
          {new Date(category.createdAt).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (category) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory({
                ...category,
                parentId: getParentIdValue(category)
              })
              setShowForm(true)
            }}
          >
            <FiEdit className="h-4 w-4 mr-1" />
            Sửa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory({
                parentId: getCategoryId(category),
                parent: {
                  name: category.name,
                  id: getCategoryId(category),
                }
              })
              setShowForm(true)
            }}
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Thêm con
          </Button>
          <Button
            size="sm"
            variant="error"
            onClick={() => handleDelete(getCategoryId(category))}
            disabled={deleteCategoryMutation.isLoading}
          >
            <FiTrash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      )
    }
  ], [deleteCategoryMutation.isLoading, getCategoryId, getParentIdValue, getProductCount])

  // Phần trả về giao diện:
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách danh mục</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
            <p className="text-gray-600">Quản lý cấu trúc danh mục sản phẩm</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setSelectedCategory(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </div>
        </div>
      </div>
      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục cha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục con
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-pulse">Đang tải...</div>
                  </td>
                </tr>
              ) : (data?.data?.categories?.length > 0 ? (
                renderSubCategories(data.data.categories)
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có danh mục nào
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedCategory(null)
        }}
        title={getCategoryId(selectedCategory) ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        size="md"
      >
        <CategoryForm
          category={selectedCategory}
          onClose={() => {
            setShowForm(false)
            setSelectedCategory(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default CategoryList
