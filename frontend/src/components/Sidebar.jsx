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
  FiSearch,
  FiTag,
  FiMapPin,
  FiClipboard,
  FiDollarSign
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
        roles: ['admin', 'manager', 'staff']
      },
      {
        id: 'products',
        label: 'Sản phẩm',
        icon: FiPackage,
        path: '/products',
        roles: ['admin', 'manager', 'staff']
      },
      {
        id: 'categories',
        label: 'Danh mục',
        icon: FiTag,
        path: '/categories',
        roles: ['admin', 'manager', 'staff']
      },
      {
        id: 'inventory',
        label: 'Tồn kho',
        icon: FiArchive,
        path: '/inventory',
        roles: ['admin', 'manager', 'staff']
      },
      {
        id: 'warehouses',
        label: 'Kho hàng',
        icon: FiMapPin,
        path: '/warehouses',
        roles: ['admin', 'manager', 'staff']
      }
    ]

    const managementItems = [
      {
        id: 'orders',
        label: 'Đơn hàng',
        icon: FiShoppingCart,
        path: '/orders',
        roles: ['admin', 'manager', 'staff']
      },
      {
        id: 'suppliers',
        label: 'Nhà cung cấp',
        icon: FiTruck,
        path: '/suppliers',
        roles: ['admin', 'manager']
      },
      {
        id: 'users',
        label: 'Người dùng',
        icon: FiUsers,
        path: '/users',
        roles: ['admin', 'manager']
      }
    ]

    const reportsItems = [
      {
        id: 'reports',
        label: 'Báo cáo',
        icon: FiBarChart,
        path: '/reports',
        roles: ['admin', 'manager']
      },
      {
        id: 'analytics',
        label: 'Phân tích',
        icon: FiTrendingUp,
        path: '/analytics',
        roles: ['admin', 'manager']
      }
    ]

    return [...baseItems, ...managementItems, ...reportsItems]
  }

  const menuItems = getMenuItems().filter(item => 
    item.roles.includes(user?.role || 'staff')
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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">E-Logistics</h1>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Navigation */}
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isItemActive = isActive(item.path)
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isItemActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Quick Stats Section */}
        {!isCollapsed && (
          <div className="mt-8 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Thống kê nhanh
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Tổng sản phẩm</span>
                <span className="text-xs font-semibold text-blue-400">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Đơn hàng hôm nay</span>
                <span className="text-xs font-semibold text-green-400">56</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Tồn kho thấp</span>
                <span className="text-xs font-semibold text-red-400">12</span>
              </div>
            </div>
          </div>
        )}

        {/* User Info Section */}
        {!isCollapsed && (
          <div className="mt-6 p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Người dùng'}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {user?.role || 'staff'}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-slate-700">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('/settings')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? 'Cài đặt' : ''}
            >
              <FiSettings className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium text-sm">Cài đặt</span>}
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Đăng xuất' : ''}
            >
              <FiLogOut className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium text-sm">Đăng xuất</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
