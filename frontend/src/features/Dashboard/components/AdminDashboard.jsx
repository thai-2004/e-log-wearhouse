import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  FiPackage, 
  FiUsers, 
  FiArchive, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiTruck, 
  FiLoader,
  FiShield,
  FiSettings,
  FiBarChart,
  FiDollarSign,
  FiActivity,
  FiRefreshCw,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'
import { useDashboardOverview, useDashboardStats, useDashboardAlerts, useRecentActivities } from '../hooks/useDashboard'
import { useAuthStore } from '@store/authStore'
import { Link } from 'react-router-dom'
import { RevenueChart, InventoryChart, ActivityChart, OrderStatusChart, MiniChart } from '@components/charts/DashboardCharts'
import NotificationSystem from '@components/NotificationSystem'
import { DashboardExport } from '@components/ExportComponents'

const AdminDashboard = () => {
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

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 12000000 },
    { month: 'Feb', revenue: 15000000 },
    { month: 'Mar', revenue: 18000000 },
    { month: 'Apr', revenue: 22000000 },
    { month: 'May', revenue: 25000000 },
    { month: 'Jun', revenue: 28000000 }
  ]

  const inventoryData = [
    { category: 'Electronics', inStock: 120, lowStock: 15, outOfStock: 3 },
    { category: 'Clothing', inStock: 200, lowStock: 8, outOfStock: 1 },
    { category: 'Books', inStock: 150, lowStock: 12, outOfStock: 2 },
    { category: 'Home', inStock: 80, lowStock: 20, outOfStock: 5 }
  ]

  const activityData = [
    { day: 'Mon', inbound: 45, outbound: 38 },
    { day: 'Tue', inbound: 52, outbound: 42 },
    { day: 'Wed', inbound: 48, outbound: 45 },
    { day: 'Thu', inbound: 61, outbound: 55 },
    { day: 'Fri', inbound: 55, outbound: 48 },
    { day: 'Sat', inbound: 35, outbound: 30 },
    { day: 'Sun', inbound: 25, outbound: 20 }
  ]

  const orderStatusData = [
    { name: 'Completed', value: 45 },
    { name: 'Processing', value: 25 },
    { name: 'Pending', value: 15 },
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

  // Admin-specific stats
  const adminStats = [
    {
      name: 'Tổng sản phẩm',
      value: overview.totalProducts?.toLocaleString() || '0',
      change: stats.productsChange || '+12%',
      changeType: 'positive',
      icon: FiPackage,
      link: '/products'
    },
    {
      name: 'Người dùng hệ thống',
      value: overview.totalUsers?.toLocaleString() || '0',
      change: stats.usersChange || '+5%',
      changeType: 'positive',
      icon: FiUsers,
      link: '/users'
    },
    {
      name: 'Tổng giá trị tồn kho',
      value: overview.totalInventoryValue ? `${overview.totalInventoryValue.toLocaleString()}₫` : '0₫',
      change: stats.inventoryValueChange || '+18%',
      changeType: 'positive',
      icon: FiDollarSign,
      link: '/inventory'
    },
    {
      name: 'Doanh thu tháng',
      value: overview.monthlyRevenue ? `${overview.monthlyRevenue.toLocaleString()}₫` : '0₫',
      change: stats.revenueChange || '+25%',
      changeType: 'positive',
      icon: FiTrendingUp,
      link: '/reports'
    },
    {
      name: 'Đơn nhập kho',
      value: overview.totalInboundOrders?.toLocaleString() || '0',
      change: stats.inboundChange || '+8%',
      changeType: 'positive',
      icon: FiTruck,
      link: '/inbound'
    },
    {
      name: 'Đơn xuất kho',
      value: overview.totalOutboundOrders?.toLocaleString() || '0',
      change: stats.outboundChange || '+15%',
      changeType: 'positive',
      icon: FiActivity,
      link: '/outbound'
    }
  ]

  // Admin quick actions
  const adminQuickActions = [
    {
      name: 'Quản lý người dùng',
      description: 'Thêm, sửa, xóa người dùng',
      icon: FiUsers,
      link: '/users',
      color: 'text-blue-600'
    },
    {
      name: 'Cấu hình hệ thống',
      description: 'Thiết lập hệ thống',
      icon: FiSettings,
      link: '/settings',
      color: 'text-gray-600'
    },
    {
      name: 'Báo cáo tổng hợp',
      description: 'Xem báo cáo chi tiết',
      icon: FiBarChart,
      link: '/reports',
      color: 'text-green-600'
    },
    {
      name: 'Quản lý kho',
      description: 'Cấu hình kho và vị trí',
      icon: FiArchive,
      link: '/warehouses',
      color: 'text-purple-600'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard Admin - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chào mừng Admin!</h1>
              <p className="mt-1 text-primary-100">
                Xin chào {user?.fullName || 'Admin'}, đây là tổng quan hệ thống của bạn.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiShield className="h-8 w-8 text-primary-200" />
                <span className="text-sm font-medium text-primary-200">ADMIN</span>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationSystem />
                <DashboardExport 
                  dashboardData={{ overview, stats, alerts, activities }} 
                  userRole="admin" 
                />
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-primary-200 hover:text-white hover:bg-primary-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adminStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.name} to={stat.link} className="group">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
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

        {/* Charts Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Biểu đồ & Phân tích</h2>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showCharts ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            <span>{showCharts ? 'Ẩn biểu đồ' : 'Hiện biểu đồ'}</span>
          </button>
        </div>

        {/* Charts and Activities */}
        {showCharts && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <RevenueChart data={revenueData} height={300} />

            {/* Inventory Chart */}
            <InventoryChart data={inventoryData} height={300} />
          </div>
        )}

        {/* Additional Charts Row */}
        {showCharts && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Activity Chart */}
            <ActivityChart data={activityData} height={300} />

            {/* Order Status Chart */}
            <OrderStatusChart data={orderStatusData} height={300} />
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Hoạt động gần đây
            </h3>
            <button
              onClick={() => refetchActivities()}
              disabled={activitiesLoading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="h-5 w-5 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = activity.type === 'inbound' ? FiTruck : 
                            activity.type === 'alert' ? FiAlertCircle : 
                            activity.type === 'user' ? FiUsers : FiActivity
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
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

        {/* System Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cảnh báo hệ thống
            </h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <FiAlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      alert.severity === 'high' ? 'text-red-800' :
                      alert.severity === 'medium' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>{alert.title}</p>
                    <p className={`text-sm ${
                      alert.severity === 'high' ? 'text-red-700' :
                      alert.severity === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thao tác quản trị
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminQuickActions.map((action) => {
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
      </div>
    </>
  )
}

export default AdminDashboard
