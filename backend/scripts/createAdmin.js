// Script to create an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.username);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@elog.com',
      passwordHash: 'Admin123!', // This will be hashed by the pre-save hook
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: Admin123!');
    console.log('Email: admin@elog.com');
    console.log('Role: admin');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();

