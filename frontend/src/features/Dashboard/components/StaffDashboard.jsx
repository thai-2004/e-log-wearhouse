import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  FiPackage, 
  FiArchive, 
  FiTruck, 
  FiLoader,
  FiAlertCircle,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiBox,
  FiEye,
  FiEyeOff,
  FiRefreshCw
} from 'react-icons/fi'
import { useDashboardOverview, useDashboardStats, useDashboardAlerts, useRecentActivities } from '../hooks/useDashboard'
import { useAuthStore } from '@store/authStore'
import { Link } from 'react-router-dom'
import { ActivityChart, OrderStatusChart } from '@components/charts/DashboardCharts'
import NotificationSystem from '@components/NotificationSystem'
import { DashboardExport } from '@components/ExportComponents'

const StaffDashboard = () => {
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview()
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats('7d')
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useDashboardAlerts()
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivities()
  const { user } = useAuthStore()
  
  const [showCharts, setShowCharts] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchOverview(),
        refetchStats(),
        refetchAlerts(),
        refetchActivities()
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  // Mock chart data for staff
  const activityData = [
    { day: 'Mon', inbound: 25, outbound: 20 },
    { day: 'Tue', inbound: 30, outbound: 25 },
    { day: 'Wed', inbound: 28, outbound: 22 },
    { day: 'Thu', inbound: 35, outbound: 30 },
    { day: 'Fri', inbound: 32, outbound: 28 },
    { day: 'Sat', inbound: 20, outbound: 18 },
    { day: 'Sun', inbound: 15, outbound: 12 }
  ]

  const orderStatusData = [
    { name: 'Completed', value: 70 },
    { name: 'Processing', value: 15 },
    { name: 'Pending', value: 10 },
    { name: 'Cancelled', value: 5 }
  ]

  // Loading state
  if (overviewLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    )
  }

  // Error state
  if (overviewError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <FiAlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
            <p className="mt-1 text-sm text-red-700">{overviewError.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const overview = overviewData?.data?.overview || {}
  const stats = statsData?.data?.stats || {}
  const alerts = alertsData?.data || []
  const activities = activitiesData?.data || []

  // Staff-specific stats (focused on operational tasks)
  const staffStats = [
    {
      name: 'Sản phẩm cần nhập',
      value: overview.pendingInboundOrders?.toLocaleString() || '0',
      change: stats.pendingInboundChange || '+3',
      changeType: 'positive',
      icon: FiTruck,
      link: '/inbound',
      color: 'text-blue-600'
    },
    {
      name: 'Đơn hàng chờ xuất',
      value: overview.pendingOutboundOrders?.toLocaleString() || '0',
      change: stats.pendingOutboundChange || '+5',
      changeType: 'positive',
      icon: FiBox,
      link: '/outbound',
      color: 'text-green-600'
    },
    {
      name: 'Sản phẩm sắp hết',
      value: overview.lowStockProducts?.toLocaleString() || '0',
      change: stats.lowStockChange || '+2',
      changeType: 'negative',
      icon: FiAlertCircle,
      link: '/inventory',
      color: 'text-red-600'
    },
    {
      name: 'Hoàn thành hôm nay',
      value: overview.todayCompletedOrders?.toLocaleString() || '0',
      change: stats.todayCompletedChange || '+8',
      changeType: 'positive',
      icon: FiCheckCircle,
      link: '/reports',
      color: 'text-success-600'
    }
  ]

  // Staff quick actions
  const staffQuickActions = [
    {
      name: 'Nhập kho mới',
      description: 'Tạo đơn nhập kho',
      icon: FiTruck,
      link: '/inbound',
      color: 'text-blue-600'
    },
    {
      name: 'Xuất kho',
      description: 'Tạo đơn xuất kho',
      icon: FiBox,
      link: '/outbound',
      color: 'text-green-600'
    },
    {
      name: 'Kiểm tra tồn kho',
      description: 'Xem tồn kho hiện tại',
      icon: FiArchive,
      link: '/inventory',
      color: 'text-purple-600'
    },
    {
      name: 'Cập nhật sản phẩm',
      description: 'Chỉnh sửa thông tin',
      icon: FiPackage,
      link: '/products',
      color: 'text-orange-600'
    }
  ]

  // Filter activities for staff (only operational activities)
  const staffActivities = activities.filter(activity => 
    ['inbound', 'outbound', 'inventory', 'alert'].includes(activity.type)
  )

  return (
    <>
      <Helmet>
        <title>Dashboard Nhân viên - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chào mừng Nhân viên!</h1>
              <p className="mt-1 text-green-100">
                Xin chào {user?.fullName || 'Nhân viên'}, đây là công việc của bạn hôm nay.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <FiActivity className="h-8 w-8 text-green-200" />
              <span className="text-sm font-medium text-green-200">STAFF</span>
            </div>
          </div>
        </div>

        {/* Staff Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {staffStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.name} to={stat.link} className="group">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                            }`}>
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Work Progress Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tiến độ công việc
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Biểu đồ tiến độ sẽ được triển khai</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : staffActivities.length > 0 ? (
                staffActivities.map((activity) => {
                  const Icon = activity.type === 'inbound' ? FiTruck : 
                              activity.type === 'outbound' ? FiBox :
                              activity.type === 'alert' ? FiAlertCircle : 
                              activity.type === 'inventory' ? FiArchive : FiActivity
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-4">Không có hoạt động gần đây</p>
              )}
            </div>
          </div>
        </div>

        {/* Operational Alerts */}
        {alerts.filter(alert => alert.type === 'operational').length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cảnh báo vận hành
            </h3>
            <div className="space-y-3">
              {alerts.filter(alert => alert.type === 'operational').map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">{alert.title}</p>
                    <p className="text-sm text-yellow-700">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {staffQuickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  to={action.link}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left group transition-colors"
                >
                  <Icon className={`h-6 w-6 mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Nhiệm vụ hôm nay
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiClock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Đơn nhập kho #IN001</p>
                  <p className="text-xs text-blue-600">Chờ xử lý</p>
                </div>
              </div>
              <Link to="/inbound" className="text-sm text-blue-600 hover:text-blue-800">
                Xem chi tiết
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Đơn xuất kho #OUT002</p>
                  <p className="text-xs text-green-600">Đã hoàn thành</p>
                </div>
              </div>
              <Link to="/outbound" className="text-sm text-green-600 hover:text-green-800">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffDashboard
