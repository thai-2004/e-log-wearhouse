// User Routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middlewares/auth');
const { body, param } = require('express-validator');

// Validation rules
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff', 'viewer'])
    .withMessage('Invalid role')
];

const updateUserValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff', 'viewer'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const changePasswordValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const updateRoleValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .isIn(['admin', 'manager', 'staff', 'viewer'])
    .withMessage('Invalid role')
];

const resetPasswordValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes

// POST /users - Tạo user mới (Admin only)
router.post(
  '/',
  authenticateToken,
  authorize('admin'),
  createUserValidation,
  userController.createUser
);

// GET /users - Lấy danh sách users
router.get(
  '/',
  authenticateToken,
  authorize('admin', 'manager'),
  userController.getUsers
);

// GET /users/stats - Lấy thống kê users (Admin only)
router.get(
  '/stats',
  authenticateToken,
  authorize('admin'),
  userController.getUserStats
);

// GET /users/role/:role - Lấy users theo role
router.get(
  '/role/:role',
  authenticateToken,
  authorize('admin', 'manager'),
  userController.getUsersByRole
);

// GET /users/:userId - Lấy user theo ID
router.get(
  '/:userId',
  authenticateToken,
  authorize('admin', 'manager'),
  userController.getUserById
);

// PUT /users/:userId - Cập nhật user
router.put(
  '/:userId',
  authenticateToken,
  authorize('admin', 'manager'),
  updateUserValidation,
  userController.updateUser
);

// DELETE /users/:userId - Xóa user (soft delete)
router.delete(
  '/:userId',
  authenticateToken,
  authorize('admin'),
  userController.deleteUser
);

// PUT /users/:userId/activate - Kích hoạt lại user
router.put(
  '/:userId/activate',
  authenticateToken,
  authorize('admin'),
  userController.activateUser
);

// PUT /users/:userId/change-password - Đổi mật khẩu
router.put(
  '/:userId/change-password',
  authenticateToken,
  changePasswordValidation,
  userController.changePassword
);

// PUT /users/:userId/role - Cập nhật role
router.put(
  '/:userId/role',
  authenticateToken,
  authorize('admin'),
  updateRoleValidation,
  userController.updateUserRole
);

// PUT /users/:userId/reset-password - Reset password (Admin only)
router.put(
  '/:userId/reset-password',
  authenticateToken,
  authorize('admin'),
  resetPasswordValidation,
  userController.resetPassword
);

module.exports = router;