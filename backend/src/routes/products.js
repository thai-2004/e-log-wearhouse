// Product Routes
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const productController = require('../controllers/productController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên sản phẩm phải có từ 1 đến 100 ký tự'),
  body('sku')
    .notEmpty()
    .withMessage('SKU là bắt buộc')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU chỉ được chứa chữ hoa, số và dấu gạch ngang'),
  body('barcode')
    .optional()
    .matches(/^[0-9]+$/)
    .withMessage('Mã vạch chỉ được chứa số'),
  body('categoryId')
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Chi phí phải là số dương'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Trọng lượng phải là số dương'),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Kích thước phải là một đối tượng'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID sản phẩm hợp lệ là bắt buộc'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên sản phẩm phải có từ 1 đến 100 ký tự'),
  body('sku')
    .optional()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU chỉ được chứa chữ hoa, số và dấu gạch ngang'),
  body('barcode')
    .optional()
    .matches(/^[0-9]+$/)
    .withMessage('Mã vạch chỉ được chứa số'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Chi phí phải là số dương'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Trọng lượng phải là số dương'),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Kích thước phải là một đối tượng'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const getProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1 đến 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Từ khóa tìm kiếm không được vượt quá 100 ký tự'),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createProductValidation, productController.createProduct);
router.get('/', getProductsValidation, productController.getProducts);
router.get('/:id', param('id').isMongoId().withMessage('Valid product ID is required'), productController.getProductById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateProductValidation, productController.updateProduct);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid product ID is required'), productController.deleteProduct);

// Additional product routes
router.get('/sku/:sku', param('sku').notEmpty().withMessage('SKU is required'), productController.getProductBySKU);
router.get('/barcode/:barcode', param('barcode').notEmpty().withMessage('Barcode is required'), productController.getProductByBarcode);
router.get('/category/:categoryId', param('categoryId').isMongoId().withMessage('Valid category ID is required'), productController.getProductsByCategory);

module.exports = router;
