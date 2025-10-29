import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@store/authStore'
import AdminDashboard from '@features/Dashboard/components/AdminDashboard'
import ManagerDashboard from '@features/Dashboard/components/ManagerDashboard'
import StaffDashboard from '@features/Dashboard/components/StaffDashboard'
import Header from '@components/Header'

const DashboardPage = () => {
  const { getUserRole } = useAuthStore()
  const userRole = getUserRole()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />
      case 'manager':
        return <ManagerDashboard />
      case 'staff':
        return <StaffDashboard />
      default:
        return <StaffDashboard /> // Default to staff dashboard
    }
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - E-Logistics</title>
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Chào mừng bạn đến với hệ thống quản lý kho hàng E-Logistics
                </p>
              </div>

              <div className="space-y-6">
                {renderDashboard()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
