// Auth Routes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middlewares/auth');

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Tên đăng nhập phải có từ 3 đến 20 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một số'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Vai trò không hợp lệ')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username hoặc email là bắt buộc'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải chứa ít nhất một chữ thường, một chữ hoa và một số')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Tên đăng nhập phải có từ 3 đến 20 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên phải có từ 1 đến 50 ký tự'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ phải có từ 1 đến 50 ký tự'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Vui lòng cung cấp số điện thoại hợp lệ')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);

// Development only - Reset rate limit
if (process.env.NODE_ENV === 'development') {
  router.post('/reset-rate-limit', authController.resetRateLimit);
}

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.put('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, authController.updateProfile);

module.exports = router;