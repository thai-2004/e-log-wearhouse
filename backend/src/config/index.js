// Environment Configuration Manager
require('dotenv').config();

const config = {
  // Application Configuration
  app: {
    name: 'E-Log Backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    apiUrl: process.env.API_URL || 'http://localhost:5000/api',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/elog_warehouse',
    name: process.env.DB_NAME || 'elog_warehouse',
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
    serverSelectionTimeout: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeout: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
    issuer: 'e-logistics-api',
    audience: 'e-logistics-client'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'elog_session_secret_2024',
    corsOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ]
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 20 // Increased for development
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@elog.com',
    secure: false,
    requireTLS: true
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  },

  // Redis Configuration (Optional)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    ttl: 300, // 5 minutes
    maxKeys: 1000
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs/',
    maxSize: 5242880, // 5MB
    maxFiles: 5
  },

  // External APIs Configuration
  external: {
    apiKey: process.env.EXTERNAL_API_KEY || '',
    apiUrl: process.env.EXTERNAL_API_URL || ''
  },

  // Monitoring Configuration
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY || ''
  }
};

// Validation function
const validateConfig = () => {
  const errors = [];

  // Required environment variables
  if (!config.database.uri) {
    errors.push('MONGODB_URI is required');
  }

  if (!config.jwt.secret) {
    errors.push('JWT_SECRET is required');
  }

  if (config.app.environment === 'production') {
    if (config.jwt.secret === 'your_super_secret_jwt_key_change_this_in_production') {
      errors.push('JWT_SECRET must be changed in production');
    }
    if (config.security.sessionSecret === 'elog_session_secret_2024_change_this_in_production') {
      errors.push('SESSION_SECRET must be changed in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Initialize validation
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  process.exit(1);
}

// Helper functions
const isDevelopment = () => config.app.environment === 'development';
const isProduction = () => config.app.environment === 'production';
const isTest = () => config.app.environment === 'test';

// Export configuration
module.exports = {
  ...config,
  isDevelopment,
  isProduction,
  isTest,
  validateConfig
};
