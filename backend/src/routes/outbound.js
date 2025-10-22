// Outbound Routes
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const outboundController = require('../controllers/outboundController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createOutboundValidation = [
  body('customerId')
    .isMongoId()
    .withMessage('ID khách hàng hợp lệ là bắt buộc'),
  body('warehouseId')
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  body('expectedDate')
    .isISO8601()
    .withMessage('Ngày dự kiến phải là định dạng ISO 8601 hợp lệ'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Cần ít nhất một sản phẩm'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('ID sản phẩm hợp lệ là bắt buộc cho mỗi sản phẩm'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương cho mỗi sản phẩm'),
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá đơn vị phải là số dương'),
  body('shippingAddress')
    .isObject()
    .withMessage('Địa chỉ giao hàng là bắt buộc'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự')
];

const updateOutboundValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID xuất kho hợp lệ là bắt buộc'),
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('ID khách hàng hợp lệ là bắt buộc'),
  body('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  body('expectedDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày dự kiến phải là định dạng ISO 8601 hợp lệ'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Cần ít nhất một sản phẩm'),
  body('items.*.productId')
    .optional()
    .isMongoId()
    .withMessage('ID sản phẩm hợp lệ là bắt buộc cho mỗi sản phẩm'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương cho mỗi sản phẩm'),
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá đơn vị phải là số dương'),
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Địa chỉ giao hàng phải là một đối tượng'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự')
];

const getOutboundsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1 đến 100'),
  query('status')
    .optional()
    .isIn(['pending', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Trạng thái phải là một trong: pending, shipped, delivered, cancelled'),
  query('customerId')
    .optional()
    .isMongoId()
    .withMessage('ID khách hàng hợp lệ là bắt buộc'),
  query('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createOutboundValidation, outboundController.createOutbound);
router.get('/', getOutboundsValidation, outboundController.getOutbounds);
router.get('/:id', param('id').isMongoId().withMessage('Valid outbound ID is required'), outboundController.getOutboundById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateOutboundValidation, outboundController.updateOutbound);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid outbound ID is required'), outboundController.deleteOutbound);

// Additional outbound routes
router.post('/:id/ship', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid outbound ID is required'), outboundController.shipOutbound);
router.post('/:id/deliver', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid outbound ID is required'), outboundController.deliverOutbound);
router.post('/:id/cancel', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid outbound ID is required'), outboundController.cancelOutbound);
router.get('/customer/:customerId', param('customerId').isMongoId().withMessage('Valid customer ID is required'), outboundController.getOutboundsByCustomer);
router.get('/warehouse/:warehouseId', param('warehouseId').isMongoId().withMessage('Valid warehouse ID is required'), outboundController.getOutboundsByWarehouse);

module.exports = router;
