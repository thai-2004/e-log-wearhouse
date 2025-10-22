// Enhanced Error Handler Middleware
const logger = require('../config/logger');
const { HTTP_STATUS } = require('../config/constants');

// Handle MongoDB errors
const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: `${field} already exists`,
      status: HTTP_STATUS.CONFLICT,
      field: field,
      code: 'DUPLICATE_KEY'
    };
  }

  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return {
      message: 'Validation failed',
      status: HTTP_STATUS.BAD_REQUEST,
      errors: errors,
      code: 'VALIDATION_ERROR'
    };
  }

  if (error.name === 'CastError') {
    // Invalid ObjectId
    return {
      message: `Invalid ${error.path}: ${error.value}`,
      status: HTTP_STATUS.BAD_REQUEST,
      field: error.path,
      code: 'CAST_ERROR'
    };
  }

  if (error.name === 'MongoServerError') {
    return {
      message: 'Database server error',
      status: HTTP_STATUS.SERVER_ERROR,
      code: 'MONGO_SERVER_ERROR'
    };
  }

  // Generic database error
  return {
    message: 'Database operation failed',
    status: HTTP_STATUS.SERVER_ERROR,
    code: 'DATABASE_ERROR'
  };
};

// Handle JWT errors
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid token',
      status: HTTP_STATUS.UNAUTHORIZED,
      code: 'INVALID_TOKEN'
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Token expired',
      status: HTTP_STATUS.UNAUTHORIZED,
      code: 'TOKEN_EXPIRED'
    };
  }

  if (error.name === 'NotBeforeError') {
    return {
      message: 'Token not active',
      status: HTTP_STATUS.UNAUTHORIZED,
      code: 'TOKEN_NOT_ACTIVE'
    };
  }

  return {
    message: 'Authentication failed',
    status: HTTP_STATUS.UNAUTHORIZED,
    code: 'AUTH_ERROR'
  };
};

// Handle file upload errors
const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      message: 'File too large',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      message: 'Too many files',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'TOO_MANY_FILES'
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      message: 'Unexpected field name',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'UNEXPECTED_FIELD'
    };
  }

  if (error.code === 'LIMIT_PART_COUNT') {
    return {
      message: 'Too many parts',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'TOO_MANY_PARTS'
    };
  }

  return {
    message: 'File upload failed',
    status: HTTP_STATUS.SERVER_ERROR,
    code: 'FILE_UPLOAD_ERROR'
  };
};

// Handle business logic errors
const handleBusinessError = (error) => {
  const businessErrors = {
    'INSUFFICIENT_STOCK': {
      message: 'Insufficient stock available',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'INSUFFICIENT_STOCK'
    },
    'INVALID_STATUS_TRANSITION': {
      message: 'Invalid status transition',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'INVALID_STATUS_TRANSITION'
    },
    'PRODUCT_IN_USE': {
      message: 'Product is currently in use',
      status: HTTP_STATUS.CONFLICT,
      code: 'PRODUCT_IN_USE'
    },
    'WAREHOUSE_FULL': {
      message: 'Warehouse capacity exceeded',
      status: HTTP_STATUS.BAD_REQUEST,
      code: 'WAREHOUSE_FULL'
    },
    'CUSTOMER_HAS_ORDERS': {
      message: 'Customer has existing orders',
      status: HTTP_STATUS.CONFLICT,
      code: 'CUSTOMER_HAS_ORDERS'
    },
    'SUPPLIER_HAS_PURCHASES': {
      message: 'Supplier has existing purchases',
      status: HTTP_STATUS.CONFLICT,
      code: 'SUPPLIER_HAS_PURCHASES'
    },
    'INVALID_PERMISSIONS': {
      message: 'Insufficient permissions',
      status: HTTP_STATUS.FORBIDDEN,
      code: 'INVALID_PERMISSIONS'
    },
    'RESOURCE_NOT_FOUND': {
      message: 'Resource not found',
      status: HTTP_STATUS.NOT_FOUND,
      code: 'RESOURCE_NOT_FOUND'
    }
  };

  return businessErrors[error.code] || {
    message: error.message || 'Business logic error',
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'BUSINESS_ERROR'
  };
};

// Handle validation errors
const handleValidationError = (error) => {
  if (error.name === 'ValidationError' && error.errors) {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    return {
      message: 'Validation failed',
      status: HTTP_STATUS.BAD_REQUEST,
      errors: errors,
      code: 'VALIDATION_ERROR'
    };
  }

  return {
    message: 'Validation error',
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'VALIDATION_ERROR'
  };
};

// Generic error handler
const handleError = (error) => {
  // Database errors
  if (error.name === 'MongoError' ||
      error.name === 'ValidationError' ||
      error.name === 'CastError' ||
      error.name === 'MongoServerError') {
    return handleDatabaseError(error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError') {
    return handleJWTError(error);
  }

  // File upload errors
  if (error.code && error.code.startsWith('LIMIT_')) {
    return handleFileUploadError(error);
  }

  // Business logic errors
  if (error.code && typeof error.code === 'string') {
    return handleBusinessError(error);
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }

  // Default error
  return {
    message: error.message || 'Internal server error',
    status: HTTP_STATUS.SERVER_ERROR,
    code: 'INTERNAL_ERROR'
  };
};

// Create standardized error response
const createErrorResponse = (error, additionalData = {}) => {
  const errorInfo = handleError(error);

  const response = {
    success: false,
    message: errorInfo.message,
    code: errorInfo.code,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  if (errorInfo.errors) {
    response.errors = errorInfo.errors;
  }

  if (errorInfo.field) {
    response.field = errorInfo.field;
  }

  return {
    status: errorInfo.status,
    data: response
  };
};

// Create success response
const createSuccessResponse = (message, data = null, status = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return {
    status: status,
    data: response
  };
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null
  });

  // Create error response
  const errorResponse = createErrorResponse(err);

  // Send error response
  res.status(errorResponse.status).json(errorResponse.data);
};

// Error logging helper
const logError = (error, context = {}) => {
  logger.logError(error, context);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(err => ({
      field: err.path || err.param,
      message: err.msg || err.message,
      value: err.value
    }));
  }

  if (errors && typeof errors === 'object') {
    return Object.keys(errors).map(key => ({
      field: key,
      message: errors[key].message || errors[key],
      value: errors[key].value
    }));
  }

  return [];
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT');
  }
}

module.exports = {
  handleDatabaseError,
  handleJWTError,
  handleFileUploadError,
  handleBusinessError,
  handleError,
  createErrorResponse,
  createSuccessResponse,
  asyncHandler,
  errorHandler,
  logError,
  formatValidationErrors,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};