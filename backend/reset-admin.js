// Reset Admin User Script
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ username: 'admin' });
    console.log('🗑️  Deleted existing admin user');

    // Create new admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@elog.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
      phone: '+84901234567'
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully!');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('📧 Email: admin@elog.com');

  } catch (error) {
    console.error('❌ Error resetting admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

resetAdmin();
