import React, { useState, useEffect } from 'react'
import { 
  FiSave, 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiDownload, 
  FiRefreshCw,
  FiCalendar,
  FiBarChart,
  FiSettings,
  FiFilter,
  FiSearch,
  FiFileText,
  FiTag,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiClock,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Textarea from '@components/ui/Textarea'
import Modal from '@components/ui/Modal'
import { useReport, useCreateReport, useUpdateReport, useRunReport, useReportData } from '../hooks/useReports'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const ReportForm = ({ reportId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    category: '',
    status: 'draft',
    isPublic: false,
    isFavorite: false,
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '09:00',
      days: [],
      timezone: 'Asia/Ho_Chi_Minh'
    },
    filters: {
      dateRange: {
        enabled: false,
        startDate: '',
        endDate: '',
        preset: 'last30days'
      },
      warehouses: [],
      products: [],
      customers: [],
      suppliers: [],
      categories: []
    },
    columns: [],
    sorting: {
      field: 'createdAt',
      order: 'desc'
    },
    grouping: {
      enabled: false,
      fields: []
    },
    chart: {
      enabled: false,
      type: 'bar',
      xAxis: '',
      yAxis: '',
      title: '',
      description: ''
    },
    export: {
      formats: ['pdf'],
      includeCharts: true,
      includeData: true,
      includeSummary: true
    },
    notifications: {
      enabled: false,
      email: '',
      webhook: ''
    }
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [showPreview, setShowPreview] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // API hooks
  const { data: report, isLoading: isLoadingReport } = useReport(reportId)
  const { data: reportData, isLoading: isLoadingData } = useReportData(reportId, formData.filters)
  const createReportMutation = useCreateReport()
  const updateReportMutation = useUpdateReport()
  const runReportMutation = useRunReport()

  const isEdit = !!reportId

  // Load report data when editing
  useEffect(() => {
    if (report && isEdit) {
      setFormData({
        ...formData,
        ...report,
        filters: {
          ...formData.filters,
          ...report.filters
        },
        schedule: {
          ...formData.schedule,
          ...report.schedule
        },
        chart: {
          ...formData.chart,
          ...report.chart
        },
        export: {
          ...formData.export,
          ...report.export
        },
        notifications: {
          ...formData.notifications,
          ...report.notifications
        }
      })
    }
  }, [report, isEdit])

  // Update preview data when filters change
  useEffect(() => {
    if (showPreview && reportData) {
      setPreviewData(reportData)
    }
  }, [reportData, showPreview])

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleArrayChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleAddColumn = () => {
    setFormData(prev => ({
      ...prev,
      columns: [...prev.columns, { field: '', label: '', visible: true, width: 100 }]
    }))
  }

  const handleRemoveColumn = (index) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateColumn = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    }))
  }

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateReportMutation.mutateAsync({ id: reportId, data: formData })
      } else {
        await createReportMutation.mutateAsync(formData)
      }
      onSave?.()
    } catch (error) {
      console.error('Save report error:', error)
    }
  }

  const handleRun = async () => {
    try {
      setIsRunning(true)
      await runReportMutation.mutateAsync({ id: reportId, params: formData.filters })
      setShowPreview(true)
    } catch (error) {
      console.error('Run report error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  // Options
  const reportTypeOptions = [
    { value: 'inventory', label: 'Báo cáo tồn kho' },
    { value: 'revenue', label: 'Báo cáo doanh thu' },
    { value: 'customer', label: 'Báo cáo khách hàng' },
    { value: 'supplier', label: 'Báo cáo nhà cung cấp' },
    { value: 'product', label: 'Báo cáo sản phẩm' },
    { value: 'inbound', label: 'Báo cáo nhập kho' },
    { value: 'outbound', label: 'Báo cáo xuất kho' },
    { value: 'trend', label: 'Báo cáo xu hướng' },
    { value: 'comparison', label: 'Báo cáo so sánh' },
    { value: 'forecast', label: 'Báo cáo dự báo' }
  ]

  const statusOptions = [
    { value: 'draft', label: 'Bản nháp' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'archived', label: 'Đã lưu trữ' }
  ]

  const frequencyOptions = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'quarterly', label: 'Hàng quý' },
    { value: 'yearly', label: 'Hàng năm' }
  ]

  const chartTypeOptions = [
    { value: 'bar', label: 'Biểu đồ cột' },
    { value: 'line', label: 'Biểu đồ đường' },
    { value: 'pie', label: 'Biểu đồ tròn' },
    { value: 'area', label: 'Biểu đồ vùng' },
    { value: 'scatter', label: 'Biểu đồ phân tán' },
    { value: 'table', label: 'Bảng dữ liệu' }
  ]

  const datePresetOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'last7days', label: '7 ngày qua' },
    { value: 'last30days', label: '30 ngày qua' },
    { value: 'last90days', label: '90 ngày qua' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'lastMonth', label: 'Tháng trước' },
    { value: 'thisYear', label: 'Năm này' },
    { value: 'lastYear', label: 'Năm trước' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ]

  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: FiFileText },
    { id: 'filters', label: 'Bộ lọc', icon: FiFilter },
    { id: 'columns', label: 'Cột dữ liệu', icon: FiGrid },
    { id: 'chart', label: 'Biểu đồ', icon: FiBarChart },
    { id: 'schedule', label: 'Lịch trình', icon: FiCalendar },
    { id: 'export', label: 'Xuất báo cáo', icon: FiDownload },
    { id: 'notifications', label: 'Thông báo', icon: FiAlertCircle }
  ]

  // Chỉ hiển thị loading khi đang ở chế độ chỉnh sửa
  // Tạo báo cáo mới không cần chờ dữ liệu từ API
  if (isEdit && isLoadingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo mới'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Cập nhật thông tin báo cáo' : 'Tạo báo cáo mới cho hệ thống'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEdit && (
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <FiEye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
          )}
          {isEdit && (
            <Button
              variant="outline"
              onClick={handleRun}
              loading={isRunning}
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Chạy báo cáo
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
          >
            <FiX className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            loading={createReportMutation.isLoading || updateReportMutation.isLoading}
          >
            <FiSave className="h-4 w-4 mr-2" />
            Lưu
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2 inline" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên báo cáo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên báo cáo..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại báo cáo *
                </label>
                <Select
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                  options={reportTypeOptions}
                  placeholder="Chọn loại báo cáo..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả về báo cáo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Nhập danh mục..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Công khai</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Yêu thích</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bộ lọc thời gian</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.filters.dateRange.enabled}
                    onChange={(e) => handleNestedInputChange('filters', 'dateRange', {
                      ...formData.filters.dateRange,
                      enabled: e.target.checked
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>
              
              {formData.filters.dateRange.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoảng thời gian
                    </label>
                    <Select
                      value={formData.filters.dateRange.preset}
                      onChange={(value) => handleNestedInputChange('filters', 'dateRange', {
                        ...formData.filters.dateRange,
                        preset: value
                      })}
                      options={datePresetOptions}
                    />
                  </div>
                  
                  {formData.filters.dateRange.preset === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Từ ngày
                        </label>
                        <Input
                          type="date"
                          value={formData.filters.dateRange.startDate}
                          onChange={(e) => handleNestedInputChange('filters', 'dateRange', {
                            ...formData.filters.dateRange,
                            startDate: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đến ngày
                        </label>
                        <Input
                          type="date"
                          value={formData.filters.dateRange.endDate}
                          onChange={(e) => handleNestedInputChange('filters', 'dateRange', {
                            ...formData.filters.dateRange,
                            endDate: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kho
                </label>
                <Select
                  value={formData.filters.warehouses}
                  onChange={(value) => handleArrayChange('filters', 'warehouses', value)}
                  options={[]}
                  placeholder="Chọn kho..."
                  multiple
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sản phẩm
                </label>
                <Select
                  value={formData.filters.products}
                  onChange={(value) => handleArrayChange('filters', 'products', value)}
                  options={[]}
                  placeholder="Chọn sản phẩm..."
                  multiple
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng
                </label>
                <Select
                  value={formData.filters.customers}
                  onChange={(value) => handleArrayChange('filters', 'customers', value)}
                  options={[]}
                  placeholder="Chọn khách hàng..."
                  multiple
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhà cung cấp
                </label>
                <Select
                  value={formData.filters.suppliers}
                  onChange={(value) => handleArrayChange('filters', 'suppliers', value)}
                  options={[]}
                  placeholder="Chọn nhà cung cấp..."
                  multiple
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Cột dữ liệu</h3>
              <Button
                variant="outline"
                onClick={handleAddColumn}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Thêm cột
              </Button>
            </div>

            <div className="space-y-4">
              {formData.columns.map((column, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <Input
                      value={column.field}
                      onChange={(e) => handleUpdateColumn(index, 'field', e.target.value)}
                      placeholder="Tên trường..."
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={column.label}
                      onChange={(e) => handleUpdateColumn(index, 'label', e.target.value)}
                      placeholder="Nhãn hiển thị..."
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={column.width}
                      onChange={(e) => handleUpdateColumn(index, 'width', parseInt(e.target.value))}
                      placeholder="Độ rộng..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={(e) => handleUpdateColumn(index, 'visible', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveColumn(index)}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Cấu hình biểu đồ</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.chart.enabled}
                  onChange={(e) => handleNestedInputChange('chart', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kích hoạt biểu đồ</span>
              </label>
            </div>

            {formData.chart.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại biểu đồ
                    </label>
                    <Select
                      value={formData.chart.type}
                      onChange={(value) => handleNestedInputChange('chart', 'type', value)}
                      options={chartTypeOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trục X
                    </label>
                    <Input
                      value={formData.chart.xAxis}
                      onChange={(e) => handleNestedInputChange('chart', 'xAxis', e.target.value)}
                      placeholder="Trường cho trục X..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trục Y
                    </label>
                    <Input
                      value={formData.chart.yAxis}
                      onChange={(e) => handleNestedInputChange('chart', 'yAxis', e.target.value)}
                      placeholder="Trường cho trục Y..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề biểu đồ
                    </label>
                    <Input
                      value={formData.chart.title}
                      onChange={(e) => handleNestedInputChange('chart', 'title', e.target.value)}
                      placeholder="Tiêu đề biểu đồ..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả biểu đồ
                  </label>
                  <Textarea
                    value={formData.chart.description}
                    onChange={(e) => handleNestedInputChange('chart', 'description', e.target.value)}
                    placeholder="Mô tả về biểu đồ..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Lịch trình tự động</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.schedule.enabled}
                  onChange={(e) => handleNestedInputChange('schedule', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kích hoạt lịch trình</span>
              </label>
            </div>

            {formData.schedule.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tần suất
                    </label>
                    <Select
                      value={formData.schedule.frequency}
                      onChange={(value) => handleNestedInputChange('schedule', 'frequency', value)}
                      options={frequencyOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian
                    </label>
                    <Input
                      type="time"
                      value={formData.schedule.time}
                      onChange={(e) => handleNestedInputChange('schedule', 'time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <Select
                    value={formData.schedule.timezone}
                    onChange={(value) => handleNestedInputChange('schedule', 'timezone', value)}
                    options={[
                      { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' },
                      { value: 'UTC', label: 'UTC' }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Cấu hình xuất báo cáo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Định dạng xuất
                </label>
                <div className="flex space-x-4">
                  {['pdf', 'excel', 'csv'].map((format) => (
                    <label key={format} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.export.formats.includes(format)}
                        onChange={(e) => {
                          const formats = e.target.checked
                            ? [...formData.export.formats, format]
                            : formData.export.formats.filter(f => f !== format)
                          handleNestedInputChange('export', 'formats', formats)
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 uppercase">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.export.includeCharts}
                    onChange={(e) => handleNestedInputChange('export', 'includeCharts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm biểu đồ</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.export.includeData}
                    onChange={(e) => handleNestedInputChange('export', 'includeData', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm dữ liệu chi tiết</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.export.includeSummary}
                    onChange={(e) => handleNestedInputChange('export', 'includeSummary', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm tóm tắt</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Thông báo</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.enabled}
                  onChange={(e) => handleNestedInputChange('notifications', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kích hoạt thông báo</span>
              </label>
            </div>

            {formData.notifications.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.notifications.email}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <Input
                    value={formData.notifications.webhook}
                    onChange={(e) => handleNestedInputChange('notifications', 'webhook', e.target.value)}
                    placeholder="https://example.com/webhook"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Xem trước báo cáo"
        size="xl"
      >
        <div className="space-y-4">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Dữ liệu mẫu - {previewData.totalRecords} bản ghi
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {formData.columns.filter(col => col.visible).map((column, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.label || column.field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.data?.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {formData.columns.filter(col => col.visible).map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[column.field] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBarChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chạy báo cáo để xem dữ liệu mẫu
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ReportForm
