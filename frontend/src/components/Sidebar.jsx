import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FiHome,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiBarChart,
  FiSettings,
  FiUser,
  FiTruck,
  FiArchive,
  FiTrendingUp,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiBell,
  FiSearch
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [expandedMenus, setExpandedMenus] = useState({})

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: FiHome,
        path: '/dashboard',
        roles: ['admin', 'manager', 'employee']
      },
      {
        id: 'products',
        label: 'Products',
        icon: FiPackage,
        path: '/products',
        roles: ['admin', 'manager', 'employee']
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: FiShoppingCart,
        path: '/orders',
        roles: ['admin', 'manager', 'employee']
      }
    ]

    const adminItems = [
      {
        id: 'users',
        label: 'Team',
        icon: FiUsers,
        path: '/users',
        roles: ['admin', 'manager']
      },
      {
        id: 'warehouse',
        label: 'Projects',
        icon: FiArchive,
        path: '/warehouse',
        roles: ['admin', 'manager']
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: FiBarChart,
        path: '/reports',
        roles: ['admin', 'manager']
      }
    ]

    const employeeItems = [
      {
        id: 'profile',
        label: 'Profile',
        icon: FiUser,
        path: '/profile',
        roles: ['admin', 'manager', 'employee']
      }
    ]

    return [...baseItems, ...adminItems, ...employeeItems]
  }

  const menuItems = getMenuItems().filter(item => 
    item.roles.includes(user?.role || 'employee')
  )

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`bg-slate-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">E-Logistics</h1>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isItemActive = isActive(item.path)
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isItemActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Teams Section */}
        {!isCollapsed && (user?.role === 'admin' || user?.role === 'manager') && (
          <div className="mt-8">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Teams
              </h3>
            </div>
            <ul className="mt-2 space-y-1">
              <li>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">A</span>
                  </div>
                  <span className="text-sm">Admin Team</span>
                </div>
              </li>
              <li>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">M</span>
                  </div>
                  <span className="text-sm">Manager Team</span>
                </div>
              </li>
              <li>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">S</span>
                  </div>
                  <span className="text-sm">Staff Team</span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-slate-700">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? 'Settings' : ''}
            >
              <FiSettings className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Settings</span>}
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <FiLogOut className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
