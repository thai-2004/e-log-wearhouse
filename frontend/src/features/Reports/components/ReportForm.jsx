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
import toast from 'react-hot-toast'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Textarea from '@components/ui/Textarea'
import Modal from '@components/ui/Modal'
import { useReport, useCreateReport, useUpdateReport, useRunReport, useReportData } from '../hooks/useReports'
import { useWarehouses } from '@features/Warehouses/hooks/useWarehouses'
import { useProducts } from '@features/Products/hooks/useProducts'
import { useCustomers } from '@features/Customers/hooks/useCustomers'
import { useSuppliers } from '@features/Suppliers/hooks/useSuppliers'
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

  // Sanitize filters to ensure only serializable values (for React Query cache key)
  const sanitizedFilters = React.useMemo(() => {
    if (!formData.filters) return {}
    
    return {
      dateRange: formData.filters.dateRange ? {
        enabled: Boolean(formData.filters.dateRange.enabled),
        startDate: String(formData.filters.dateRange.startDate || ''),
        endDate: String(formData.filters.dateRange.endDate || ''),
        preset: String(formData.filters.dateRange.preset || '')
      } : {},
      warehouses: Array.isArray(formData.filters.warehouses) 
        ? formData.filters.warehouses.map(v => String(v)).filter(Boolean)
        : [],
      products: Array.isArray(formData.filters.products)
        ? formData.filters.products.map(v => String(v)).filter(Boolean)
        : [],
      customers: Array.isArray(formData.filters.customers)
        ? formData.filters.customers.map(v => String(v)).filter(Boolean)
        : [],
      suppliers: Array.isArray(formData.filters.suppliers)
        ? formData.filters.suppliers.map(v => String(v)).filter(Boolean)
        : [],
      categories: Array.isArray(formData.filters.categories)
        ? formData.filters.categories.map(v => String(v)).filter(Boolean)
        : []
    }
  }, [formData.filters])

  // API hooks
  const { data: report, isLoading: isLoadingReport } = useReport(reportId)
  const { data: reportData, isLoading: isLoadingData } = useReportData(reportId, sanitizedFilters)
  const createReportMutation = useCreateReport()
  const updateReportMutation = useUpdateReport()
  const runReportMutation = useRunReport()

  // Fetch data for filters
  const { data: warehousesData } = useWarehouses({ limit: 1000 })
  const { data: productsData } = useProducts({ limit: 1000 })
  const { data: customersData } = useCustomers({ limit: 1000 })
  const { data: suppliersData } = useSuppliers({ limit: 1000 })

  // Transform data to options format - handle different data structures safely
  const getArrayFromData = (data) => {
    if (!data) return []
    // If data is already an array
    if (Array.isArray(data)) return data
    // If data has a data property that is an array
    if (Array.isArray(data.data)) return data.data
    // If data has a data property that is an object with array property
    if (data.data && Array.isArray(data.data.customers)) return data.data.customers
    if (data.data && Array.isArray(data.data.products)) return data.data.products
    if (data.data && Array.isArray(data.data.warehouses)) return data.data.warehouses
    if (data.data && Array.isArray(data.data.suppliers)) return data.data.suppliers
    // If data has a data property that is an object with data array
    if (data.data?.data && Array.isArray(data.data.data)) return data.data.data
    return []
  }

  const warehouseOptions = getArrayFromData(warehousesData).map(wh => ({
    value: wh.id || wh._id,
    label: wh.name
  }))

  const productOptions = getArrayFromData(productsData).map(prod => ({
    value: prod.id || prod._id,
    label: prod.name
  }))

  const customerOptions = getArrayFromData(customersData).map(cust => ({
    value: cust.id || cust._id,
    label: cust.name || cust.companyName || `${cust.firstName || ''} ${cust.lastName || ''}`.trim()
  }))

  const supplierOptions = getArrayFromData(suppliersData).map(sup => ({
    value: sup.id || sup._id,
    label: sup.name || sup.companyName
  }))

  const isEdit = !!reportId

  // Load report data when editing
  useEffect(() => {
    if (report && isEdit) {
      setFormData(prev => ({
        ...prev,
        name: report.name || '',
        description: report.description || '',
        type: report.type || '',
        category: report.category || '',
        status: report.status || 'draft',
        isPublic: report.isPublic || false,
        isFavorite: report.isFavorite || false,
        schedule: {
          ...prev.schedule,
          ...(report.schedule || {})
        },
        filters: {
          ...prev.filters,
          ...(report.filters || {})
        },
        columns: Array.isArray(report.columns) ? report.columns : prev.columns,
        sorting: {
          ...prev.sorting,
          ...(report.sorting || {})
        },
        grouping: {
          ...prev.grouping,
          ...(report.grouping || {})
        },
        chart: {
          ...prev.chart,
          ...(report.chart || {})
        },
        export: {
          ...prev.export,
          ...(report.export || {})
        },
        notifications: {
          ...prev.notifications,
          ...(report.notifications || {})
        }
      }))
    }
  }, [report, isEdit])

  // Update preview data when filters change
  useEffect(() => {
    if (showPreview && reportData) {
      setPreviewData(reportData)
    }
  }, [reportData, showPreview])

  // Tự động điền dữ liệu dựa trên loại báo cáo
  const getDefaultConfigByType = (type) => {
    const configs = {
      inventory: {
        columns: [
          { field: 'productName', label: 'Tên sản phẩm', visible: true, width: 150 },
          { field: 'warehouseName', label: 'Kho', visible: true, width: 120 },
          { field: 'quantity', label: 'Số lượng', visible: true, width: 100 },
          { field: 'unitPrice', label: 'Đơn giá', visible: true, width: 120 },
          { field: 'totalValue', label: 'Tổng giá trị', visible: true, width: 150 },
          { field: 'category', label: 'Danh mục', visible: true, width: 120 }
        ],
        chart: {
          enabled: true,
          type: 'bar',
          xAxis: 'warehouseName',
          yAxis: 'totalValue',
          title: 'Biểu đồ tồn kho theo kho',
          description: 'Hiển thị tổng giá trị tồn kho theo từng kho'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      revenue: {
        columns: [
          { field: 'date', label: 'Ngày', visible: true, width: 120 },
          { field: 'orderCount', label: 'Số đơn hàng', visible: true, width: 120 },
          { field: 'totalRevenue', label: 'Doanh thu', visible: true, width: 150 },
          { field: 'averageOrderValue', label: 'Giá trị TB đơn hàng', visible: true, width: 150 },
          { field: 'customerCount', label: 'Số khách hàng', visible: true, width: 120 }
        ],
        chart: {
          enabled: true,
          type: 'line',
          xAxis: 'date',
          yAxis: 'totalRevenue',
          title: 'Biểu đồ doanh thu theo thời gian',
          description: 'Hiển thị xu hướng doanh thu theo ngày'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      customer: {
        columns: [
          { field: 'customerName', label: 'Tên khách hàng', visible: true, width: 150 },
          { field: 'orderCount', label: 'Số đơn hàng', visible: true, width: 120 },
          { field: 'totalSpent', label: 'Tổng chi tiêu', visible: true, width: 150 },
          { field: 'averageOrderValue', label: 'Giá trị TB đơn hàng', visible: true, width: 150 },
          { field: 'lastOrderDate', label: 'Đơn hàng cuối', visible: true, width: 120 }
        ],
        chart: {
          enabled: true,
          type: 'bar',
          xAxis: 'customerName',
          yAxis: 'totalSpent',
          title: 'Top khách hàng theo tổng chi tiêu',
          description: 'Hiển thị khách hàng có tổng chi tiêu cao nhất'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      supplier: {
        columns: [
          { field: 'supplierName', label: 'Tên nhà cung cấp', visible: true, width: 150 },
          { field: 'orderCount', label: 'Số đơn nhập', visible: true, width: 120 },
          { field: 'totalValue', label: 'Tổng giá trị', visible: true, width: 150 },
          { field: 'averageOrderValue', label: 'Giá trị TB đơn', visible: true, width: 150 },
          { field: 'lastOrderDate', label: 'Đơn nhập cuối', visible: true, width: 120 }
        ],
        chart: {
          enabled: true,
          type: 'bar',
          xAxis: 'supplierName',
          yAxis: 'totalValue',
          title: 'Báo cáo nhà cung cấp',
          description: 'Hiển thị thống kê theo nhà cung cấp'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      product: {
        columns: [
          { field: 'productName', label: 'Tên sản phẩm', visible: true, width: 150 },
          { field: 'category', label: 'Danh mục', visible: true, width: 120 },
          { field: 'quantitySold', label: 'Số lượng bán', visible: true, width: 120 },
          { field: 'revenue', label: 'Doanh thu', visible: true, width: 150 },
          { field: 'stock', label: 'Tồn kho', visible: true, width: 100 }
        ],
        chart: {
          enabled: true,
          type: 'bar',
          xAxis: 'productName',
          yAxis: 'revenue',
          title: 'Top sản phẩm bán chạy',
          description: 'Hiển thị sản phẩm có doanh thu cao nhất'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      inbound: {
        columns: [
          { field: 'date', label: 'Ngày nhập', visible: true, width: 120 },
          { field: 'warehouseName', label: 'Kho', visible: true, width: 120 },
          { field: 'supplierName', label: 'Nhà cung cấp', visible: true, width: 150 },
          { field: 'productCount', label: 'Số sản phẩm', visible: true, width: 120 },
          { field: 'totalValue', label: 'Tổng giá trị', visible: true, width: 150 }
        ],
        chart: {
          enabled: true,
          type: 'line',
          xAxis: 'date',
          yAxis: 'totalValue',
          title: 'Biểu đồ nhập kho theo thời gian',
          description: 'Hiển thị xu hướng nhập kho'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      },
      outbound: {
        columns: [
          { field: 'date', label: 'Ngày xuất', visible: true, width: 120 },
          { field: 'warehouseName', label: 'Kho', visible: true, width: 120 },
          { field: 'customerName', label: 'Khách hàng', visible: true, width: 150 },
          { field: 'productCount', label: 'Số sản phẩm', visible: true, width: 120 },
          { field: 'totalValue', label: 'Tổng giá trị', visible: true, width: 150 }
        ],
        chart: {
          enabled: true,
          type: 'line',
          xAxis: 'date',
          yAxis: 'totalValue',
          title: 'Biểu đồ xuất kho theo thời gian',
          description: 'Hiển thị xu hướng xuất kho'
        },
        filters: {
          dateRange: {
            enabled: true,
            preset: 'last30days'
          }
        }
      }
    }
    return configs[type] || {}
  }

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Tự động điền dữ liệu khi chọn loại báo cáo (chỉ khi tạo mới, không phải edit)
      if (field === 'type' && value && !isEdit) {
        const defaultConfig = getDefaultConfigByType(value)
        if (defaultConfig.columns) {
          newData.columns = defaultConfig.columns
        }
        if (defaultConfig.chart) {
          newData.chart = {
            ...prev.chart,
            ...defaultConfig.chart
          }
        }
        if (defaultConfig.filters) {
          newData.filters = {
            ...prev.filters,
            ...defaultConfig.filters
          }
        }
        // Tự động điền mô tả nếu chưa có
        if (!prev.description && value) {
          const typeLabels = {
            inventory: 'Báo cáo tồn kho',
            revenue: 'Báo cáo doanh thu',
            customer: 'Báo cáo khách hàng',
            supplier: 'Báo cáo nhà cung cấp',
            product: 'Báo cáo sản phẩm',
            inbound: 'Báo cáo nhập kho',
            outbound: 'Báo cáo xuất kho'
          }
          newData.description = `${typeLabels[value] || 'Báo cáo'} - Tự động tạo`
        }
      }
      
      return newData
    })
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

  // Handle checkbox change for filters
  const handleCheckboxChange = (parent, field, itemId, checked) => {
    setFormData(prev => {
      const currentArray = prev[parent][field] || []
      const newArray = checked
        ? [...currentArray, itemId]
        : currentArray.filter(id => id !== itemId)
      
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: newArray
        }
      }
    })
  }

  // Handle select all for filters
  const handleSelectAll = (parent, field, options) => {
    const currentArray = formData[parent][field] || []
    const allSelected = currentArray.length === options.length
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: allSelected ? [] : options.map(opt => opt.value)
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
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast.error('Vui lòng nhập tên báo cáo')
        return
      }
      
      if (!formData.type) {
        toast.error('Vui lòng chọn loại báo cáo')
        return
      }

      // Sanitize columns to ensure only serializable data
      const sanitizedColumns = (formData.columns || []).map(col => ({
        field: String(col.field || ''),
        label: String(col.label || ''),
        visible: Boolean(col.visible),
        width: Number(col.width) || 100
      }))

      // Prepare data for API - only send necessary fields and ensure all are serializable
      const reportData = {
        name: String(formData.name || '').trim(),
        description: String(formData.description || ''),
        type: String(formData.type || ''),
        category: String(formData.category || ''),
        status: String(formData.status || 'draft'),
        isPublic: Boolean(formData.isPublic),
        isFavorite: Boolean(formData.isFavorite),
        schedule: {
          enabled: Boolean(formData.schedule?.enabled),
          frequency: String(formData.schedule?.frequency || 'daily'),
          time: String(formData.schedule?.time || '09:00'),
          days: Array.isArray(formData.schedule?.days) ? formData.schedule.days.map(String) : [],
          timezone: String(formData.schedule?.timezone || 'Asia/Ho_Chi_Minh')
        },
        filters: sanitizedFilters,
        columns: sanitizedColumns,
        sorting: {
          field: String(formData.sorting?.field || 'createdAt'),
          order: String(formData.sorting?.order || 'desc')
        },
        grouping: {
          enabled: Boolean(formData.grouping?.enabled),
          fields: Array.isArray(formData.grouping?.fields) ? formData.grouping.fields.map(String) : []
        },
        chart: {
          enabled: Boolean(formData.chart?.enabled),
          type: String(formData.chart?.type || 'bar'),
          xAxis: String(formData.chart?.xAxis || ''),
          yAxis: String(formData.chart?.yAxis || ''),
          title: String(formData.chart?.title || ''),
          description: String(formData.chart?.description || '')
        },
        export: {
          formats: Array.isArray(formData.export?.formats) ? formData.export.formats.map(String) : ['pdf'],
          includeCharts: Boolean(formData.export?.includeCharts !== false),
          includeData: Boolean(formData.export?.includeData !== false),
          includeSummary: Boolean(formData.export?.includeSummary !== false)
        },
        notifications: {
          enabled: Boolean(formData.notifications?.enabled),
          email: String(formData.notifications?.email || ''),
          webhook: String(formData.notifications?.webhook || '')
        }
      }

      if (isEdit) {
        await updateReportMutation.mutateAsync({ id: reportId, data: reportData })
      } else {
        await createReportMutation.mutateAsync(reportData)
      }
      onSave?.()
    } catch (error) {
      // Error is handled by the mutation hook, but we can add additional handling here if needed
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu báo cáo'
      if (!error.response?.data?.message) {
        toast.error(errorMessage)
      }
    }
  }

  const handleRun = async () => {
    if (!reportId) {
      toast.error('Vui lòng lưu báo cáo trước khi chạy')
      return
    }
    try {
      setIsRunning(true)
      await runReportMutation.mutateAsync({ id: reportId, params: sanitizedFilters })
      setShowPreview(true)
    } catch (error) {
      // Error is handled by the mutation hook
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
              {/* Kho */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kho
                  </label>
                  {warehouseOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAll('filters', 'warehouses', warehouseOptions)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {formData.filters.warehouses?.length === warehouseOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {warehouseOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">Không có dữ liệu</p>
                  ) : (
                    <div className="space-y-2">
                      {warehouseOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.filters.warehouses?.includes(option.value) || false}
                            onChange={(e) => handleCheckboxChange('filters', 'warehouses', option.value, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.filters.warehouses?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Đã chọn: {formData.filters.warehouses.length} kho
                  </p>
                )}
              </div>

              {/* Sản phẩm */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sản phẩm
                  </label>
                  {productOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAll('filters', 'products', productOptions)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {formData.filters.products?.length === productOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {productOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">Không có dữ liệu</p>
                  ) : (
                    <div className="space-y-2">
                      {productOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.filters.products?.includes(option.value) || false}
                            onChange={(e) => handleCheckboxChange('filters', 'products', option.value, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.filters.products?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Đã chọn: {formData.filters.products.length} sản phẩm
                  </p>
                )}
              </div>

              {/* Khách hàng */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Khách hàng
                  </label>
                  {customerOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAll('filters', 'customers', customerOptions)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {formData.filters.customers?.length === customerOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {customerOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">Không có dữ liệu</p>
                  ) : (
                    <div className="space-y-2">
                      {customerOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.filters.customers?.includes(option.value) || false}
                            onChange={(e) => handleCheckboxChange('filters', 'customers', option.value, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.filters.customers?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Đã chọn: {formData.filters.customers.length} khách hàng
                  </p>
                )}
              </div>

              {/* Nhà cung cấp */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nhà cung cấp
                  </label>
                  {supplierOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAll('filters', 'suppliers', supplierOptions)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {formData.filters.suppliers?.length === supplierOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {supplierOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">Không có dữ liệu</p>
                  ) : (
                    <div className="space-y-2">
                      {supplierOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.filters.suppliers?.includes(option.value) || false}
                            onChange={(e) => handleCheckboxChange('filters', 'suppliers', option.value, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.filters.suppliers?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Đã chọn: {formData.filters.suppliers.length} nhà cung cấp
                  </p>
                )}
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
