// Dashboard Routes
const express = require('express');
const router = express.Router();
const { query } = require('express-validator');

// Import controllers
const dashboardController = require('../controllers/dashboardController');

// Import middleware
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// Validation rules
const dashboardValidation = [
  query('timeRange')
    .optional()
    .isIn(['today', 'week', 'month', 'quarter', 'year', 'custom'])
    .withMessage('Khoảng thời gian phải là một trong: hôm nay, tuần, tháng, quý, năm, tùy chỉnh'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày bắt đầu phải là định dạng ISO 8601 hợp lệ'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày kết thúc phải là định dạng ISO 8601 hợp lệ'),
  query('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('ID kho hợp lệ là bắt buộc')
];

// Routes
router.get('/', authenticateToken, dashboardValidation, dashboardController.getDashboardOverview);
router.get('/stats', authenticateToken, dashboardValidation, dashboardController.getDashboardStats);
router.get('/alerts', authenticateToken, dashboardController.getAlerts);
router.get('/top-products', authenticateToken, dashboardValidation, dashboardController.getTopProducts);
router.get('/recent-activities', authenticateToken, dashboardController.getRecentActivities);
router.get('/activities', authenticateToken, dashboardController.getRecentActivities);

module.exports = router;
