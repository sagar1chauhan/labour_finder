const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Vendor = require('./models/Vendor');
    const vendors = await Vendor.find({ name: { $regex: /isha|harsh/i } }).lean();
    console.log(JSON.stringify(vendors.map(v => ({ 
      id: v._id,
      name: v.name, 
      isOnline: v.isOnline, 
      categories: v.categories, 
      loc: v.geoLocation 
    })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
