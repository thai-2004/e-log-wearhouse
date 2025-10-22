// Jest Global Teardown
const mongoose = require('mongoose');

module.exports = async() => {
  // Close database connection
  try {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
};
