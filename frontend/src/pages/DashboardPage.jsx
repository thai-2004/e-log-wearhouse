import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@store/authStore'
import AdminDashboard from '@features/Dashboard/components/AdminDashboard'
import ManagerDashboard from '@features/Dashboard/components/ManagerDashboard'
import StaffDashboard from '@features/Dashboard/components/StaffDashboard'
import Sidebar from '@components/Sidebar'
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
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          
          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto bg-slate-50">
            {renderDashboard()}
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
