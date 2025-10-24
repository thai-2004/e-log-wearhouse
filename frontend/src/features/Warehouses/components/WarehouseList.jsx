import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiUpload, FiMapPin, FiCheckCircle, FiXCircle, FiEdit, FiTrash2, FiEye, FiPackage, FiTruck } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import WarehouseForm from './WarehouseForm'
import WarehouseCard from './WarehouseCard'
import { useWarehouses, useDeleteWarehouse, useUpdateWarehouseStatus, useExportWarehouses, useImportWarehouses, useWarehousesOverview } from '../hooks/useWarehouses'

const WarehouseList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table, card
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    location: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: warehousesData, isLoading, error } = useWarehouses({
    page: currentPage,
    limit: pageSize,
    ...filters
  })
  
  const { data: overviewData } = useWarehousesOverview()
  const deleteWarehouseMutation = useDeleteWarehouse()
  const updateStatusMutation = useUpdateWarehouseStatus()
  const exportWarehousesMutation = useExportWarehouses()
  const importWarehousesMutation = useImportWarehouses()

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa kho
  const handleDeleteWarehouse = async (warehouseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
      await deleteWarehouseMutation.mutateAsync(warehouseId)
    }
  }

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (warehouseId, status) => {
    await updateStatusMutation.mutateAsync({ id: warehouseId, status })
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportWarehousesMutation.mutate(filters)
  }

  // Xử lý import file
  const handleImport = async (file) => {
    await importWarehousesMutation.mutateAsync(file)
    setShowImport(false)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Kho',
      accessor: 'warehouse',
      render: (warehouse) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiMapPin className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {warehouse.name}
            </div>
            <div className="text-sm text-gray-500">
              {warehouse.code}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Loại kho',
      accessor: 'type',
      render: (warehouse) => (
        <span className="text-sm text-gray-900">
          {warehouse.type === 'main' ? 'Kho chính' : 
           warehouse.type === 'branch' ? 'Kho chi nhánh' : 
           warehouse.type === 'cold' ? 'Kho lạnh' : 'Kho thường'}
        </span>
      )
    },
    {
      header: 'Địa chỉ',
      accessor: 'address',
      render: (warehouse) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {warehouse.address || 'Chưa có địa chỉ'}
        </div>
      )
    },
    {
      header: 'Dung tích',
      accessor: 'capacity',
      render: (warehouse) => (
        <span className="text-sm text-gray-900">
          {warehouse.capacity ? `${warehouse.capacity} m²` : 'Chưa xác định'}
        </span>
      )
    },
    {
      header: 'Sản phẩm',
      accessor: 'products',
      render: (warehouse) => (
        <span className="text-sm font-medium text-blue-600">
          {warehouse.totalProducts || 0} sản phẩm
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (warehouse) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          warehouse.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : warehouse.status === 'inactive'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {warehouse.status === 'active' ? 'Hoạt động' : 
           warehouse.status === 'inactive' ? 'Không hoạt động' : 'Bảo trì'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      render: (warehouse) => (
        <span className="text-sm text-gray-900">
          {new Date(warehouse.createdAt).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (warehouse) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedWarehouse(warehouse)
              setShowCard(true)
            }}
          >
            <FiEye className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedWarehouse(warehouse)
              setShowForm(true)
            }}
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStatus(warehouse.id, warehouse.status === 'active' ? 'inactive' : 'active')}
            loading={updateStatusMutation.isLoading}
          >
            {warehouse.status === 'active' ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteWarehouse(warehouse.id)}
            loading={deleteWarehouseMutation.isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [deleteWarehouseMutation.isLoading, updateStatusMutation.isLoading])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách kho</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý kho hàng</h1>
            <p className="text-gray-600">Quản lý vị trí và thông tin các kho hàng</p>
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
              disabled={exportWarehousesMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedWarehouse(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm kho mới
            </Button>
          </div>
        </div>

        {/* Warehouse Stats */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiMapPin className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Tổng kho</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {overviewData.totalWarehouses}
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
                    {overviewData.activeWarehouses}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiTruck className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Bảo trì</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {overviewData.maintenanceWarehouses}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiPackage className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Tổng dung tích</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {overviewData.totalCapacity} m²
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warehouses Table/Cards */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={warehousesData?.warehouses || []}
          loading={isLoading}
          emptyMessage="Không có dữ liệu kho"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehousesData?.warehouses?.map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              onEdit={() => {
                setSelectedWarehouse(warehouse)
                setShowForm(true)
              }}
              onView={() => {
                setSelectedWarehouse(warehouse)
                setShowCard(true)
              }}
              onDelete={() => handleDeleteWarehouse(warehouse.id)}
              onToggleStatus={() => handleUpdateStatus(warehouse.id, warehouse.status === 'active' ? 'inactive' : 'active')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {warehousesData?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, warehousesData.pagination.total)} trong tổng số{' '}
              {warehousesData.pagination.total} bản ghi
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
                Trang {currentPage} / {warehousesData.pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === warehousesData.pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedWarehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
        size="lg"
      >
        <WarehouseForm
          warehouse={selectedWarehouse}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Warehouse Card Modal */}
      <Modal
        isOpen={showCard}
        onClose={() => setShowCard(false)}
        title="Chi tiết kho"
        size="xl"
      >
        <WarehouseCard
          warehouse={selectedWarehouse}
          detailed={true}
          onClose={() => setShowCard(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import danh sách kho"
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
              <li>Cột bắt buộc: Tên kho, Mã kho</li>
              <li>Cột tùy chọn: Địa chỉ, Dung tích, Loại kho</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc kho"
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
              placeholder="Tìm theo tên kho hoặc mã kho..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại kho
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.type}
              onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
            >
              <option value="">Tất cả loại kho</option>
              <option value="main">Kho chính</option>
              <option value="branch">Kho chi nhánh</option>
              <option value="cold">Kho lạnh</option>
              <option value="normal">Kho thường</option>
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
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tìm theo địa chỉ..."
              value={filters.location}
              onChange={(e) => handleFiltersChange({ ...filters, location: e.target.value })}
            />
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

export default WarehouseList
