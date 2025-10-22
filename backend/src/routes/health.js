// Health Check Routes
const express = require('express');
const router = express.Router();
const { checkDatabaseHealth } = require('../config/database');
const logger = require('../config/logger');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "E-Log API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Log API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "System health check completed"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     uptime:
 *                       type: number
 *                       example: 123.456
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                           example: 45678912
 *                         total:
 *                           type: number
 *                           example: 1073741824
 *                         percentage:
 *                           type: number
 *                           example: 4.25
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         loadAverage:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [0.5, 0.3, 0.2]
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     state:
 *                       type: string
 *                       example: "connected"
 *                     host:
 *                       type: string
 *                       example: "localhost"
 *                     name:
 *                       type: string
 *                       example: "elog_warehouse"
 *       503:
 *         description: Service unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "System health check failed"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                 database:
 *                   type: object
 */
router.get('/health/detailed', async(req, res) => {
  try {
    const startTime = Date.now();

    // Get system information
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get database health
    const dbHealth = await checkDatabaseHealth();

    // Calculate memory percentage
    const totalMemory = require('os').totalmem();
    const memoryPercentage = (memoryUsage.heapUsed / totalMemory) * 100;

    const healthData = {
      success: true,
      message: 'System health check completed',
      timestamp: new Date().toISOString(),
      system: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: {
          used: memoryUsage.heapUsed,
          total: totalMemory,
          percentage: parseFloat(memoryPercentage.toFixed(2))
        },
        cpu: {
          loadAverage: require('os').loadavg()
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      database: dbHealth,
      responseTime: Date.now() - startTime
    };

    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy';

    res.status(isHealthy ? 200 : 503).json(healthData);

  } catch (error) {
    logger.error('Health check failed:', error);

    res.status(503).json({
      success: false,
      message: 'System health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     tags: [Health]
 *     description: Check if the service is ready to accept traffic
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Service is ready"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Service is not ready"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health/ready', async(req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        success: true,
        message: 'Service is ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not available'
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);

    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     tags: [Health]
 *     description: Check if the service is alive
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Service is alive"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
