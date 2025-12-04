import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsAPI } from '../api/reportsService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách báo cáo
export const useReports = (params = {}) => {
  return useQuery(
    ['reports', params],
    () => reportsAPI.getReports(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      cacheTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy thông tin báo cáo theo ID
export const useReport = (id) => {
  return useQuery(
    ['report', id],
    () => reportsAPI.getReportById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo báo cáo mới
export const useCreateReport = () => {
  const queryClient = useQueryClient()

  return useMutation(reportsAPI.createReport, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['reports'])
      toast.success('Tạo báo cáo thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo báo cáo thất bại')
    },
  })
}

// Hook để cập nhật báo cáo
export const useUpdateReport = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => reportsAPI.updateReport(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['reports'])
        queryClient.invalidateQueries(['report', variables.id])
        toast.success('Cập nhật báo cáo thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật báo cáo thất bại')
      },
    }
  )
}

// Hook để xóa báo cáo
export const useDeleteReport = () => {
  const queryClient = useQueryClient()

  return useMutation(reportsAPI.deleteReport, {
    onSuccess: () => {
      queryClient.invalidateQueries(['reports'])
      toast.success('Xóa báo cáo thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa báo cáo thất bại')
    },
  })
}

// Hook để chạy báo cáo
export const useRunReport = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, params }) => reportsAPI.runReport(id, params),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['report', variables.id])
        queryClient.invalidateQueries(['report', variables.id, 'data'])
        toast.success('Chạy báo cáo thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Chạy báo cáo thất bại')
      },
    }
  )
}

// Hook để lấy dữ liệu báo cáo
export const useReportData = (id, params = {}) => {
  return useQuery(
    ['report', id, 'data', params],
    () => reportsAPI.getReportData(id, params),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để xuất báo cáo
export const useExportReport = () => {
  return useMutation(
    ({ id, format, params }) => reportsAPI.exportReport(id, format, params),
    {
      onSuccess: (data, variables) => {
        try {
          // Xác định MIME type dựa trên format
          let mimeType = 'application/octet-stream'
          let fileExtension = variables.format || 'pdf'
          
          switch (variables.format) {
            case 'pdf':
              mimeType = 'application/pdf'
              fileExtension = 'pdf'
              break
            case 'excel':
            case 'xlsx':
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              fileExtension = 'xlsx'
              break
            case 'csv':
              mimeType = 'text/csv'
              fileExtension = 'csv'
              break
            case 'json':
              mimeType = 'application/json'
              fileExtension = 'json'
              break
            default:
              mimeType = 'application/pdf'
              fileExtension = 'pdf'
          }

          // Tạo blob và download file
          const blob = new Blob([data], { type: mimeType })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `report_${new Date().toISOString().split('T')[0]}.${fileExtension}`
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }, 100)
          
          toast.success('Xuất báo cáo thành công!')
        } catch (error) {
          console.error('Download file error:', error)
          toast.error('Có lỗi xảy ra khi tải file')
        }
      },
      onError: (error) => {
        console.error('Export report error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Xuất báo cáo thất bại'
        toast.error(errorMessage)
      },
    }
  )
}

// Hook để lấy danh sách template báo cáo
export const useReportTemplates = () => {
  return useQuery(
    ['report-templates'],
    reportsAPI.getReportTemplates,
    {
      staleTime: 10 * 60 * 1000, // 10 phút
      retry: 2,
    }
  )
}

// Hook để tạo báo cáo từ template
export const useCreateReportFromTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ templateId, data }) => reportsAPI.createReportFromTemplate(templateId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports'])
        toast.success('Tạo báo cáo từ template thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo báo cáo từ template thất bại')
      },
    }
  )
}

