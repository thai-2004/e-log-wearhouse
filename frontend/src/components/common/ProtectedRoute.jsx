import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

/**
 * ProtectedRoute component that checks authentication and authorization
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access this route
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { isAuthenticated, user } = useAuthStore()

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if role-based access control is required
  if (allowedRoles.length > 0) {
    const userRole = user?.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to dashboard with error message
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

