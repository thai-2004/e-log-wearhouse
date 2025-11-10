import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Layout Components
import Layout from '@components/layout/Layout'
import AuthLayout from '@components/layout/AuthLayout'

// Pages
import LoginPage from '@pages/LoginPage'
import DashboardPage from '@pages/DashboardPage'
import ProductsPage from '@pages/ProductsPage'
import CategoriesPage from '@pages/CategoriesPage'
import UsersPage from '@pages/UsersPage'
import InventoryPage from '@pages/InventoryPage'
import WarehousesPage from '@pages/WarehousesPage'
import CustomersPage from '@pages/CustomersPage'
import SuppliersPage from '@pages/SuppliersPage'
import InboundPage from '@pages/InboundPage'
import OutboundPage from '@pages/OutboundPage'
import ReportsPage from '@pages/ReportsPage'
import ProfilePage from '@pages/ProfilePage'
import NotFoundPage from '@pages/NotFoundPage'

// Auth Guard
import { useAuthStore } from '@store/authStore'
import ProtectedRoute from '@components/common/ProtectedRoute'

function App() {
  const { isAuthenticated, initializeAuth, user, token } = useAuthStore()

  // Initialize authentication state on app load
  useEffect(() => {
    console.log('App: Initializing auth, current state:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token
    })
    initializeAuth()
  }, [initializeAuth])

  // Debug log for authentication state changes
  useEffect(() => {
    console.log('App: Authentication state changed:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    })
  }, [isAuthenticated, user, token])

  return (
    <>
      <Helmet>
        <title>E-Log Warehouse Management System</title>
        <meta name="description" content="Modern warehouse management system" />
      </Helmet>

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />

        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="inbound" element={<InboundPage />} />
          <Route path="outbound" element={<OutboundPage />} />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
