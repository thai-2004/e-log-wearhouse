// Customer Routes
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const customerController = require('../controllers/customerController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createCustomerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên khách hàng là bắt buộc')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên khách hàng phải có từ 1 đến 100 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Vui lòng cung cấp số điện thoại hợp lệ'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Địa chỉ phải là một đối tượng'),
  body('customerType')
    .isIn(['individual', 'business'])
    .withMessage('Loại khách hàng phải là cá nhân hoặc doanh nghiệp'),
  body('taxId')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Mã số thuế phải có từ 10 đến 15 ký tự'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const updateCustomerValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID khách hàng hợp lệ là bắt buộc'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên khách hàng phải có từ 1 đến 100 ký tự'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Vui lòng cung cấp số điện thoại hợp lệ'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Địa chỉ phải là một đối tượng'),
  body('customerType')
    .optional()
    .isIn(['individual', 'business'])
    .withMessage('Loại khách hàng phải là cá nhân hoặc doanh nghiệp'),
  body('taxId')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Mã số thuế phải có từ 10 đến 15 ký tự'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const getCustomersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  query('customerType')
    .optional()
    .isIn(['individual', 'business'])
    .withMessage('Loại khách hàng phải là cá nhân hoặc doanh nghiệp'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createCustomerValidation, customerController.createCustomer);
router.get('/', getCustomersValidation, customerController.getCustomers);
router.get('/:id', param('id').isMongoId().withMessage('Valid customer ID is required'), customerController.getCustomerById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateCustomerValidation, customerController.updateCustomer);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid customer ID is required'), customerController.deleteCustomer);

// Additional customer routes
router.get('/email/:email', param('email').isEmail().withMessage('Valid email is required'), customerController.getCustomerByEmail);
router.get('/type/:customerType', param('customerType').isIn(['individual', 'business']).withMessage('Valid customer type is required'), customerController.getCustomersByType);

module.exports = router;