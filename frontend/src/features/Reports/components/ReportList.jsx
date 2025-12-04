import React, { useState, useEffect } from 'react'
import { 
  FiFileText, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiStar, 
  FiShare2, 
  FiCalendar, 
  FiBarChart, 
  FiTrendingUp, 
  FiPackage, 
  FiUsers, 
  FiDollarSign,
  FiAlertCircle,
  FiClock,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiMoreVertical,
  FiCopy,
  FiArchive,
  FiTag
} from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Modal from '@components/ui/Modal'
import ReportForm from './ReportForm'
import ReportViewer from './ReportViewer'
import { useReports, useReportTemplates, useReportTypes, useDeleteReport, useExportReport, useAddToFavorites, useRemoveFromFavorites } from '../hooks/useReports'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const ReportList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCreator, setSelectedCreator] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReports, setSelectedReports] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewerModal, setShowViewerModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)
  const [selectedReportId, setSelectedReportId] = useState(null)

  // API hooks
  const { data: reportsData, isLoading, error, refetch } = useReports({
    search: searchTerm,
    type: selectedType,
    status: selectedStatus,
    creator: selectedCreator,
    startDate: dateRange.start,
    endDate: dateRange.end,
    sortBy,
    sortOrder,
    page,
    limit: pageSize
  })

  const { data: templatesData } = useReportTemplates()
  const { data: typesData } = useReportTypes()
  const deleteReportMutation = useDeleteReport()
  const exportReportMutation = useExportReport()
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()

  const reports = reportsData?.data || []
  const templates = Array.isArray(templatesData?.data)
    ? templatesData.data
    : Array.isArray(templatesData)
      ? templatesData
      : []
  const reportTypes = Array.isArray(typesData?.data)
    ? typesData.data
    : Array.isArray(typesData)
      ? typesData
      : []
  const totalPages = reportsData?.totalPages || 1
  const totalItems = reportsData?.totalItems || 0

  // Filter options
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'draft', label: 'Bản nháp' },
    { value: 'archived', label: 'Đã lưu trữ' }
  ]

  const typeOptions = [
    { value: '', label: 'Tất cả loại báo cáo' },
    ...(reportTypes.map(type => ({
      value: type.id,
      label: type.name
    })) || [])
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'updatedAt', label: 'Ngày cập nhật' },
    { value: 'name', label: 'Tên báo cáo' },
    { value: 'type', label: 'Loại báo cáo' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'runCount', label: 'Số lần chạy' }
  ]

  const pageSizeOptions = [
    { value: 12, label: '12 báo cáo/trang' },
    { value: 24, label: '24 báo cáo/trang' },
    { value: 48, label: '48 báo cáo/trang' },
    { value: 96, label: '96 báo cáo/trang' }
  ]

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'type':
        setSelectedType(value)
        break
      case 'status':
        setSelectedStatus(value)
        break
      case 'creator':
        setSelectedCreator(value)
        break
      case 'sortBy':
        setSortBy(value)
        break
      case 'sortOrder':
        setSortOrder(value)
        break
      case 'pageSize':
        setPageSize(value)
        break
    }
    setPage(1)
  }

  const handleDateRangeChange = (start, end) => {
    setDateRange({ start, end })
    setPage(1)
  }

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map(report => report.id))
    }
  }

  const handleDeleteReport = async (reportId) => {
    try {
      await deleteReportMutation.mutateAsync(reportId)
      setShowDeleteModal(false)
      setReportToDelete(null)
    } catch (error) {
      console.error('Delete report error:', error)
    }
  }

  const handleExportReport = async (reportId, format = 'pdf') => {
    try {
      await exportReportMutation.mutateAsync({ id: reportId, format })
    } catch (error) {
      console.error('Export report error:', error)
    }
  }

  const handleToggleFavorite = async (reportId, isFavorite) => {
    try {
      if (isFavorite) {
        await removeFromFavoritesMutation.mutateAsync(reportId)
      } else {
        await addToFavoritesMutation.mutateAsync(reportId)
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) return

    try {
      switch (action) {
        case 'export':
          // Export multiple reports
          for (const reportId of selectedReports) {
            await handleExportReport(reportId)
          }
          break
        case 'delete':
          // Delete multiple reports
          for (const reportId of selectedReports) {
            await deleteReportMutation.mutateAsync(reportId)
          }
          break
        case 'archive':
          // Archive multiple reports - TODO: implement archive API
          break
      }
      setSelectedReports([])
      refetch()
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId)
    setShowViewerModal(true)
  }

  const handleEditReport = (reportId) => {
    setSelectedReportId(reportId)
    setShowEditModal(true)
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'inventory':
        return <FiPackage className="h-5 w-5" />
      case 'revenue':
        return <FiDollarSign className="h-5 w-5" />
      case 'customer':
        return <FiUsers className="h-5 w-5" />
      case 'trend':
        return <FiTrendingUp className="h-5 w-5" />
      case 'chart':
        return <FiBarChart className="h-5 w-5" />
      default:
        return <FiFileText className="h-5 w-5" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động'
      case 'inactive':
        return 'Không hoạt động'
      case 'draft':
        return 'Bản nháp'
      case 'archived':
        return 'Đã lưu trữ'
      default:
        return 'Không xác định'
    }
  }

  const formatLastRunDate = (value) => {
    if (!value) return 'Chưa chạy'
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Chưa chạy'
    return format(date, 'dd/MM/yyyy', { locale: vi })
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
        <div className="text-red-600 mb-4">Có lỗi xảy ra khi tải danh sách báo cáo</div>
        <Button onClick={() => refetch()}>
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
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và tạo báo cáo cho hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
          >
            <FiFileText className="h-4 w-4 mr-2" />
            Từ Template
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <FiPlus className="h-4 w-4 mr-2" />
            Tạo báo cáo
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm báo cáo..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <Select
              value={selectedType}
              onChange={(value) => handleFilterChange('type', value)}
              options={typeOptions}
              placeholder="Loại báo cáo"
              className="w-48"
            />
            <Select
              value={selectedStatus}
              onChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
              placeholder="Trạng thái"
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người tạo
                </label>
                <Input
                  placeholder="Tìm theo người tạo..."
                  value={selectedCreator}
                  onChange={(e) => setSelectedCreator(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange(e.target.value, dateRange.end)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange(dateRange.start, e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sắp xếp
                </label>
                <Select
                  value={sortBy}
                  onChange={(value) => handleFilterChange('sortBy', value)}
                  options={sortOptions}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <FiGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <FiList className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedReports.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Đã chọn {selectedReports.length} báo cáo
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <FiDownload className="h-4 w-4 mr-2" />
                Xuất
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
              >
                <FiArchive className="h-4 w-4 mr-2" />
                Lưu trữ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={pageSize}
            onChange={(value) => handleFilterChange('pageSize', value)}
            options={pageSizeOptions}
            className="w-40"
          />
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Reports Grid/List */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có báo cáo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo báo cáo mới hoặc sử dụng template có sẵn.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button onClick={() => setShowCreateModal(true)}>
              <FiPlus className="h-4 w-4 mr-2" />
              Tạo báo cáo
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTemplateModal(true)}
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Từ Template
            </Button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {reports.map((report) => (
            <div
              key={report.id}
              className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'p-4' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getReportIcon(report.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {report.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {report?.type ? String(report.type) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                        >
                          <FiMoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                    {report.isFavorite && (
                      <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report?.description ? String(report.description) : ''}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 mr-1" />
                      {formatLastRunDate(report.lastRunAt)}
                    </div>
                    <div className="flex items-center">
                      <FiBarChart className="h-4 w-4 mr-1" />
                      {report.runCount || 0}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <FiEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReport(report.id)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportReport(report.id)}
                      >
                        <FiDownload className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(report.id, report.isFavorite)}
                    >
                      <FiStar className={`h-4 w-4 ${report.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </div>
              ) : (
                // List View
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getReportIcon(report.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {report.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        {report.isFavorite && (
                          <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {report?.description ? String(report.description) : ''}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Loại: {report.type}</span>
                      <span>Chạy: {report.runCount || 0} lần</span>
                      <span>Cuối: {formatLastRunDate(report.lastRunAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <FiEye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReport(report.id)}
                    >
                      <FiEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport(report.id)}
                    >
                      <FiDownload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(report.id, report.isFavorite)}
                    >
                      <FiStar className={`h-4 w-4 ${report.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, totalItems)} trong tổng số {totalItems} báo cáo
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo báo cáo mới"
        size="xl"
      >
        <ReportForm
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false)
            refetch()
          }}
        />
      </Modal>

      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Tạo báo cáo từ template"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Chọn template có sẵn để tạo báo cáo:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer"
                onClick={() => {
                  setShowTemplateModal(false)
                  // Navigate to create form with template
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {template?.description ? String(template.description) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa báo cáo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteReport(reportToDelete)}
              loading={deleteReportMutation.isLoading}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Viewer Modal */}
      <Modal
        isOpen={showViewerModal}
        onClose={() => {
          setShowViewerModal(false)
          setSelectedReportId(null)
        }}
        title="Xem báo cáo"
        size="xl"
      >
        {selectedReportId && (
          <ReportViewer
            reportId={selectedReportId}
            onClose={() => {
              setShowViewerModal(false)
              setSelectedReportId(null)
            }}
            onEdit={() => {
              setShowViewerModal(false)
              setShowEditModal(true)
            }}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedReportId(null)
        }}
        title="Chỉnh sửa báo cáo"
        size="xl"
      >
        {selectedReportId && (
          <ReportForm
            reportId={selectedReportId}
            onClose={() => {
              setShowEditModal(false)
              setSelectedReportId(null)
            }}
            onSave={() => {
              setShowEditModal(false)
              setSelectedReportId(null)
              refetch()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default ReportList
