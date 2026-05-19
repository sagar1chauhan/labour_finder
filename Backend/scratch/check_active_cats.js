const mongoose = require('mongoose');
require('dotenv').config();
require('../models/Vendor');
require('../models/Category');
const Brand = require('../models/Brand');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
  
  const onlineVendors = await Vendor.find({
    isOnline: true, 
    availability: 'AVAILABLE', 
    approvalStatus: 'approved'
  }).select('_id');
  
  const onlineIds = onlineVendors.map(v => v._id);
  console.log('Online Vendor IDs:', onlineIds);

  const activeCatIds = await Brand.distinct('categoryIds', {
    status: 'active', 
    vendorId: { $in: onlineIds }
  });
  console.log('Active Category IDs:', activeCatIds);

  const cats = await Category.find({ _id: { $in: activeCatIds } });
  console.log('Categories:', cats.map(c => ({ title: c.title, type: c.categoryType })));

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
