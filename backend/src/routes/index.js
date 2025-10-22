// Main Routes
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const customerRoutes = require('./customers');
const dashboardRoutes = require('./dashboard');
const inventoryRoutes = require('./inventory');
const inboundRoutes = require('./inbound');
const outboundRoutes = require('./outbound');
const reportRoutes = require('./reports');
const healthRoutes = require('./health');
const userRoutes = require('./users');
const supplierRoutes = require('./suppliers');
const warehouseRoutes = require('./warehouses');

// Health check endpoint (moved to dedicated health routes)
router.use('/health', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/inbound', inboundRoutes);
router.use('/outbound', outboundRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/warehouses', warehouseRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