// Hook để lấy danh sách loại báo cáo
export const useReportTypes = () => {
  return useQuery(
    ['report-types'],
    reportsAPI.getReportTypes,
    {
      staleTime: 10 * 60 * 1000, // 10 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê tổng quan
export const useOverviewStats = (params = {}) => {
  return useQuery(
    ['overview-stats', params],
    () => reportsAPI.getOverviewStats(params),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo tồn kho
export const useInventoryReport = (params = {}) => {
  return useQuery(
    ['inventory-report', params],
    () => reportsAPI.getInventoryReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo xuất nhập kho
export const useInboundOutboundReport = (params = {}) => {
  return useQuery(
    ['inbound-outbound-report', params],
    () => reportsAPI.getInboundOutboundReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo doanh thu
export const useRevenueReport = (params = {}) => {
  return useQuery(
    ['revenue-report', params],
    () => reportsAPI.getRevenueReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo khách hàng
export const useCustomerReport = (params = {}) => {
  return useQuery(
    ['customer-report', params],
    () => reportsAPI.getCustomerReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo nhà cung cấp
export const useSupplierReport = (params = {}) => {
  return useQuery(
    ['supplier-report', params],
    () => reportsAPI.getSupplierReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sản phẩm
export const useProductReport = (params = {}) => {
  return useQuery(
    ['product-report', params],
    () => reportsAPI.getProductReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo khoảng thời gian
export const useTimeRangeReport = (startDate, endDate, params = {}) => {
  return useQuery(
    ['time-range-report', startDate, endDate, params],
    () => reportsAPI.getTimeRangeReport(startDate, endDate, params),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo kho
export const useWarehouseReport = (warehouseId, params = {}) => {
  return useQuery(
    ['warehouse-report', warehouseId, params],
    () => reportsAPI.getWarehouseReport(warehouseId, params),
    {
      enabled: !!warehouseId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo sản phẩm
export const useProductDetailReport = (productId, params = {}) => {
  return useQuery(
    ['product-detail-report', productId, params],
    () => reportsAPI.getProductDetailReport(productId, params),
    {
      enabled: !!productId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo khách hàng
export const useCustomerDetailReport = (customerId, params = {}) => {
  return useQuery(
    ['customer-detail-report', customerId, params],
    () => reportsAPI.getCustomerDetailReport(customerId, params),
    {
      enabled: !!customerId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo nhà cung cấp
export const useSupplierDetailReport = (supplierId, params = {}) => {
  return useQuery(
    ['supplier-detail-report', supplierId, params],
    () => reportsAPI.getSupplierDetailReport(supplierId, params),
    {
      enabled: !!supplierId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo cảnh báo tồn kho
export const useStockAlertReport = (params = {}) => {
  return useQuery(
    ['stock-alert-report', params],
    () => reportsAPI.getStockAlertReport(params),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sản phẩm sắp hết hạn
export const useExpiringProductsReport = (params = {}) => {
  return useQuery(
    ['expiring-products-report', params],
    () => reportsAPI.getExpiringProductsReport(params),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sản phẩm hết hạn
export const useExpiredProductsReport = (params = {}) => {
  return useQuery(
    ['expired-products-report', params],
    () => reportsAPI.getExpiredProductsReport(params),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sản phẩm tồn kho lâu
export const useSlowMovingProductsReport = (params = {}) => {
  return useQuery(
    ['slow-moving-products-report', params],
    () => reportsAPI.getSlowMovingProductsReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo sản phẩm bán chạy
export const useTopSellingProductsReport = (params = {}) => {
  return useQuery(
    ['top-selling-products-report', params],
    () => reportsAPI.getTopSellingProductsReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo khách hàng mua nhiều
export const useTopCustomersReport = (params = {}) => {
  return useQuery(
    ['top-customers-report', params],
    () => reportsAPI.getTopCustomersReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo nhà cung cấp tốt nhất
export const useTopSuppliersReport = (params = {}) => {
  return useQuery(
    ['top-suppliers-report', params],
    () => reportsAPI.getTopSuppliersReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo ngày
export const useDailyReport = (date, params = {}) => {
  return useQuery(
    ['daily-report', date, params],
    () => reportsAPI.getDailyReport(date, params),
    {
      enabled: !!date,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo tuần
export const useWeeklyReport = (week, year, params = {}) => {
  return useQuery(
    ['weekly-report', week, year, params],
    () => reportsAPI.getWeeklyReport(week, year, params),
    {
      enabled: !!week && !!year,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo tháng
export const useMonthlyReport = (month, year, params = {}) => {
  return useQuery(
    ['monthly-report', month, year, params],
    () => reportsAPI.getMonthlyReport(month, year, params),
    {
      enabled: !!month && !!year,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo quý
export const useQuarterlyReport = (quarter, year, params = {}) => {
  return useQuery(
    ['quarterly-report', quarter, year, params],
    () => reportsAPI.getQuarterlyReport(quarter, year, params),
    {
      enabled: !!quarter && !!year,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo theo năm
export const useYearlyReport = (year, params = {}) => {
  return useQuery(
    ['yearly-report', year, params],
    () => reportsAPI.getYearlyReport(year, params),
    {
      enabled: !!year,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo so sánh
export const useComparisonReport = (params = {}) => {
  return useQuery(
    ['comparison-report', params],
    () => reportsAPI.getComparisonReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo xu hướng
export const useTrendReport = (params = {}) => {
  return useQuery(
    ['trend-report', params],
    () => reportsAPI.getTrendReport(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy báo cáo dự báo
export const useForecastReport = (params = {}) => {
  return useQuery(
    ['forecast-report', params],
    () => reportsAPI.getForecastReport(params),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lưu báo cáo
export const useSaveReport = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => reportsAPI.saveReport(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['report', variables.id])
        queryClient.invalidateQueries(['saved-reports'])
        toast.success('Lưu báo cáo thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lưu báo cáo thất bại')
      },
    }
  )
}

// Hook để chia sẻ báo cáo
export const useShareReport = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => reportsAPI.shareReport(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['report', variables.id])
        queryClient.invalidateQueries(['shared-reports'])
        toast.success('Chia sẻ báo cáo thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Chia sẻ báo cáo thất bại')
      },
    }
  )
}

// Hook để lấy danh sách báo cáo đã lưu
export const useSavedReports = (params = {}) => {
  return useQuery(
    ['saved-reports', params],
    () => reportsAPI.getSavedReports(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo đã chia sẻ
export const useSharedReports = (params = {}) => {
  return useQuery(
    ['shared-reports', params],
    () => reportsAPI.getSharedReports(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo yêu thích
export const useFavoriteReports = (params = {}) => {
  return useQuery(
    ['favorite-reports', params],
    () => reportsAPI.getFavoriteReports(params),
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để thêm báo cáo vào yêu thích
export const useAddToFavorites = () => {
  const queryClient = useQueryClient()

  return useMutation(reportsAPI.addToFavorites, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['report', variables])
      queryClient.invalidateQueries(['favorite-reports'])
      toast.success('Thêm vào yêu thích thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thêm vào yêu thích thất bại')
    },
  })
}

// Hook để xóa báo cáo khỏi yêu thích
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient()

  return useMutation(reportsAPI.removeFromFavorites, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['report', variables])
      queryClient.invalidateQueries(['favorite-reports'])
      toast.success('Xóa khỏi yêu thích thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa khỏi yêu thích thất bại')
    },
  })
}

// Hook để lấy lịch sử chạy báo cáo
export const useReportHistory = (id) => {
  return useQuery(
    ['report', id, 'history'],
    () => reportsAPI.getReportHistory(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy thống kê báo cáo
export const useReportStats = (id) => {
  return useQuery(
    ['report', id, 'stats'],
    () => reportsAPI.getReportStats(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo theo loại
export const useReportsByType = (type, params = {}) => {
  return useQuery(
    ['reports', 'type', type, params],
    () => reportsAPI.getReportsByType(type, params),
    {
      enabled: !!type,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo theo trạng thái
export const useReportsByStatus = (status, params = {}) => {
  return useQuery(
    ['reports', 'status', status, params],
    () => reportsAPI.getReportsByStatus(status, params),
    {
      enabled: !!status,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo theo người tạo
export const useReportsByCreator = (creatorId, params = {}) => {
  return useQuery(
    ['reports', 'creator', creatorId, params],
    () => reportsAPI.getReportsByCreator(creatorId, params),
    {
      enabled: !!creatorId,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo theo ngày tạo
export const useReportsByDate = (date, params = {}) => {
  return useQuery(
    ['reports', 'date', date, params],
    () => reportsAPI.getReportsByDate(date, params),
    {
      enabled: !!date,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo theo khoảng thời gian
export const useReportsByDateRange = (startDate, endDate, params = {}) => {
  return useQuery(
    ['reports', 'date-range', startDate, endDate, params],
    () => reportsAPI.getReportsByDateRange(startDate, endDate, params),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để tìm kiếm báo cáo
export const useSearchReports = (query) => {
  return useQuery(
    ['reports', 'search', query],
    () => reportsAPI.searchReports(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo gần đây
export const useRecentReports = (limit = 10) => {
  return useQuery(
    ['recent-reports', limit],
    () => reportsAPI.getRecentReports(limit),
    {
      staleTime: 1 * 60 * 1000, // 1 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo phổ biến
export const usePopularReports = (limit = 10) => {
  return useQuery(
    ['popular-reports', limit],
    () => reportsAPI.getPopularReports(limit),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh sách báo cáo được đề xuất
export const useRecommendedReports = (limit = 10) => {
  return useQuery(
    ['recommended-reports', limit],
    () => reportsAPI.getRecommendedReports(limit),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}
