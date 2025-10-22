import React, { useState, useMemo } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiChevronRight, FiChevronDown, FiFolder, FiFolderOpen } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import CategoryForm from './CategoryForm'
import { useCategories, useDeleteCategory, useMoveCategory } from '../hooks/useCategories'

const CategoryList = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: categoriesData, isLoading, error } = useCategories({
    page: currentPage,
    limit: pageSize,
    includeChildren: true
  })
  
  const deleteCategoryMutation = useDeleteCategory()
  const moveCategoryMutation = useMoveCategory()

  // Xử lý mở rộng/thu gọn danh mục
  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Xử lý xóa danh mục
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con và sản phẩm sẽ bị ảnh hưởng.')) {
      await deleteCategoryMutation.mutateAsync(id)
    }
  }

  // Xử lý di chuyển danh mục
  const handleMove = async (categoryId, newParentId) => {
    await moveCategoryMutation.mutateAsync({ id: categoryId, newParentId })
  }

  // Render danh mục con
  const renderSubCategories = (categories, level = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {category.children && category.children.length > 0 ? (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  {expandedCategories.has(category.id) ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-6 mr-2" />
              )}
              
              {expandedCategories.has(category.id) ? (
                <FiFolderOpen className="h-4 w-4 text-blue-500 mr-2" />
              ) : (
                <FiFolder className="h-4 w-4 text-blue-500 mr-2" />
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500">{category.description}</div>
                )}
              </div>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.parent?.name || 'Danh mục gốc'}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.productCount || 0}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.children?.length || 0}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isActive 
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedCategory(category)
                  setShowForm(true)
                }}
              >
                <FiEdit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedCategory({ ...category, parentId: category.parent?.id })
                  setShowForm(true)
                }}
              >
                <FiPlus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="error"
                onClick={() => handleDelete(category.id)}
                disabled={deleteCategoryMutation.isLoading}
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
        
        {/* Render children if expanded */}
        {expandedCategories.has(category.id) && category.children && (
          <>
            {renderSubCategories(category.children, level + 1)}
          </>
        )}
      </React.Fragment>
    ))
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
          {category.parent?.name || 'Danh mục gốc'}
        </span>
      )
    },
    {
      header: 'Số sản phẩm',
      accessor: 'productCount',
      render: (category) => (
        <span className="text-sm text-gray-900">
          {category.productCount || 0}
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.isActive 
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
              setSelectedCategory(category)
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
              setSelectedCategory({ parentId: category.id })
              setShowForm(true)
            }}
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Thêm con
          </Button>
          <Button
            size="sm"
            variant="error"
            onClick={() => handleDelete(category.id)}
            disabled={deleteCategoryMutation.isLoading}
          >
            <FiTrash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      )
    }
  ], [deleteCategoryMutation.isLoading])

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
              ) : categoriesData?.categories?.length > 0 ? (
                renderSubCategories(categoriesData.categories)
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {categoriesData?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, categoriesData.pagination.total)} trong tổng số{' '}
              {categoriesData.pagination.total} danh mục
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-700">
                Trang {currentPage} / {categoriesData.pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === categoriesData.pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedCategory?.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        size="md"
      >
        <CategoryForm
          category={selectedCategory}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}

export default CategoryList
