require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Vendor = require('./models/Vendor');

const run = async () => {
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ name: /Rajesh Kumar/i }).lean();
    console.log('Vendor Rajesh Kumar details:', JSON.stringify(vendor, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
