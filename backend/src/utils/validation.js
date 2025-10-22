// Validation Utilities
const mongoose = require('mongoose');

// Kiểm tra field unique
const checkUniqueField = async(Model, field, value, excludeId = null) => {
  try {
    const query = { [field]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Model.findOne(query);
  } catch (error) {
    throw new Error(`Database error checking unique field: ${error.message}`);
  }
};

// Kiểm tra ObjectId hợp lệ
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Validate SKU format (alphanumeric with optional hyphens)
const isValidSKU = (sku) => {
  const skuRegex = /^[A-Z0-9][A-Z0-9\-]*[A-Z0-9]$/i;
  return skuRegex.test(sku);
};

// Validate barcode format
const isValidBarcode = (barcode) => {
  // EAN-13, UPC-A, Code 128 formats
  const barcodeRegex = /^[0-9]{8,13}$/;
  return barcodeRegex.test(barcode);
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// Validate date range
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
};

// Validate pagination parameters
const validatePagination = (page, limit, maxLimit = 100) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
  return { page: validPage, limit: validLimit };
};

// Validate sort parameters
const validateSort = (sortField, allowedFields, defaultSort = 'createdAt') => {
  if (!sortField || !allowedFields.includes(sortField)) {
    return defaultSort;
  }
  return sortField;
};

// Validate sort direction
const validateSortDirection = (direction, defaultDirection = 'desc') => {
  const validDirections = ['asc', 'desc', '1', '-1'];
  if (!direction || !validDirections.includes(direction.toLowerCase())) {
    return defaultDirection;
  }
  return direction.toLowerCase();
};

// Build search query
const buildSearchQuery = (searchTerm, searchFields) => {
  if (!searchTerm || !searchFields.length) return {};

  const searchRegex = { $regex: searchTerm, $options: 'i' };
  return {
    $or: searchFields.map(field => ({ [field]: searchRegex }))
  };
};

// Validate file upload
const validateFileUpload = (file, allowedTypes, maxSize) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return errors;
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed`);
  }

  return errors;
};

// Validate array of ObjectIds
const validateObjectIdArray = (ids) => {
  if (!Array.isArray(ids)) return false;
  return ids.every(id => isValidObjectId(id));
};

// Convert string to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string' && isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

// Convert array of strings to ObjectIds
const toObjectIdArray = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => toObjectId(id)).filter(id => id !== null);
};

module.exports = {
  checkUniqueField,
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isValidSKU,
  isValidBarcode,
  sanitizeString,
  isValidDateRange,
  validatePagination,
  validateSort,
  validateSortDirection,
  buildSearchQuery,
  validateFileUpload,
  validateObjectIdArray,
  toObjectId,
  toObjectIdArray
};
