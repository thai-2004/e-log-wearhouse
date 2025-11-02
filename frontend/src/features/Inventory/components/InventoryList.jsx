import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiAlertTriangle, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import InventoryForm from './InventoryForm'
import StockAdjustment from './StockAdjustment'
import StockAlert from './StockAlert'
import { useInventory, useLowStockItems, useZeroStockItems, useOverstockItems, useExportInventory } from '../hooks/useInventory'

const InventoryList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showAdjustment, setShowAdjustment] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [filters, setFilters] = useState({
    warehouse: '',
    product: '',
    lowStock: false,
    zeroStock: false,
    overstock: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: inventoryData, isLoading, error } = useInventory({
    page: currentPage,
    limit: pageSize,
    ...filters
  })
  
  const { data: lowStockData } = useLowStockItems()
  const { data: zeroStockData } = useZeroStockItems()
  const { data: overstockData } = useOverstockItems()
  const exportInventoryMutation = useExportInventory()

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportInventoryMutation.mutate(filters)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Sản phẩm',
      accessor: 'product',
      render: (inventory) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-lg object-cover"
              src={inventory.product?.image || '/images/no-image.png'}
              alt={inventory.product?.name}
            />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {inventory.product?.name}
            </div>
            <div className="text-sm text-gray-500">
              SKU: {inventory.product?.sku}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Kho',
      accessor: 'warehouse',
      render: (inventory) => (
        <span className="text-sm text-gray-900">
          {inventory.warehouse?.name || 'Chưa phân kho'}
        </span>
      )
    },
    {
      header: 'Vị trí',
      accessor: 'location',
      render: (inventory) => (
        <span className="text-sm text-gray-900">
          {inventory.location?.name || 'Chưa phân vị trí'}
        </span>
      )
    },
    {
      header: 'Tồn kho',
      accessor: 'quantity',
      render: (inventory) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {inventory.quantity || 0}
          </span>
          <span className="text-xs text-gray-500">
            Có thể dùng: {inventory.availableQuantity || 0}
          </span>
        </div>
      )
    },
    {
      header: 'Đã giữ',
      accessor: 'reservedQuantity',
      render: (inventory) => (
        <span className="text-sm text-gray-900">
          {inventory.reservedQuantity || 0}
        </span>
      )
    },
    {
      header: 'Tồn kho tối thiểu',
      accessor: 'minStock',
      render: (inventory) => (
        <span className="text-sm text-gray-900">
          {inventory.product?.minStock || 0}
        </span>
      )
    },
    {
      header: 'Tồn kho tối đa',
      accessor: 'maxStock',
      render: (inventory) => (
        <span className="text-sm text-gray-900">
          {inventory.product?.maxStock || 'Không giới hạn'}
        </span>
      )
    },
    {
      header: 'Giá trị tồn kho',
      accessor: 'value',
      render: (inventory) => (
        <span className="text-sm font-medium text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(inventory.value || 0)}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (inventory) => {
        const quantity = inventory.quantity || 0
        const available = inventory.availableQuantity || 0
        const reserved = inventory.reservedQuantity || 0
        const minStock = inventory.product?.reorderPoint || inventory.product?.minStock || 0
        
        if (quantity === 0) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FiAlertTriangle className="h-3 w-3 mr-1" />
              Hết hàng
            </span>
          )
        } else if (available <= minStock) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <FiTrendingDown className="h-3 w-3 mr-1" />
              Sắp hết
            </span>
          )
        } else if (reserved > 0 && available === 0) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <FiPackage className="h-3 w-3 mr-1" />
              Đã giữ hết
            </span>
          )
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <FiPackage className="h-3 w-3 mr-1" />
              Bình thường
            </span>
          )
        }
      }
    },
    {
      header: 'Cập nhật cuối',
      accessor: 'updatedAt',
      render: (inventory) => (
        <span className="text-sm text-gray-500">
          {new Date(inventory.updatedAt).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (inventory) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedInventory(inventory)
              setShowAdjustment(true)
            }}
          >
            Điều chỉnh
          </Button>
        </div>
      )
    }
  ], [])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách tồn kho</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>
            <p className="text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
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
              disabled={exportInventoryMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedInventory(null)
                setShowAdjustment(true)
              }}
              className="mr-3"
            >
              <FiTrendingUp className="h-4 w-4 mr-2" />
              Điều chỉnh tồn kho
            </Button>
            <Button
              onClick={() => {
                setSelectedInventory(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Tạo bản ghi tồn kho
            </Button>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Hết hàng</p>
                <p className="text-2xl font-bold text-red-900">
                  {zeroStockData?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiTrendingDown className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {lowStockData?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiTrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Tồn kho cao</p>
                <p className="text-2xl font-bold text-blue-900">
                  {overstockData?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <Table
        columns={columns}
        data={inventoryData?.data?.inventories || inventoryData?.inventories || []}
        loading={isLoading}
        emptyMessage="Không có dữ liệu tồn kho"
      />

      {/* Pagination */}
      {inventoryData?.data?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, inventoryData.data.pagination.total)} trong tổng số{' '}
              {inventoryData.data.pagination.total} bản ghi
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
                Trang {currentPage} / {inventoryData.data.pagination.pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === inventoryData.data.pagination.pages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Inventory Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Tạo bản ghi tồn kho mới"
        size="lg"
      >
        <InventoryForm
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustment}
        onClose={() => {
          setShowAdjustment(false)
          setSelectedInventory(null)
        }}
        title="Điều chỉnh tồn kho"
        size="lg"
      >
        <StockAdjustment
          inventory={selectedInventory}
          onClose={() => {
            setShowAdjustment(false)
            setSelectedInventory(null)
          }}
        />
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc tồn kho"
        size="md"
      >
        <div className="space-y-4">
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
              Tình trạng tồn kho
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={filters.lowStock}
                  onChange={(e) => handleFiltersChange({ ...filters, lowStock: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Sắp hết hàng</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={filters.zeroStock}
                  onChange={(e) => handleFiltersChange({ ...filters, zeroStock: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Hết hàng</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={filters.overstock}
                  onChange={(e) => handleFiltersChange({ ...filters, overstock: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Tồn kho cao</span>
              </label>
            </div>
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

export default InventoryList
