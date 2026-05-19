const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Vendor = require('../models/Vendor');
  const vendors = await Vendor.find({}).lean();
  console.log(`Found ${vendors.length} vendors`);
  vendors.forEach(v => {
    console.log(`- ID: ${v._id}, Name: ${v.name}, Email: ${v.email}, Categories: ${JSON.stringify(v.categories)}`);
  });
  process.exit(0);
}
run();
