// Inbound Routes
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const inboundController = require('../controllers/inboundController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createInboundValidation = [
  body('supplierId')
    .isMongoId()
    .withMessage('ID nhà cung cấp hợp lệ là bắt buộc'),
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
  body('items.*.unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Chi phí đơn vị phải là số dương'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự')
];

const updateInboundValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID nhập kho hợp lệ là bắt buộc'),
  body('supplierId')
    .optional()
    .isMongoId()
    .withMessage('ID nhà cung cấp hợp lệ là bắt buộc'),
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
  body('items.*.unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Chi phí đơn vị phải là số dương'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự')
];

const getInboundsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'received', 'partial', 'cancelled'])
    .withMessage('Status must be one of: pending, received, partial, cancelled'),
  query('supplierId')
    .optional()
    .isMongoId()
    .withMessage('ID nhà cung cấp hợp lệ là bắt buộc'),
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
router.post('/', authenticateToken, authorize('admin', 'manager'), createInboundValidation, inboundController.createInbound);
router.get('/', getInboundsValidation, inboundController.getInbounds);
router.get('/:id', param('id').isMongoId().withMessage('Valid inbound ID is required'), inboundController.getInboundById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateInboundValidation, inboundController.updateInbound);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid inbound ID is required'), inboundController.deleteInbound);

// Additional inbound routes
router.post('/:id/receive', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid inbound ID is required'), inboundController.receiveInbound);
router.post('/:id/cancel', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid inbound ID is required'), inboundController.cancelInbound);
router.get('/supplier/:supplierId', param('supplierId').isMongoId().withMessage('Valid supplier ID is required'), inboundController.getInboundsBySupplier);
router.get('/warehouse/:warehouseId', param('warehouseId').isMongoId().withMessage('Valid warehouse ID is required'), inboundController.getInboundsByWarehouse);

module.exports = router;