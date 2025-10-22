// Error Handler Utilities
const { HTTP_STATUS } = require('../config/constants');

// Handle MongoDB errors
const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: `${field} already exists`,
      status: HTTP_STATUS.CONFLICT,
      field: field
    };
  }

  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return {
      message: 'Validation failed',
      status: HTTP_STATUS.BAD_REQUEST,
      errors: errors
    };
  }

  if (error.name === 'CastError') {
    // Invalid ObjectId
    return {
      message: `Invalid ${error.path}: ${error.value}`,
      status: HTTP_STATUS.BAD_REQUEST,
      field: error.path
    };
  }

  // Generic database error
  return {
    message: 'Database operation failed',
    status: HTTP_STATUS.SERVER_ERROR
  };
};

// Handle JWT errors
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid token',
      status: HTTP_STATUS.UNAUTHORIZED
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Token expired',
      status: HTTP_STATUS.UNAUTHORIZED
    };
  }

  return {
    message: 'Authentication failed',
    status: HTTP_STATUS.UNAUTHORIZED
  };
};

// Handle file upload errors
const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      message: 'File too large',
      status: HTTP_STATUS.BAD_REQUEST
    };
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      message: 'Too many files',
      status: HTTP_STATUS.BAD_REQUEST
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      message: 'Unexpected field name',
      status: HTTP_STATUS.BAD_REQUEST
    };
  }

  return {
    message: 'File upload failed',
    status: HTTP_STATUS.SERVER_ERROR
  };
};

// Handle business logic errors
const handleBusinessError = (error) => {
  const businessErrors = {
    'INSUFFICIENT_STOCK': {
      message: 'Insufficient stock available',
      status: HTTP_STATUS.BAD_REQUEST
    },
    'INVALID_STATUS_TRANSITION': {
      message: 'Invalid status transition',
      status: HTTP_STATUS.BAD_REQUEST
    },
    'PRODUCT_IN_USE': {
      message: 'Product is currently in use',
      status: HTTP_STATUS.CONFLICT
    },
    'WAREHOUSE_FULL': {
      message: 'Warehouse capacity exceeded',
      status: HTTP_STATUS.BAD_REQUEST
    },
    'CUSTOMER_HAS_ORDERS': {
      message: 'Customer has existing orders',
      status: HTTP_STATUS.CONFLICT
    },
    'SUPPLIER_HAS_PURCHASES': {
      message: 'Supplier has existing purchases',
      status: HTTP_STATUS.CONFLICT
    }
  };

  return businessErrors[error.code] || {
    message: error.message || 'Business logic error',
    status: HTTP_STATUS.BAD_REQUEST
  };
};

// Generic error handler
const handleError = (error) => {
  console.error('Error:', error);

  // Database errors
  if (error.name === 'MongoError' || error.name === 'ValidationError' || error.name === 'CastError') {
    return handleDatabaseError(error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
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

  // Default error
  return {
    message: error.message || 'Internal server error',
    status: HTTP_STATUS.SERVER_ERROR
  };
};

// Create standardized error response
const createErrorResponse = (error, additionalData = {}) => {
  const errorInfo = handleError(error);

  const response = {
    success: false,
    message: errorInfo.message,
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
    message: message
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

// Error logging
const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context: context,
    ...(error.code && { code: error.code }),
    ...(error.name && { name: error.name })
  };

  console.error('Error Log:', JSON.stringify(errorLog, null, 2));
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

module.exports = {
  handleDatabaseError,
  handleJWTError,
  handleFileUploadError,
  handleBusinessError,
  handleError,
  createErrorResponse,
  createSuccessResponse,
  asyncHandler,
  logError,
  formatValidationErrors
};
