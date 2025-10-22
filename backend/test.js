// Test file
console.log('Starting test...');

try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  console.log('Dotenv loaded');

  console.log('Loading config...');
  const config = require('./src/config');
  console.log('Config loaded');

  console.log('Loading database...');
  const connectDB = require('./src/config/database');
  console.log('Database module loaded');

  console.log('Loading logger...');
  const logger = require('./src/config/logger');
  console.log('Logger loaded');

  console.log('All modules loaded successfully');
} catch (error) {
  console.error('Error loading modules:', error.message);
  console.error('Stack:', error.stack);
}
