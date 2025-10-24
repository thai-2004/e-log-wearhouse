// Reset All Users Script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const resetAllUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing users
    await User.deleteMany({});
    console.log('🗑️  Deleted all existing users');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@elog.com',
      passwordHash: 'admin123',
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
      phone: '+84901234567'
    });

    // Create staff user
    const staffUser = new User({
      username: 'staff',
      email: 'staff@company.com',
      passwordHash: 'staff123',
      fullName: 'Staff User',
      phone: '0123456789',
      role: 'staff',
      isActive: true
    });

    // Create manager user
    const managerUser = new User({
      username: 'manager',
      email: 'manager@company.com',
      passwordHash: 'manager123',
      fullName: 'Manager User',
      phone: '0987654321',
      role: 'manager',
      isActive: true
    });

    await adminUser.save();
    await staffUser.save();
    await managerUser.save();

    console.log('✅ All users created successfully!');
    console.log('\n📋 User Accounts Summary:');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email: admin@elog.com');
    console.log('  Role: admin');
    
    console.log('\nStaff:');
    console.log('  Username: staff');
    console.log('  Password: staff123');
    console.log('  Email: staff@company.com');
    console.log('  Role: staff');
    
    console.log('\nManager:');
    console.log('  Username: manager');
    console.log('  Password: manager123');
    console.log('  Email: manager@company.com');
    console.log('  Role: manager');

  } catch (error) {
    console.error('❌ Error resetting users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

resetAllUsers();
