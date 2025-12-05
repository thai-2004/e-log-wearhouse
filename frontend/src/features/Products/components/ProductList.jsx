import React, { useState, useMemo } from 'react'
import { FiSearch, FiFilter, FiPlus, FiDownload, FiUpload, FiTrash2, FiEdit } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import ProductForm from './ProductForm'
import ProductCard from './ProductCard'
import ProductFilters from './ProductFilters'
import { useProducts, useDeleteProduct, useExportProducts } from '../hooks/useProducts'
import { API_CONFIG } from '@config'
import Tooltip from '@components/ui/Tooltip'

const ProductList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priceRange: { min: '', max: '' },
    stockRange: { min: '', max: '' }
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // API hooks
  const { data: productsData, isLoading, error } = useProducts({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    ...filters
  })

  const deleteProductMutation = useDeleteProduct()
  const exportProductsMutation = useExportProducts()

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await deleteProductMutation.mutateAsync(id)
    }
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportProductsMutation.mutate({
      search: searchQuery,
      ...filters
    })
  }

  // Helper: chuẩn hóa URL hình ảnh (convert relative /uploads -> full backend URL)
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

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Hình ảnh',
      accessor: 'imageUrl',
      render: (_value, row) => (
        <div className="flex-shrink-0 h-10 w-10">
          <img
            className="h-10 w-10 rounded-lg object-cover"
            src={getImageUrl(row?.imageUrl || row?.image)}
            alt={row?.name || 'product'}
            onError={(e) => { e.target.src = '/images/no-image.png' }}
          />
        </div>
      )
    },
    {
      header: 'Tên sản phẩm',
      accessor: 'name',
      render: (_value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row?.name || ''}</div>
          <div className="text-sm text-gray-500">SKU: {row?.sku || ''}</div>
        </div>
      )
    },
    {
      header: 'Danh mục',
      accessor: 'categoryId',
      render: (_value, row) => (
        <span className="text-sm text-gray-900">
          {row?.categoryId?.name || 'Chưa phân loại'}
        </span>
      )
    },
    {
      header: 'Giá',
      accessor: 'sellingPrice',
      render: (_value, row) => (
        <span className="text-sm font-medium text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(row?.sellingPrice || 0)}
        </span>
      )
    },
    {
      header: 'Tồn kho',
      accessor: 'stock',
      render: (_value, row) => (
        <div className="flex items-center">
          <span className={`text-sm font-medium ${(row?.stock || 0) <= (row?.minStock || 0)
            ? 'text-red-600'
            : (row?.stock || 0) <= (row?.minStock || 0) * 2
              ? 'text-yellow-600'
              : 'text-green-600'
            }`}>
            {row?.stock ?? 0}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            / {row?.minStock ?? 0} min
          </span>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (_value, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row?.isActive === false
          ? 'bg-gray-100 text-gray-800'
          : 'bg-green-100 text-green-800'
          }`}>
          {row?.isActive === false ? 'Ngừng bán' : 'Hoạt động'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (_value, row) => (
        <div className="flex space-x-2">
          <Tooltip text="Chỉnh sửa sản phẩm" position="top">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProduct(row)
                setShowForm(true)
              }}
            >
              <FiEdit className="h-4 w-4" />
            </Button>
          </Tooltip >
          <Tooltip text="Xóa sản phẩm" position="top">
            <Button
              size="sm"
              variant="error"
              onClick={() => row?._id && handleDelete(row._id)}
              disabled={deleteProductMutation.isLoading || !row?._id}
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [deleteProductMutation.isLoading])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách sản phẩm</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý danh sách sản phẩm trong kho</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Lọc
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportProductsMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất file
            </Button>
            <Button
              onClick={() => {
                setSelectedProduct(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên, SKU, barcode..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Table
        columns={columns}
        data={productsData?.data?.products || []}
        loading={isLoading}
        emptyMessage="Không có sản phẩm nào"
      />

      {/* Pagination */}
      {productsData?.data?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, productsData.data.pagination.total)} trong tổng số{' '}
              {productsData.data.pagination.total} sản phẩm
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
                Trang {currentPage} / {productsData.data.pagination.pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === productsData.data.pagination.pages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc sản phẩm"
        size="md"
      >
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      </Modal>
    </div>
  )
}

export default ProductList
