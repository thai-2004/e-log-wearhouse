// Warehouse Routes
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// Import controllers
const warehouseController = require('../controllers/warehouseController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createWarehouseValidation = [
  body('name')
    .notEmpty()
    .withMessage('Warehouse name is required'),
  body('address')
    .notEmpty()
    .withMessage('Warehouse address is required'),
  body('capacity')
    .isNumeric()
    .withMessage('Capacity must be a number')
];

const updateWarehouseValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Warehouse name is required'),
  body('address')
    .optional()
    .notEmpty()
    .withMessage('Warehouse address is required'),
  body('capacity')
    .optional()
    .isNumeric()
    .withMessage('Capacity must be a number')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createWarehouseValidation, warehouseController.createWarehouse);
router.get('/', authenticateToken, warehouseController.getWarehouses);
// Specific routes MUST come before param routes to avoid conflicts
router.get('/overview', authenticateToken, warehouseController.getWarehousesOverview);
router.patch('/:id/status', authenticateToken, authorize('admin', 'manager'), param('id').isMongoId().withMessage('Valid warehouse ID is required'), warehouseController.updateWarehouseStatus);
router.get('/:id', authenticateToken, param('id').isMongoId().withMessage('Valid warehouse ID is required'), warehouseController.getWarehouseById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateWarehouseValidation, warehouseController.updateWarehouse);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid warehouse ID is required'), warehouseController.deleteWarehouse);

module.exports = router;
