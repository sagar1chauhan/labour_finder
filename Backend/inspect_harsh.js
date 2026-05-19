const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
require('dotenv').config();

async function inspectHarsh() {
  await mongoose.connect(process.env.MONGODB_URI);
  const harsh = await Vendor.findOne({ name: /Harsh Pandey/i }).lean();
  console.log(JSON.stringify(harsh, null, 2));
  await mongoose.disconnect();
}

inspectHarsh();
