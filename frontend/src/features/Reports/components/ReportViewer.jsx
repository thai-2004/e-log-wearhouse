import React, { useState, useEffect } from 'react'
import { 
  FiDownload, 
  FiRefreshCw, 
  FiShare2, 
  FiStar, 
  FiEye, 
  FiBarChart, 
  FiTrendingUp, 
  FiPackage, 
  FiUsers, 
  FiDollarSign,
  FiCalendar,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronRight,
  FiSettings,
  FiMaximize2,
  FiMinimize2,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiSave,
  FiEdit,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiTable
} from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Modal from '@components/ui/Modal'
import { useReport, useReportData, useExportReport, useAddToFavorites, useRemoveFromFavorites } from '../hooks/useReports'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const ReportViewer = ({ reportId, onClose, onEdit }) => {
  const [viewMode, setViewMode] = useState('chart') // chart, table, both
  const [chartType, setChartType] = useState('bar')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chartSettings, setChartSettings] = useState({
    showLegend: true,
    showGrid: true,
    showLabels: true,
    showTooltips: true,
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  })

  // API hooks
  const { data: report, isLoading: isLoadingReport } = useReport(reportId)
  const { data: reportData, isLoading: isLoadingData, refetch } = useReportData(reportId, filters)
  const exportReportMutation = useExportReport()
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()

  // Load report data when component mounts
  useEffect(() => {
    if (reportId) {
      refetch()
    }
  }, [reportId, refetch])

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExportReport = async (format = 'pdf') => {
    try {
      await exportReportMutation.mutateAsync({ id: reportId, format, params: filters })
    } catch (error) {
      console.error('Export report error:', error)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (report?.isFavorite) {
        await removeFromFavoritesMutation.mutateAsync(reportId)
      } else {
        await addToFavoritesMutation.mutateAsync(reportId)
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
    }
  }

  const handleRefresh = () => {
    refetch()
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

  const renderChart = () => {
    if (!reportData?.data || reportData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FiBarChart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không có dữ liệu để hiển thị biểu đồ
            </p>
          </div>
        </div>
      )
    }

    // Mock chart data - in real app, you would use a charting library like Chart.js, Recharts, etc.
    const chartData = reportData.data.slice(0, 10) // Limit to 10 items for demo

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {report?.chart?.title || 'Biểu đồ dữ liệu'}
          </h3>
          {report?.chart?.description && (
            <p className="text-sm text-gray-600 mt-1">
              {report.chart.description}
            </p>
          )}
        </div>

        {/* Mock Chart - Replace with actual chart component */}
        <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FiBarChart className="mx-auto h-16 w-16 text-blue-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {chartType === 'bar' ? 'Biểu đồ cột' : 
               chartType === 'line' ? 'Biểu đồ đường' :
               chartType === 'pie' ? 'Biểu đồ tròn' :
               chartType === 'area' ? 'Biểu đồ vùng' : 'Biểu đồ'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {chartData.length} điểm dữ liệu
            </p>
            <div className="mt-4 text-xs text-gray-400">
              * Sử dụng thư viện chart như Chart.js, Recharts để hiển thị biểu đồ thực tế
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select
              value={chartType}
              onChange={setChartType}
              options={[
                { value: 'bar', label: 'Biểu đồ cột' },
                { value: 'line', label: 'Biểu đồ đường' },
                { value: 'pie', label: 'Biểu đồ tròn' },
                { value: 'area', label: 'Biểu đồ vùng' },
                { value: 'scatter', label: 'Biểu đồ phân tán' }
              ]}
              className="w-40"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartSettings(prev => ({ ...prev, showLegend: !prev.showLegend }))}
            >
              <FiEye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            >
              <FiGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderTable = () => {
    if (!reportData?.data || reportData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FiTable className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không có dữ liệu để hiển thị bảng
            </p>
          </div>
        </div>
      )
    }

    const columns = report?.columns?.filter(col => col.visible) || []
    const data = reportData.data

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Dữ liệu chi tiết</h3>
            <div className="text-sm text-gray-500">
              {data.length} bản ghi
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.label || column.field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[column.field] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reportData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Hiển thị {((reportData.page - 1) * reportData.limit) + 1} đến {Math.min(reportData.page * reportData.limit, reportData.totalRecords)} trong tổng số {reportData.totalRecords} bản ghi
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                  disabled={reportData.page === 1}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-500">
                  Trang {reportData.page} / {reportData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                  disabled={reportData.page === reportData.totalPages}
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

  const renderSummary = () => {
    if (!reportData?.summary) return null

    const summary = reportData.summary

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiBarChart className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {key}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoadingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy báo cáo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Báo cáo không tồn tại hoặc đã bị xóa
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {getReportIcon(report.type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                {getStatusText(report.status)}
              </span>
              <span className="text-sm text-gray-500">
                Cập nhật: {format(new Date(report.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </span>
              {report.isFavorite && (
                <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={isLoadingData}
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <FiSettings className="h-4 w-4 mr-2" />
            Cài đặt
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleFavorite}
          >
            <FiStar className={`h-4 w-4 mr-2 ${report.isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
            {report.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportReport('pdf')}
            loading={exportReportMutation.isLoading}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Xuất PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportReport('excel')}
            loading={exportReportMutation.isLoading}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
            >
              <FiEdit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
            >
              <FiX className="h-4 w-4 mr-2" />
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {report.description && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">{report.description}</p>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kho
              </label>
              <Select
                value={filters.warehouse || ''}
                onChange={(value) => handleFilterChange('warehouse', value)}
                options={[
                  { value: '', label: 'Tất cả kho' },
                  { value: 'warehouse1', label: 'Kho 1' },
                  { value: 'warehouse2', label: 'Kho 2' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sản phẩm
              </label>
              <Select
                value={filters.product || ''}
                onChange={(value) => handleFilterChange('product', value)}
                options={[
                  { value: '', label: 'Tất cả sản phẩm' },
                  { value: 'product1', label: 'Sản phẩm 1' },
                  { value: 'product2', label: 'Sản phẩm 2' }
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'outline'}
            onClick={() => setViewMode('chart')}
          >
            <FiBarChart className="h-4 w-4 mr-2" />
            Biểu đồ
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            <FiTable className="h-4 w-4 mr-2" />
            Bảng
          </Button>
          <Button
            variant={viewMode === 'both' ? 'primary' : 'outline'}
            onClick={() => setViewMode('both')}
          >
            <FiGrid className="h-4 w-4 mr-2" />
            Cả hai
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          {isLoadingData ? (
            <div className="flex items-center">
              <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : reportData ? (
            `Cập nhật: ${format(new Date(), 'HH:mm:ss', { locale: vi })}`
          ) : null}
        </div>
      </div>

      {/* Content */}
      {isLoadingData ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          {reportData?.summary && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt</h3>
              {renderSummary()}
            </div>
          )}

          {/* Chart */}
          {(viewMode === 'chart' || viewMode === 'both') && (
            <div>
              {viewMode === 'both' && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ</h3>
              )}
              {renderChart()}
            </div>
          )}

          {/* Table */}
          {(viewMode === 'table' || viewMode === 'both') && (
            <div>
              {viewMode === 'both' && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dữ liệu chi tiết</h3>
              )}
              {renderTable()}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Cài đặt báo cáo"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế độ xem mặc định
            </label>
            <Select
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'chart', label: 'Biểu đồ' },
                { value: 'table', label: 'Bảng' },
                { value: 'both', label: 'Cả hai' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại biểu đồ mặc định
            </label>
            <Select
              value={chartType}
              onChange={setChartType}
              options={[
                { value: 'bar', label: 'Biểu đồ cột' },
                { value: 'line', label: 'Biểu đồ đường' },
                { value: 'pie', label: 'Biểu đồ tròn' },
                { value: 'area', label: 'Biểu đồ vùng' },
                { value: 'scatter', label: 'Biểu đồ phân tán' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Tùy chọn biểu đồ</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chartSettings.showLegend}
                onChange={(e) => setChartSettings(prev => ({ ...prev, showLegend: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Hiển thị chú thích</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chartSettings.showGrid}
                onChange={(e) => setChartSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Hiển thị lưới</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chartSettings.showLabels}
                onChange={(e) => setChartSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Hiển thị nhãn</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chartSettings.showTooltips}
                onChange={(e) => setChartSettings(prev => ({ ...prev, showTooltips: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Hiển thị tooltip</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReportViewer
