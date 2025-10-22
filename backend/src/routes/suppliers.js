// Supplier Routes
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// Import controllers
const supplierController = require('../controllers/supplierController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createSupplierValidation = [
  body('name')
    .notEmpty()
    .withMessage('Supplier name is required'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required')
];

const updateSupplierValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Supplier name is required'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createSupplierValidation, supplierController.createSupplier);
router.get('/', authenticateToken, supplierController.getSuppliers);
router.get('/:id', authenticateToken, param('id').isMongoId().withMessage('Valid supplier ID is required'), supplierController.getSupplierById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateSupplierValidation, supplierController.updateSupplier);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid supplier ID is required'), supplierController.deleteSupplier);

module.exports = router;
