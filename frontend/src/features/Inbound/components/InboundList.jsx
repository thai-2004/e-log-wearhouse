import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiUpload, FiPackage, FiCheckCircle, FiXCircle, FiEdit, FiTrash2, FiEye, FiTruck, FiCalendar, FiDollarSign, FiFileText, FiCopy, FiAlertCircle } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import InboundForm from './InboundForm'
import InboundCard from './InboundCard'
import { useInbounds, useDeleteInbound, useUpdateInboundStatus, useConfirmInbound, useCancelInbound, useExportInbounds, useImportInbounds, useInboundsOverview, useDuplicateInbound } from '../hooks/useInbound'

const InboundList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [selectedInbound, setSelectedInbound] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table, card
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    warehouse: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: inboundsData, isLoading, error } = useInbounds({
    page: currentPage,
    limit: pageSize,
    ...filters
  })
  
  const { data: overviewData } = useInboundsOverview()
  const deleteInboundMutation = useDeleteInbound()
  const updateStatusMutation = useUpdateInboundStatus()
  const confirmInboundMutation = useConfirmInbound()
  const cancelInboundMutation = useCancelInbound()
  const exportInboundsMutation = useExportInbounds()
  const importInboundsMutation = useImportInbounds()
  const duplicateInboundMutation = useDuplicateInbound()

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa phiếu nhập kho
  const handleDeleteInbound = async (inboundId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập kho này?')) {
      await deleteInboundMutation.mutateAsync(inboundId)
    }
  }

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (inboundId, status) => {
    await updateStatusMutation.mutateAsync({ id: inboundId, status })
  }

  // Xử lý xác nhận phiếu nhập kho
  const handleConfirmInbound = async (inboundId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận phiếu nhập kho này?')) {
      await confirmInboundMutation.mutateAsync(inboundId)
    }
  }

  // Xử lý hủy phiếu nhập kho
  const handleCancelInbound = async (inboundId) => {
    const reason = window.prompt('Nhập lý do hủy phiếu nhập kho:')
    if (reason) {
      await cancelInboundMutation.mutateAsync({ id: inboundId, reason })
    }
  }

  // Xử lý sao chép phiếu nhập kho
  const handleDuplicateInbound = async (inboundId) => {
    await duplicateInboundMutation.mutateAsync(inboundId)
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportInboundsMutation.mutate(filters)
  }

  // Xử lý import file
  const handleImport = async (file) => {
    await importInboundsMutation.mutateAsync(file)
    setShowImport(false)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Mã phiếu',
      accessor: 'inboundNumber',
      render: (inbound) => (
        <div className="flex items-center">
          <FiFileText className="h-4 w-4 text-blue-500 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {inbound.inboundNumber}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(inbound.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Nhà cung cấp',
      accessor: 'supplier',
      render: (inbound) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={inbound.supplier?.logo || '/images/default-supplier.png'}
              alt={inbound.supplier?.name}
            />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {inbound.supplier?.name || 'Chưa chọn'}
            </div>
            <div className="text-sm text-gray-500">
              {inbound.supplier?.email || ''}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Kho nhập',
      accessor: 'warehouse',
      render: (inbound) => (
        <div className="text-sm text-gray-900">
          {inbound.warehouse?.name || 'Chưa chọn'}
        </div>
      )
    },
    {
      header: 'Sản phẩm',
      accessor: 'items',
      render: (inbound) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {inbound.totalItems || 0} sản phẩm
          </div>
          <div className="text-gray-500">
            {inbound.totalQuantity || 0} đơn vị
          </div>
        </div>
      )
    },
    {
      header: 'Tổng giá trị',
      accessor: 'totalValue',
      render: (inbound) => (
        <div className="text-sm font-medium text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(inbound.totalValue || 0)}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (inbound) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          inbound.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : inbound.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : inbound.status === 'cancelled'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {inbound.status === 'completed' ? 'Hoàn thành' : 
           inbound.status === 'pending' ? 'Chờ xử lý' : 
           inbound.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
        </span>
      )
    },
    {
      header: 'Người tạo',
      accessor: 'createdBy',
      render: (inbound) => (
        <div className="text-sm text-gray-900">
          {inbound.createdBy?.name || 'Không xác định'}
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (inbound) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedInbound(inbound)
              setShowCard(true)
            }}
          >
            <FiEye className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedInbound(inbound)
              setShowForm(true)
            }}
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          
          {inbound.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleConfirmInbound(inbound.id)}
              loading={confirmInboundMutation.isLoading}
              className="text-green-600 hover:text-green-700"
            >
              <FiCheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          {inbound.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancelInbound(inbound.id)}
              loading={cancelInboundMutation.isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <FiXCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDuplicateInbound(inbound.id)}
            loading={duplicateInboundMutation.isLoading}
          >
            <FiCopy className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteInbound(inbound.id)}
            loading={deleteInboundMutation.isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [deleteInboundMutation.isLoading, confirmInboundMutation.isLoading, cancelInboundMutation.isLoading, duplicateInboundMutation.isLoading])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách phiếu nhập kho</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhập kho</h1>
            <p className="text-gray-600">Quản lý phiếu nhập kho và kiểm soát tồn kho</p>
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
              disabled={exportInboundsMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedInbound(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Tạo phiếu nhập
            </Button>
          </div>
        </div>

        {/* Inbound Stats */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiPackage className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Tổng phiếu nhập</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {overviewData.totalInbounds}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiAlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {overviewData.pendingInbounds}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Hoàn thành</p>
                  <p className="text-2xl font-bold text-green-900">
                    {overviewData.completedInbounds}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiDollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Tổng giá trị</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      notation: 'compact'
                    }).format(overviewData.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inbounds Table/Cards */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={inboundsData?.inbounds || []}
          loading={isLoading}
          emptyMessage="Không có dữ liệu phiếu nhập kho"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inboundsData?.inbounds?.map((inbound) => (
            <InboundCard
              key={inbound.id}
              inbound={inbound}
              onEdit={() => {
                setSelectedInbound(inbound)
                setShowForm(true)
              }}
              onView={() => {
                setSelectedInbound(inbound)
                setShowCard(true)
              }}
              onDelete={() => handleDeleteInbound(inbound.id)}
              onConfirm={() => handleConfirmInbound(inbound.id)}
              onCancel={() => handleCancelInbound(inbound.id)}
              onDuplicate={() => handleDuplicateInbound(inbound.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {inboundsData?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, inboundsData.pagination.total)} trong tổng số{' '}
              {inboundsData.pagination.total} bản ghi
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
                Trang {currentPage} / {inboundsData.pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === inboundsData.pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inbound Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedInbound ? 'Chỉnh sửa phiếu nhập kho' : 'Tạo phiếu nhập kho mới'}
        size="xl"
      >
        <InboundForm
          inbound={selectedInbound}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Inbound Card Modal */}
      <Modal
        isOpen={showCard}
        onClose={() => setShowCard(false)}
        title="Chi tiết phiếu nhập kho"
        size="xl"
      >
        <InboundCard
          inbound={selectedInbound}
          detailed={true}
          onClose={() => setShowCard(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import danh sách phiếu nhập kho"
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
              <li>Cột bắt buộc: Mã phiếu, Nhà cung cấp, Kho nhập</li>
              <li>Cột tùy chọn: Ghi chú, Ngày nhập</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc phiếu nhập kho"
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
              placeholder="Tìm theo mã phiếu, nhà cung cấp..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
            />
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
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

export default InboundList
