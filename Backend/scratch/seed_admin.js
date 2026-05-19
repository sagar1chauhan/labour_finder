const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../models/Admin');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const email = 'admin@admin.com';
    const password = 'admin123';

    console.log(`Checking for existing admin with email ${email}...`);
    await Admin.deleteOne({ email });

    console.log('Creating super admin account...');
    const admin = await Admin.create({
      name: 'Super Admin',
      email,
      password, // Will be hashed automatically by pre-save hook
      role: 'super_admin',
      isActive: true
    });

    console.log(`\n--- Admin Seeding Completed Successfully ---`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
