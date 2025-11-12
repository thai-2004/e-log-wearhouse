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
  FiBarChart,
  FiDollarSign,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi'
import { useDashboardOverview, useDashboardStats, useDashboardAlerts, useRecentActivities } from '../hooks/useDashboard'
import { useAuthStore } from '@store/authStore'
import { Link } from 'react-router-dom'
import NotificationSystem from '@components/NotificationSystem'
import { DashboardExport } from '@components/ExportComponents'

const ManagerDashboard = () => {
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview()
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats('7d')
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useDashboardAlerts()
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivities()
  const { user } = useAuthStore()
  
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

  // Manager-specific stats (business focused)
  const managerStats = [
    {
      name: 'Tổng sản phẩm',
      value: overview.totalProducts?.toLocaleString() || '0',
      change: stats.productsChange || '+12%',
      changeType: 'positive',
      icon: FiPackage,
      link: '/products'
    },
    {
      name: 'Khách hàng',
      value: overview.totalCustomers?.toLocaleString() || '0',
      change: stats.customersChange || '+8%',
      changeType: 'positive',
      icon: FiUsers,
      link: '/customers'
    },
    {
      name: 'Giá trị tồn kho',
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
      name: 'Nhà cung cấp',
      value: overview.totalSuppliers?.toLocaleString() || '0',
      change: stats.suppliersChange || '+3%',
      changeType: 'positive',
      icon: FiTruck,
      link: '/suppliers'
    },
    {
      name: 'Hiệu suất kho',
      value: overview.warehouseEfficiency ? `${overview.warehouseEfficiency}%` : '0%',
      change: stats.efficiencyChange || '+5%',
      changeType: 'positive',
      icon: FiActivity,
      link: '/warehouses'
    }
  ]

  // Manager quick actions
  const managerQuickActions = [
    {
      name: 'Quản lý sản phẩm',
      description: 'Thêm, sửa sản phẩm',
      icon: FiPackage,
      link: '/products',
      color: 'text-blue-600'
    },
    {
      name: 'Quản lý khách hàng',
      description: 'Quản lý thông tin khách hàng',
      icon: FiUsers,
      link: '/customers',
      color: 'text-green-600'
    },
    {
      name: 'Báo cáo kinh doanh',
      description: 'Xem báo cáo chi tiết',
      icon: FiBarChart,
      link: '/reports',
      color: 'text-purple-600'
    },
    {
      name: 'Quản lý nhà cung cấp',
      description: 'Quản lý nhà cung cấp',
      icon: FiTruck,
      link: '/suppliers',
      color: 'text-orange-600'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard Quản lý - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chào mừng Quản lý!</h1>
              <p className="mt-1 text-purple-100">
                Xin chào {user?.fullName || 'Quản lý'}, đây là tổng quan kinh doanh của bạn.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <FiBarChart className="h-8 w-8 text-purple-200" />
              <span className="text-sm font-medium text-purple-200">MANAGER</span>
            </div>
          </div>
        </div>

        {/* Manager Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {managerStats.map((stat) => {
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

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Business Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Biểu đồ kinh doanh
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiBarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Biểu đồ kinh doanh sẽ được triển khai</p>
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
              ) : activities.length > 0 ? (
                activities.map((activity) => {
                  const Icon = activity.type === 'inbound' ? FiTruck : 
                              activity.type === 'alert' ? FiAlertCircle : 
                              activity.type === 'user' ? FiUsers : 
                              activity.type === 'customer' ? FiUsers :
                              activity.type === 'product' ? FiPackage : FiActivity
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

        {/* Business Alerts */}
        {alerts.filter(alert => alert.type === 'business').length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cảnh báo kinh doanh
            </h3>
            <div className="space-y-3">
              {alerts.filter(alert => alert.type === 'business').map((alert) => (
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

        {/* Manager Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thao tác quản lý
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {managerQuickActions.map((action) => {
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

        {/* Performance Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tổng quan hiệu suất
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiTrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Tăng trưởng</p>
                  <p className="text-2xl font-semibold text-green-900">+15%</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <FiEye className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Hiệu quả</p>
                  <p className="text-2xl font-semibold text-blue-900">92%</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center">
                <FiBarChart className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Mục tiêu</p>
                  <p className="text-2xl font-semibold text-purple-900">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManagerDashboard
