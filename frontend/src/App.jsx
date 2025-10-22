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
        
        {/* Protected Routes */}
        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/products" element={
          isAuthenticated ? (
            <Layout>
              <ProductsPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/categories" element={
          isAuthenticated ? (
            <Layout>
              <CategoriesPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/users" element={
          isAuthenticated ? (
            <Layout>
              <UsersPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/inventory" element={
          isAuthenticated ? (
            <Layout>
              <InventoryPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/warehouses" element={
          isAuthenticated ? (
            <Layout>
              <WarehousesPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/customers" element={
          isAuthenticated ? (
            <Layout>
              <CustomersPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/suppliers" element={
          isAuthenticated ? (
            <Layout>
              <SuppliersPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/inbound" element={
          isAuthenticated ? (
            <Layout>
              <InboundPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/outbound" element={
          isAuthenticated ? (
            <Layout>
              <OutboundPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/reports" element={
          isAuthenticated ? (
            <Layout>
              <ReportsPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/profile" element={
          isAuthenticated ? (
            <Layout>
              <ProfilePage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
