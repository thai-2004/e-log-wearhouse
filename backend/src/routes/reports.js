// Report Routes
const express = require('express');
const router = express.Router();
const { query } = require('express-validator');

// Import controllers
const reportController = require('../controllers/reportController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const reportValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Ngày bắt đầu phải là định dạng ISO 8601 hợp lệ'),
  query('endDate')
    .isISO8601()
    .withMessage('Ngày kết thúc phải là định dạng ISO 8601 hợp lệ'),
  query('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Định dạng phải là một trong: json, csv, pdf')
];

const inventoryReportValidation = [
  query('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock phải là giá trị boolean'),
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Định dạng phải là một trong: json, csv, pdf')
];

// Routes
router.get('/sales', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getSalesReport);
router.get('/inventory', authenticateToken, authorize('admin', 'manager'), inventoryReportValidation, reportController.getInventoryReport);
router.get('/inbound', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getInboundReport);
router.get('/outbound', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getOutboundReport);
router.get('/customer', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getCustomerReport);
router.get('/product', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getProductReport);
router.get('/warehouse', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getWarehouseReport);
router.get('/summary', authenticateToken, authorize('admin', 'manager'), reportValidation, reportController.getSummaryReport);

module.exports = router;
