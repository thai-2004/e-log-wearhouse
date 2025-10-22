// Application Constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer'
};

// Inbound Status
const INBOUND_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Outbound Status
const OUTBOUND_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Stock Movement Types
const STOCK_MOVEMENT_TYPES = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  RETURN: 'return'
};

// Customer Types
const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company',
  WHOLESALE: 'wholesale',
  RETAIL: 'retail'
};

// Supplier Types
const SUPPLIER_TYPES = {
  MANUFACTURER: 'manufacturer',
  DISTRIBUTOR: 'distributor',
  WHOLESALER: 'wholesaler',
  IMPORTER: 'importer'
};

// Warehouse Types
const WAREHOUSE_TYPES = {
  MAIN: 'main',
  BRANCH: 'branch',
  TEMPORARY: 'temporary',
  COLD_STORAGE: 'cold_storage'
};

// Product Status
const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File Upload Limits
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

// JWT Configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// Database Configuration
const DB_CONFIG = {
  CONNECTION_TIMEOUT: 30000,
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 2
};

// Cache Configuration
const CACHE_CONFIG = {
  TTL: 300, // 5 minutes
  MAX_KEYS: 1000
};

// Email Configuration
const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'noreply@elog.com',
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    ORDER_CONFIRMATION: 'order_confirmation'
  }
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

// Report Types
const REPORT_TYPES = {
  INVENTORY: 'inventory',
  SALES: 'sales',
  PURCHASE: 'purchase',
  MOVEMENT: 'movement',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier'
};

// Export Formats
const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
};

// Audit Actions
const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  EXPORT: 'export'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  INBOUND_STATUS,
  OUTBOUND_STATUS,
  STOCK_MOVEMENT_TYPES,
  CUSTOMER_TYPES,
  SUPPLIER_TYPES,
  WAREHOUSE_TYPES,
  PRODUCT_STATUS,
  PAGINATION,
  FILE_UPLOAD,
  JWT_CONFIG,
  DB_CONFIG,
  CACHE_CONFIG,
  EMAIL_CONFIG,
  NOTIFICATION_TYPES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  AUDIT_ACTIONS
};