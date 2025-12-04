// Inventory Routes
const express = require('express');
const router = express.Router();
const { body, param, query, oneOf } = require('express-validator');
const mongoose = require('mongoose');

// Import controllers
const inventoryController = require('../controllers/inventoryController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createInventoryValidation = [
  body('productId')
    .isMongoId()
    .withMessage('ID sản phẩm hợp lệ là bắt buộc'),
  body('warehouseId')
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  // Cho phép bỏ trống; nếu cung cấp thì chấp nhận MongoId HOẶC mã vị trí
  body('locationId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return mongoose.Types.ObjectId.isValid(val) || typeof val === 'string';
    })
    .withMessage('locationId phải là MongoId hoặc mã vị trí hợp lệ'),
  body('locationCode')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage('locationCode phải là chuỗi'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Số lượng phải là số nguyên không âm'),
  body('reservedQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng dự trữ phải là số nguyên không âm'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mức tồn kho tối thiểu phải là số nguyên không âm'),
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mức tồn kho tối đa phải là số nguyên không âm')
];

const updateInventoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID tồn kho hợp lệ là bắt buộc'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng phải là số nguyên không âm'),
  body('reservedQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng dự trữ phải là số nguyên không âm'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mức tồn kho tối thiểu phải là số nguyên không âm'),
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mức tồn kho tối đa phải là số nguyên không âm')
];

const getInventoryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1 đến 100'),
  query('productId')
    .optional()
    .isMongoId()
    .withMessage('ID sản phẩm hợp lệ là bắt buộc'),
  query('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc'),
  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock phải là giá trị boolean')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createInventoryValidation, inventoryController.createInventory);
router.get('/', authenticateToken, getInventoryValidation, inventoryController.getInventory);

// Export route - MUST be before /:id route to avoid route conflict
router.get('/export', authenticateToken, getInventoryValidation, inventoryController.exportInventory);

// Additional inventory routes - Phải đặt TRƯỚC route /:id để tránh conflict
router.get('/product/:productId', authenticateToken, param('productId').isMongoId().withMessage('Valid product ID is required'), inventoryController.getInventoryByProduct);
router.get('/warehouse/:warehouseId', authenticateToken, param('warehouseId').isMongoId().withMessage('Valid warehouse ID is required'), inventoryController.getInventoryByWarehouse);
router.get('/low-stock', authenticateToken, inventoryController.getLowStockItems);
router.get('/zero-stock', authenticateToken, inventoryController.getZeroStockItems);
router.get('/overstock', authenticateToken, inventoryController.getOverstockItems);

// Routes with :id - Phải đặt SAU các routes cụ thể
router.get('/:id', param('id').isMongoId().withMessage('Valid inventory ID is required'), inventoryController.getInventoryById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateInventoryValidation, inventoryController.updateInventory);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid inventory ID is required'), inventoryController.deleteInventory);

const adjustInventoryValidation = [
  body('inventoryId')
    .isMongoId()
    .withMessage('ID tồn kho hợp lệ là bắt buộc'),
  body('adjustment')
    .isInt()
    .withMessage('Điều chỉnh phải là số nguyên'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .withMessage('Ghi chú phải là chuỗi')
];

router.post('/adjust', authenticateToken, authorize('admin', 'manager'), adjustInventoryValidation, inventoryController.adjustInventory);

module.exports = router;
