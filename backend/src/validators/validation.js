// Validation Middleware
const { body, param, query } = require('express-validator');

// User validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff', 'viewer'])
    .withMessage('Invalid role')
];

const validateUserLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username hoặc email là bắt buộc'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Product validation
const validateProduct = [
  body('sku')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('name')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters')
    .trim(),
  body('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .trim(),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock must be a non-negative integer'),
  body('reorderPoint')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder point must be a non-negative integer')
];

// Warehouse validation
const validateWarehouse = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Warehouse code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Warehouse code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Warehouse name must be between 2 and 100 characters')
    .trim(),
  body('area')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('capacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  body('managerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID')
];

const validateZone = [
  body('code')
    .isLength({ min: 1, max: 20 })
    .withMessage('Zone code must be between 1 and 20 characters')
    .trim(),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Zone name must be between 2 and 100 characters')
    .trim()
];

const validateLocation = [
  body('code')
    .isLength({ min: 1, max: 20 })
    .withMessage('Location code must be between 1 and 20 characters')
    .trim(),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2 and 100 characters')
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a non-negative integer')
];

// Supplier validation
const validateSupplier = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Supplier code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Supplier code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

// Customer validation
const validateCustomer = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Customer code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Customer code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('type')
    .optional()
    .isIn(['individual', 'company'])
    .withMessage('Invalid customer type')
];

// Inbound validation
const validateInbound = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Inbound code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Inbound code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  body('supplierId')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  body('inboundDate')
    .isISO8601()
    .withMessage('Invalid inbound date'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.locationId')
    .isMongoId()
    .withMessage('Invalid location ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('items.*.taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('items.*.discountRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount rate must be between 0 and 100')
];

// Outbound validation
const validateOutbound = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Outbound code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Outbound code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  body('customerId')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('outboundDate')
    .isISO8601()
    .withMessage('Invalid outbound date'),
  body('type')
    .optional()
    .isIn(['sale', 'transfer', 'return', 'other'])
    .withMessage('Invalid outbound type'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.locationId')
    .isMongoId()
    .withMessage('Invalid location ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('items.*.taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('items.*.discountRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount rate must be between 0 and 100')
];

// Inventory validation
const validateInventoryUpdate = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('reservedQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reserved quantity must be a non-negative integer')
];

const validateInventoryReserve = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  body('locationId')
    .isMongoId()
    .withMessage('Invalid location ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const validateInventoryTransfer = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  body('fromLocationId')
    .isMongoId()
    .withMessage('Invalid source location ID'),
  body('toLocationId')
    .isMongoId()
    .withMessage('Invalid destination location ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// Parameter validation
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`)
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

module.exports = {
  // User validations
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,

  // Product validations
  validateProduct,

  // Warehouse validations
  validateWarehouse,
  validateZone,
  validateLocation,

  // Supplier validations
  validateSupplier,

  // Customer validations
  validateCustomer,

  // Transaction validations
  validateInbound,
  validateOutbound,

  // Inventory validations
  validateInventoryUpdate,
  validateInventoryReserve,
  validateInventoryTransfer,

  // Common validations
  validateMongoId,
  validatePagination,
  validateDateRange
};
