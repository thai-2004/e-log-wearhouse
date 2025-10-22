// Category Routes
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const categoryController = require('../controllers/categoryController');

// Import middleware
const { authenticateToken, authorize } = require('../middlewares/auth');

// Validation rules
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên danh mục là bắt buộc')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên danh mục phải có từ 1 đến 50 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Mô tả không được vượt quá 200 ký tự'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục cha hợp lệ là bắt buộc'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID danh mục hợp lệ là bắt buộc'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên danh mục phải có từ 1 đến 50 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Mô tả không được vượt quá 200 ký tự'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục cha hợp lệ là bắt buộc'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

const getCategoriesValidation = [
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
  query('parentId')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục cha hợp lệ là bắt buộc'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean')
];

// Routes
router.post('/', authenticateToken, authorize('admin', 'manager'), createCategoryValidation, categoryController.createCategory);
router.get('/', getCategoriesValidation, categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', param('id').isMongoId().withMessage('Valid category ID is required'), categoryController.getCategoryById);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorize('admin'), param('id').isMongoId().withMessage('Valid category ID is required'), categoryController.deleteCategory);

// Additional category routes
router.get('/:id/report', param('id').isMongoId().withMessage('Valid category ID is required'), categoryController.getCategoryReport);
router.get('/parent/:parentId', param('parentId').isMongoId().withMessage('Valid parent category ID is required'), categoryController.getCategoriesByParent);

// Advanced category routes
router.get('/stats/statistics', authenticateToken, authorize('admin', 'manager'), categoryController.getCategoryStatistics);
router.get('/search/advanced', categoryController.searchCategories);
router.get('/export/data', authenticateToken, authorize('admin', 'manager'), categoryController.exportCategories);

// Category management routes
router.put('/:id/move', 
  authenticateToken, 
  authorize('admin', 'manager'), 
  param('id').isMongoId().withMessage('Valid category ID is required'),
  body('newParentId').optional().isMongoId().withMessage('Valid parent category ID is required'),
  categoryController.moveCategory
);

router.put('/bulk/update',
  authenticateToken,
  authorize('admin', 'manager'),
  body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs array is required'),
  body('updateData').isObject().withMessage('Update data is required'),
  categoryController.bulkUpdateCategories
);

module.exports = router;