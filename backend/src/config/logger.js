// Winston Logger Configuration
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_FILE_PATH || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'elog-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),

    // Audit log file
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ],

  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Custom logging methods
logger.audit = (action, userId, details = {}) => {
  logger.info('Audit Log', {
    type: 'audit',
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.security = (event, details = {}) => {
  logger.warn('Security Event', {
    type: 'security',
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.performance = (operation, duration, details = {}) => {
  logger.info('Performance Log', {
    type: 'performance',
    operation,
    duration,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.business = (event, details = {}) => {
  logger.info('Business Event', {
    type: 'business',
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user._id : null
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }

    // Log performance for slow requests
    if (duration > 1000) {
      logger.performance('slow_request', duration, logData);
    }
  });

  next();
};

// Error logging helper
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    context,
    timestamp: new Date().toISOString()
  });
};

// Database operation logging
logger.dbOperation = (operation, collection, details = {}) => {
  logger.debug('Database Operation', {
    type: 'database',
    operation,
    collection,
    details,
    timestamp: new Date().toISOString()
  });
};

// API response logging
logger.apiResponse = (endpoint, method, statusCode, responseTime, details = {}) => {
  logger.info('API Response', {
    type: 'api',
    endpoint,
    method,
    statusCode,
    responseTime,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
