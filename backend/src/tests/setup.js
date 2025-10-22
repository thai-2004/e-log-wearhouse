// Jest Test Setup
require('dotenv').config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/elog_test';

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Generate test user data
  createTestUser: (overrides = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'user',
    ...overrides
  }),

  // Generate test product data
  createTestProduct: (overrides = {}) => ({
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'Test product description',
    category: 'test-category',
    unitPrice: 100,
    status: 'active',
    ...overrides
  }),

  // Generate test JWT token
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 'test-user-id', role: 'user', ...payload },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
};
