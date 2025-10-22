require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Staff user
    const staffData = {
      username: 'staff',
      email: 'staff@company.com',
      password: await bcrypt.hash('staff123', 12),
      role: 'staff',
      isActive: true,
      profile: {
        firstName: 'Staff',
        lastName: 'User',
        phone: '0123456789',
        address: '123 Staff Street, City'
      }
    };

    // Create Manager user
    const managerData = {
      username: 'manager',
      email: 'manager@company.com',
      password: await bcrypt.hash('manager123', 12),
      role: 'manager',
      isActive: true,
      profile: {
        firstName: 'Manager',
        lastName: 'User',
        phone: '0987654321',
        address: '456 Manager Avenue, City'
      }
    };

    // Check if users already exist
    const existingStaff = await User.findOne({ username: 'staff' });
    const existingManager = await User.findOne({ username: 'manager' });

    if (existingStaff) {
      console.log('⚠️  Staff user already exists');
    } else {
      const staff = new User(staffData);
      await staff.save();
      console.log('✅ Staff user created successfully');
      console.log('   Username: staff');
      console.log('   Password: staff123');
      console.log('   Email: staff@company.com');
    }

    if (existingManager) {
      console.log('⚠️  Manager user already exists');
    } else {
      const manager = new User(managerData);
      await manager.save();
      console.log('✅ Manager user created successfully');
      console.log('   Username: manager');
      console.log('   Password: manager123');
      console.log('   Email: manager@company.com');
    }

    console.log('\n📋 User Accounts Summary:');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email: admin@company.com');
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
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

createUsers();
