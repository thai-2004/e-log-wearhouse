// Script to reset admin password
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Reset password (will be hashed by pre-save hook)
    admin.passwordHash = 'Admin123!';
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('Username: admin');
    console.log('Password: Admin123!');
    console.log('\n⚠️  Please change the password after login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();

