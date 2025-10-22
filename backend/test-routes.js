// Test routes
console.log('Testing routes...');

try {
  console.log('Loading routes...');
  const routes = require('./src/routes');
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error.message);
  console.error('Stack:', error.stack);
}
