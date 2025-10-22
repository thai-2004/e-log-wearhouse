import React, { useState, useMemo } from 'react'
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiUpload, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiCopy,
  FiTruck,
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw
} from 'react-icons/fi'
import { useOutbounds, useOutboundsOverview, useDeleteOutbound, useConfirmOutbound, useCancelOutbound, useDuplicateOutbound, useExportOutbounds, useImportOutbounds } from '../hooks/useOutbound'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Modal from '@components/ui/Modal'
import OutboundCard from './OutboundCard'
import OutboundForm from './OutboundForm'
import toast from 'react-hot-toast'

const OutboundList = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('table') // table, card
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedOutbound, setSelectedOutbound] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)

  // API hooks
  const { data: outboundsData, isLoading, error, refetch } = useOutbounds({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    warehouse: warehouseFilter !== 'all' ? warehouseFilter : undefined,
    customer: customerFilter !== 'all' ? customerFilter : undefined,
    date: dateFilter !== 'all' ? dateFilter : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage
  })

  const { data: overviewData } = useOutboundsOverview()
  const deleteOutboundMutation = useDeleteOutbound()
  const confirmOutboundMutation = useConfirmOutbound()
  const cancelOutboundMutation = useCancelOutbound()
  const duplicateOutboundMutation = useDuplicateOutbound()
  const exportOutboundsMutation = useExportOutbounds()
  const importOutboundsMutation = useImportOutbounds()

  // Computed values
  const outbounds = outboundsData?.data || []
  const totalItems = outboundsData?.total || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ]

  const warehouseOptions = [
    { value: 'all', label: 'Tất cả kho' },
    { value: 'warehouse-1', label: 'Kho Hà Nội' },
    { value: 'warehouse-2', label: 'Kho TP.HCM' },
    { value: 'warehouse-3', label: 'Kho Đà Nẵng' }
  ]

  const customerOptions = [
    { value: 'all', label: 'Tất cả khách hàng' },
    { value: 'customer-1', label: 'Công ty ABC' },
    { value: 'customer-2', label: 'Công ty XYZ' },
    { value: 'customer-3', label: 'Công ty DEF' }
  ]

  const dateOptions = [
    { value: 'all', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'thisWeek', label: 'Tuần này' },
    { value: 'lastWeek', label: 'Tuần trước' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'lastMonth', label: 'Tháng trước' },
    { value: 'thisYear', label: 'Năm nay' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'outboundNumber', label: 'Số phiếu xuất' },
    { value: 'totalValue', label: 'Tổng giá trị' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'customer', label: 'Khách hàng' }
  ]

  // Event handlers
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value)
        break
      case 'warehouse':
        setWarehouseFilter(value)
        break
      case 'customer':
        setCustomerFilter(value)
        break
      case 'date':
        setDateFilter(value)
        break
      case 'sortBy':
        setSortBy(value)
        break
      case 'sortOrder':
        setSortOrder(value)
        break
    }
    setCurrentPage(1)
  }

  const handleViewOutbound = (outbound) => {
    setSelectedOutbound(outbound)
  }

  const handleEditOutbound = (outbound) => {
    setSelectedOutbound(outbound)
    setShowForm(true)
  }

  const handleDeleteOutbound = async (outbound) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu xuất kho "${outbound.outboundNumber}"?`)) {
      try {
        await deleteOutboundMutation.mutateAsync(outbound.id)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const handleConfirmOutbound = async (outbound) => {
    if (window.confirm(`Bạn có chắc chắn muốn xác nhận phiếu xuất kho "${outbound.outboundNumber}"?`)) {
      try {
        await confirmOutboundMutation.mutateAsync(outbound.id)
      } catch (error) {
        console.error('Confirm error:', error)
      }
    }
  }

  const handleCancelOutbound = async (outbound) => {
    const reason = window.prompt('Lý do hủy phiếu xuất kho:')
    if (reason) {
      try {
        await cancelOutboundMutation.mutateAsync({ id: outbound.id, reason })
      } catch (error) {
        console.error('Cancel error:', error)
      }
    }
  }

  const handleDuplicateOutbound = async (outbound) => {
    try {
      await duplicateOutboundMutation.mutateAsync(outbound.id)
    } catch (error) {
      console.error('Duplicate error:', error)
    }
  }

  const handleExportOutbounds = async () => {
    try {
      await exportOutboundsMutation.mutateAsync({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        warehouse: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        customer: customerFilter !== 'all' ? customerFilter : undefined,
        date: dateFilter !== 'all' ? dateFilter : undefined,
        sortBy,
        sortOrder
      })
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleImportOutbounds = async () => {
    if (!importFile) {
      toast.error('Vui lòng chọn file để import')
      return
    }

    try {
      await importOutboundsMutation.mutateAsync(importFile)
      setShowImportModal(false)
      setImportFile(null)
    } catch (error) {
      console.error('Import error:', error)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImportFile(file)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    refetch()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Chờ xử lý'
      case 'processing':
        return 'Đang xử lý'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-4 w-4" />
      case 'pending':
        return <FiAlertCircle className="h-4 w-4" />
      case 'processing':
        return <FiPackage className="h-4 w-4" />
      case 'cancelled':
        return <FiXCircle className="h-4 w-4" />
      default:
        return <FiPackage className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</div>
        <Button onClick={handleRefresh}>
          <FiRefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý xuất kho</h1>
          <p className="text-gray-600">Quản lý phiếu xuất kho và theo dõi trạng thái giao hàng</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
          >
            <FiUpload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExportOutbounds}
            disabled={exportOutboundsMutation.isLoading}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <FiPlus className="h-4 w-4 mr-2" />
            Tạo phiếu xuất
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiPackage className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng phiếu xuất</p>
                <p className="text-2xl font-bold text-gray-900">{overviewData.totalOutbounds || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{overviewData.pendingOutbounds || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{overviewData.completedOutbounds || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng giá trị</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(overviewData.totalValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="Tìm kiếm phiếu xuất kho..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<FiSearch className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Hiển thị:</span>
              <Select
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'table', label: 'Bảng' },
                  { value: 'card', label: 'Card' }
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sắp xếp:</span>
              <Select
                value={sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                options={sortOptions}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <FiTrendingUp className="h-4 w-4" /> : <FiTrendingDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <Select
                  value={statusFilter}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={statusOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kho xuất</label>
                <Select
                  value={warehouseFilter}
                  onChange={(value) => handleFilterChange('warehouse', value)}
                  options={warehouseOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                <Select
                  value={customerFilter}
                  onChange={(value) => handleFilterChange('customer', value)}
                  options={customerOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                <Select
                  value={dateFilter}
                  onChange={(value) => handleFilterChange('date', value)}
                  options={dateOptions}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phiếu xuất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kho xuất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outbounds.map((outbound) => (
                  <tr key={outbound.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiTruck className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {outbound.outboundNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {outbound.type || 'Xuất kho thường'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          <img
                            className="h-6 w-6 rounded-full object-cover"
                            src={outbound.customer?.avatar || '/images/default-avatar.png'}
                            alt={outbound.customer?.name}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {outbound.customer?.name || 'Chưa chọn khách hàng'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {outbound.customer?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {outbound.warehouse?.name || 'Chưa chọn kho'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {outbound.warehouse?.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {outbound.totalItems || 0} sản phẩm
                      </div>
                      <div className="text-sm text-gray-500">
                        {outbound.totalQuantity || 0} đơn vị
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(outbound.totalValue || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(outbound.status)}`}>
                        {getStatusIcon(outbound.status)}
                        <span className="ml-1">{getStatusText(outbound.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(outbound.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOutbound(outbound)}
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOutbound(outbound)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        {outbound.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmOutbound(outbound)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {outbound.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOutbound(outbound)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiXCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateOutbound(outbound)}
                        >
                          <FiCopy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOutbound(outbound)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outbounds.map((outbound) => (
            <OutboundCard
              key={outbound.id}
              outbound={outbound}
              onView={() => handleViewOutbound(outbound)}
              onEdit={() => handleEditOutbound(outbound)}
              onDelete={() => handleDeleteOutbound(outbound)}
              onConfirm={() => handleConfirmOutbound(outbound)}
              onCancel={() => handleCancelOutbound(outbound)}
              onDuplicate={() => handleDuplicateOutbound(outbound)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>
                {' '}trong{' '}
                <span className="font-medium">{totalItems}</span>
                {' '}kết quả
              </span>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                options={[
                  { value: 10, label: '10' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' }
                ]}
              />
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedOutbound(null)
        }}
        title={selectedOutbound ? 'Chỉnh sửa phiếu xuất kho' : 'Tạo phiếu xuất kho mới'}
        size="xl"
      >
        <OutboundForm
          outbound={selectedOutbound}
          onClose={() => {
            setShowForm(false)
            setSelectedOutbound(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setSelectedOutbound(null)
            refetch()
          }}
        />
      </Modal>

      <Modal
        isOpen={!!selectedOutbound && !showForm}
        onClose={() => setSelectedOutbound(null)}
        title="Chi tiết phiếu xuất kho"
        size="xl"
      >
        <OutboundCard
          outbound={selectedOutbound}
          detailed={true}
          onClose={() => setSelectedOutbound(null)}
          onEdit={() => {
            setShowForm(true)
            setSelectedOutbound(null)
          }}
          onDelete={() => {
            handleDeleteOutbound(selectedOutbound)
            setSelectedOutbound(null)
          }}
          onConfirm={() => {
            handleConfirmOutbound(selectedOutbound)
            setSelectedOutbound(null)
          }}
          onCancel={() => {
            handleCancelOutbound(selectedOutbound)
            setSelectedOutbound(null)
          }}
          onDuplicate={() => {
            handleDuplicateOutbound(selectedOutbound)
            setSelectedOutbound(null)
          }}
        />
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false)
          setImportFile(null)
        }}
        title="Import phiếu xuất kho"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>File Excel phải có định dạng:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Dòng đầu tiên chứa tiêu đề cột</li>
              <li>Các cột bắt buộc: Số phiếu xuất, Khách hàng, Kho xuất, Sản phẩm, Số lượng</li>
              <li>Định dạng ngày: DD/MM/YYYY</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false)
                setImportFile(null)
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleImportOutbounds}
              disabled={!importFile || importOutboundsMutation.isLoading}
            >
              {importOutboundsMutation.isLoading ? 'Đang import...' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OutboundList
