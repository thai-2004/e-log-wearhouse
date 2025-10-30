import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiUpload, FiTruck, FiCheckCircle, FiXCircle, FiEdit, FiTrash2, FiEye, FiMapPin, FiStar, FiPackage, FiDollarSign } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import SupplierForm from './SupplierForm'
import SupplierCard from './SupplierCard'
import { useSuppliers, useDeleteSupplier, useUpdateSupplierStatus, useExportSuppliers, useImportSuppliers, useSuppliersOverview } from '../hooks/useSuppliers'

const SupplierList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table, card
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    rating: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: suppliersData, isLoading, error } = useSuppliers({
    page: currentPage,
    limit: pageSize,
    ...filters
  })
  
  const { data: overviewData } = useSuppliersOverview()
  const deleteSupplierMutation = useDeleteSupplier()
  const updateStatusMutation = useUpdateSupplierStatus()
  const exportSuppliersMutation = useExportSuppliers()
  const importSuppliersMutation = useImportSuppliers()

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa nhà cung cấp
  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      await deleteSupplierMutation.mutateAsync(supplierId)
    }
  }

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (supplierId, status) => {
    await updateStatusMutation.mutateAsync({ id: supplierId, status })
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportSuppliersMutation.mutate(filters)
  }

  // Xử lý import file
  const handleImport = async (file) => {
    await importSuppliersMutation.mutateAsync(file)
    setShowImport(false)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Nhà cung cấp',
      accessor: 'supplier',
      render: (_value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={row?.logo || '/images/default-supplier.png'}
              alt={row?.name || 'supplier'}
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-900">
                {row?.name || ''}
              </div>
              {row?.isTopSupplier && (
                <FiStar className="h-4 w-4 text-yellow-500 ml-2" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {row?.email || ''}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Danh mục',
      accessor: 'category',
      render: (_value, row) => (
        <span className="text-sm text-gray-900">
          {row?.category || 'Chưa phân loại'}
        </span>
      )
    },
    {
      header: 'Điện thoại',
      accessor: 'phone',
      render: (_value, row) => (
        <span className="text-sm text-gray-900">
          {row?.phone || 'Chưa có'}
        </span>
      )
    },
    {
      header: 'Địa chỉ',
      accessor: 'address',
      render: (_value, row) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {row?.defaultAddress?.address || 'Chưa có địa chỉ'}
        </div>
      )
    },
    {
      header: 'Đánh giá',
      accessor: 'rating',
      render: (_value, row) => (
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(row?.averageRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({row?.totalRatings || 0})
          </span>
        </div>
      )
    },
    {
      header: 'Sản phẩm',
      accessor: 'products',
      render: (_value, row) => (
        <span className="text-sm font-medium text-blue-600">
          {row?.totalProducts || 0} sản phẩm
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (_value, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row?.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : row?.status === 'inactive'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row?.status === 'active' ? 'Hoạt động' : 
           row?.status === 'inactive' ? 'Không hoạt động' : 'Chờ xác nhận'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      render: (_value, row) => (
        <span className="text-sm text-gray-900">
          {row?.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : ''}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (_value, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSupplier(row)
              setShowCard(true)
            }}
          >
            <FiEye className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSupplier(row)
              setShowForm(true)
            }}
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => row?._id && handleUpdateStatus(row._id, row.status === 'active' ? 'inactive' : 'active')}
            loading={updateStatusMutation.isLoading}
          >
            {row?.status === 'active' ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => row?._id && handleDeleteSupplier(row._id)}
            loading={deleteSupplierMutation.isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [deleteSupplierMutation.isLoading, updateStatusMutation.isLoading])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách nhà cung cấp</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
            <p className="text-gray-600">Quản lý thông tin và hợp đồng với nhà cung cấp</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'table'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bảng
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  viewMode === 'card'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Thẻ
              </button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowImport(true)}
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Import
            </Button>
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
              disabled={exportSuppliersMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedSupplier(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm nhà cung cấp
            </Button>
          </div>
        </div>

        {/* Supplier Stats */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiTruck className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Tổng nhà cung cấp</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {overviewData.totalSuppliers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Hoạt động</p>
                  <p className="text-2xl font-bold text-green-900">
                    {overviewData.activeSuppliers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiStar className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Top nhà cung cấp</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {overviewData.topSuppliers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiPackage className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Sản phẩm</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {overviewData.totalProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suppliers Table/Cards */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={suppliersData?.data?.suppliers || []}
          loading={isLoading}
          emptyMessage="Không có nhà cung cấp nào"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliersData?.suppliers?.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={() => {
                setSelectedSupplier(supplier)
                setShowForm(true)
              }}
              onView={() => {
                setSelectedSupplier(supplier)
                setShowCard(true)
              }}
              onDelete={() => handleDeleteSupplier(supplier.id)}
              onToggleStatus={() => handleUpdateStatus(supplier.id, supplier.status === 'active' ? 'inactive' : 'active')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {suppliersData?.data?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, suppliersData.data.pagination.total)} trong tổng số{' '}
              {suppliersData.data.pagination.total} nhà cung cấp
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
                Trang {currentPage} / {suppliersData.data.pagination.pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === suppliersData.data.pagination.pages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        size="lg"
      >
        <SupplierForm
          supplier={selectedSupplier}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Supplier Card Modal */}
      <Modal
        isOpen={showCard}
        onClose={() => setShowCard(false)}
        title="Chi tiết nhà cung cấp"
        size="xl"
      >
        <SupplierCard
          supplier={selectedSupplier}
          detailed={true}
          onClose={() => setShowCard(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import danh sách nhà cung cấp"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Kéo thả file Excel vào đây hoặc click để chọn file
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="import-file"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  handleImport(file)
                }
              }}
            />
            <label
              htmlFor="import-file"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Chọn file
            </label>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>File phải có định dạng Excel (.xlsx, .xls)</li>
              <li>Cột bắt buộc: Tên công ty, Email</li>
              <li>Cột tùy chọn: Điện thoại, Địa chỉ, Danh mục</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc nhà cung cấp"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tìm theo tên công ty, email hoặc điện thoại..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.category}
              onChange={(e) => handleFiltersChange({ ...filters, category: e.target.value })}
            >
              <option value="">Tất cả danh mục</option>
              <option value="electronics">Điện tử</option>
              <option value="clothing">Thời trang</option>
              <option value="food">Thực phẩm</option>
              <option value="books">Sách</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="pending">Chờ xác nhận</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá tối thiểu
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.rating}
              onChange={(e) => handleFiltersChange({ ...filters, rating: e.target.value })}
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao trở lên</option>
              <option value="3">3 sao trở lên</option>
              <option value="2">2 sao trở lên</option>
              <option value="1">1 sao trở lên</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowFilters(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SupplierList
