import React, { useState, useMemo } from 'react'
import { FiArrowUp, FiArrowDown, FiPackage, FiCalendar, FiFilter } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import { useInventoryMovements } from '../hooks/useInventory'

const InventoryMovements = () => {
  const [filters, setFilters] = useState({
    product: '',
    warehouse: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: movementsData, isLoading, error } = useInventoryMovements({
    page: currentPage,
    limit: pageSize,
    ...filters
  })

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Thời gian',
      accessor: 'createdAt',
      render: (movement) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(movement.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(movement.createdAt).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      )
    },
    {
      header: 'Sản phẩm',
      accessor: 'product',
      render: (movement) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <img
              className="h-8 w-8 rounded object-cover"
              src={movement.product?.image || '/images/no-image.png'}
              alt={movement.product?.name}
            />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {movement.product?.name}
            </div>
            <div className="text-sm text-gray-500">
              SKU: {movement.product?.sku}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Kho',
      accessor: 'warehouse',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.warehouse?.name || 'Chưa phân kho'}
        </span>
      )
    },
    {
      header: 'Loại di chuyển',
      accessor: 'type',
      render: (movement) => {
        const typeConfig = {
          'inbound': { text: 'Nhập kho', color: 'bg-green-100 text-green-800', icon: FiArrowUp },
          'outbound': { text: 'Xuất kho', color: 'bg-red-100 text-red-800', icon: FiArrowDown },
          'transfer': { text: 'Chuyển kho', color: 'bg-blue-100 text-blue-800', icon: FiPackage },
          'adjustment': { text: 'Điều chỉnh', color: 'bg-yellow-100 text-yellow-800', icon: FiPackage },
          'stocktake': { text: 'Kiểm kê', color: 'bg-purple-100 text-purple-800', icon: FiPackage }
        }
        
        const config = typeConfig[movement.type] || typeConfig['adjustment']
        const Icon = config.icon
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.text}
          </span>
        )
      }
    },
    {
      header: 'Số lượng',
      accessor: 'quantity',
      render: (movement) => (
        <div className="text-right">
          <div className={`text-sm font-medium ${
            movement.type === 'inbound' ? 'text-green-600' :
            movement.type === 'outbound' ? 'text-red-600' :
            'text-gray-900'
          }`}>
            {movement.type === 'inbound' ? '+' : movement.type === 'outbound' ? '-' : ''}
            {Math.abs(movement.quantity)}
          </div>
        </div>
      )
    },
    {
      header: 'Tồn kho trước',
      accessor: 'stockBefore',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.stockBefore}
        </span>
      )
    },
    {
      header: 'Tồn kho sau',
      accessor: 'stockAfter',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.stockAfter}
        </span>
      )
    },
    {
      header: 'Lý do',
      accessor: 'reason',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.reason || 'Không có'}
        </span>
      )
    },
    {
      header: 'Tham chiếu',
      accessor: 'reference',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.reference || 'Không có'}
        </span>
      )
    },
    {
      header: 'Người thực hiện',
      accessor: 'user',
      render: (movement) => (
        <span className="text-sm text-gray-900">
          {movement.user?.name || 'Hệ thống'}
        </span>
      )
    }
  ], [])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải lịch sử di chuyển tồn kho</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử di chuyển tồn kho</h1>
            <p className="text-gray-600">Theo dõi tất cả các thay đổi tồn kho</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setFilters({
                product: '',
                warehouse: '',
                type: '',
                dateFrom: '',
                dateTo: ''
              })}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sản phẩm
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.product}
              onChange={(e) => handleFiltersChange({ ...filters, product: e.target.value })}
            >
              <option value="">Tất cả sản phẩm</option>
              <option value="product1">Sản phẩm 1</option>
              <option value="product2">Sản phẩm 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kho
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.warehouse}
              onChange={(e) => handleFiltersChange({ ...filters, warehouse: e.target.value })}
            >
              <option value="">Tất cả kho</option>
              <option value="warehouse1">Kho chính</option>
              <option value="warehouse2">Kho phụ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại di chuyển
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.type}
              onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
            >
              <option value="">Tất cả loại</option>
              <option value="inbound">Nhập kho</option>
              <option value="outbound">Xuất kho</option>
              <option value="transfer">Chuyển kho</option>
              <option value="adjustment">Điều chỉnh</option>
              <option value="stocktake">Kiểm kê</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.dateFrom}
              onChange={(e) => handleFiltersChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.dateTo}
              onChange={(e) => handleFiltersChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <Table
        columns={columns}
        data={movementsData?.movements || []}
        loading={isLoading}
        emptyMessage="Không có lịch sử di chuyển nào"
      />

      {/* Pagination */}
      {movementsData?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, movementsData.pagination.total)} trong tổng số{' '}
              {movementsData.pagination.total} bản ghi
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
                Trang {currentPage} / {movementsData.pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === movementsData.pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryMovements
