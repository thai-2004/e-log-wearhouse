import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { 
  FiHome, 
  FiPackage, 
  FiLayers, 
  FiUsers, 
  FiArchive, 
  FiTruck, 
  FiUserCheck, 
  FiTruck as FiSupplier, 
  FiLogIn, 
  FiLogOut, 
  FiBarChart, 
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, logout, hasPermission } = useAuthStore()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      permission: null,
    },
    {
      name: 'Products',
      href: '/products',
      icon: FiPackage,
      permission: 'product_management',
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FiLayers,
      permission: 'category_management',
    },
    {
      name: 'Users',
      href: '/users',
      icon: FiUsers,
      permission: 'user_management',
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: FiArchive,
      permission: 'inventory_management',
    },
    {
      name: 'Warehouses',
      href: '/warehouses',
      icon: FiTruck,
      permission: 'warehouse_management',
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: FiUserCheck,
      permission: 'customer_management',
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: FiSupplier,
      permission: 'supplier_management',
    },
    {
      name: 'Inbound',
      href: '/inbound',
      icon: FiLogIn,
      permission: 'inbound_management',
    },
    {
      name: 'Outbound',
      href: '/outbound',
      icon: FiLogOut,
      permission: 'outbound_management',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FiBarChart,
      permission: 'report_view',
    },
  ]

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  )

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static lg:inset-0 lg:z-auto"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-semibold text-gray-900">E-Log</h1>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* User section */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'user'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  >
                    <FiSettings className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
