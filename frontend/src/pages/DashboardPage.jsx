import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@store/authStore'
import AdminDashboard from '@features/Dashboard/components/AdminDashboard'
import ManagerDashboard from '@features/Dashboard/components/ManagerDashboard'
import StaffDashboard from '@features/Dashboard/components/StaffDashboard'

const DashboardPage = () => {
  const { getUserRole } = useAuthStore()
  const userRole = getUserRole()

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
        <title>Bảng điều khiển - E-Log</title>
      </Helmet>
      {renderDashboard()}
    </>
  )
}

export default DashboardPage
