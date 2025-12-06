// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

// App Configuration
export const APP_CONFIG = {
  NAME: 'E-Log Warehouse Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Modern warehouse management system',
  AUTHOR: 'E-Log Team',
}

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
}

// Date Format Configuration
export const DATE_CONFIG = {
  DISPLAY_FORMAT: 'dd/MM/yyyy',
  API_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIME_FORMAT: 'HH:mm',
}

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
}

// Role Configuration
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
}

// Permission Configuration
export const PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  PRODUCT_MANAGEMENT: 'product_management',
  CATEGORY_MANAGEMENT: 'category_management',
  INVENTORY_MANAGEMENT: 'inventory_management',
  WAREHOUSE_MANAGEMENT: 'warehouse_management',
  CUSTOMER_MANAGEMENT: 'customer_management',
  SUPPLIER_MANAGEMENT: 'supplier_management',
  INBOUND_MANAGEMENT: 'inbound_management',
  OUTBOUND_MANAGEMENT: 'outbound_management',
  REPORT_VIEW: 'report_view',
}

// Status Configuration
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    BASE: '/users',
    STATS: '/users/stats',
    BY_ROLE: '/users/role',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    BY_CATEGORY: '/products/category',
    BY_SKU: '/products/sku',
    BY_BARCODE: '/products/barcode',
    LOW_STOCK: '/products/low-stock',
    UPDATE_PRICE: '/products/:id/price',
  },
  CATEGORIES: {
    BASE: '/categories',
    TREE: '/categories/tree',
    BY_PARENT: '/categories/parent',
    MOVE: '/categories/:id/move',
    BULK_UPDATE: '/categories/bulk/update',
    STATISTICS: '/categories/stats/statistics',
    SEARCH: '/categories/search/advanced',
    EXPORT: '/categories/export/data',
  },
  INVENTORY: {
    BASE: '/inventory',
    BY_PRODUCT: '/inventory/product',
    BY_WAREHOUSE: '/inventory/warehouse',
    BY_LOCATION: '/inventory/location',
    LOW_STOCK: '/inventory/low-stock',
    ZERO_STOCK: '/inventory/zero-stock',
    OVERSTOCK: '/inventory/overstock',
    MOVEMENTS: '/inventory/movements',
    ADJUST: '/inventory/adjust',
    REPORT: '/inventory/report',
    EXPORT: '/inventory/export',
  },
  WAREHOUSES: {
    BASE: '/warehouses',
    ZONES: '/warehouses/:id/zones',
    LOCATIONS: '/warehouses/:id/locations',
  },
  CUSTOMERS: {
    BASE: '/customers',
    SEARCH: '/customers/search',
    ORDERS: '/customers/:id/orders',
    STATISTICS: '/customers/:id/statistics',
  },
  SUPPLIERS: {
    BASE: '/suppliers',
    SEARCH: '/suppliers/search',
    PRODUCTS: '/suppliers/:id/products',
    STATISTICS: '/suppliers/:id/statistics',
  },
  INBOUND: {
    BASE: '/inbound',
    BY_SUPPLIER: '/inbound/supplier',
    BY_WAREHOUSE: '/inbound/warehouse',
    SUBMIT: '/inbound/:id/submit',
    APPROVE: '/inbound/:id/approve',
    COMPLETE: '/inbound/:id/complete',
    CANCEL: '/inbound/:id/cancel',
  },
  OUTBOUND: {
    BASE: '/outbound',
    BY_CUSTOMER: '/outbound/customer',
    BY_WAREHOUSE: '/outbound/warehouse',
    SUBMIT: '/outbound/:id/submit',
    APPROVE: '/outbound/:id/approve',
    COMPLETE: '/outbound/:id/complete',
    CANCEL: '/outbound/:id/cancel',
    SHIP: '/outbound/:id/ship',
    DELIVER: '/outbound/:id/deliver',
  },
  REPORTS: {
    // RESTful base cho module quản lý báo cáo (Report templates, CRUD, chạy báo cáo, ...)
    BASE: '/reports',

    // Các endpoint báo cáo tổng hợp/thống kê hiện có ở backend
    INVENTORY: '/reports/inventory',
    SALES: '/reports/sales',
    PURCHASES: '/reports/purchases',
    MOVEMENTS: '/reports/movements',
    CUSTOMERS: '/reports/customers',
    SUPPLIERS: '/reports/suppliers',
    WAREHOUSES: '/reports/warehouses',
    EXPORT: '/reports/export',
  },
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    INVENTORY: '/dashboard/inventory',
    SALES: '/dashboard/sales',
    WAREHOUSES: '/dashboard/warehouses',
    ALERTS: '/dashboard/alerts',
    TRENDS: '/dashboard/trends',
  },
  HEALTH: {
    BASE: '/health',
    DETAILED: '/health/detailed',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
}
