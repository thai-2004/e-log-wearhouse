// Create Default Admin User Script
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@elog.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
      phone: '+84901234567',
      createdBy: 'system'
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('📧 Email: admin@elog.com');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

createDefaultAdmin();
