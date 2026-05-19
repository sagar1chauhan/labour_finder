const mongoose = require('mongoose');
require('dotenv').config();
const Brand = require('../models/Brand');
const Service = require('../models/UserService');
const Category = require('../models/Category');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
  
  const civilCat = await Category.findOne({ title: 'CIVIL' });
  if (!civilCat) {
    console.error('CIVIL category not found');
    process.exit(1);
  }

  // Fix Brand
  const resBrand = await Brand.updateMany(
    { title: 'Reti' },
    { $set: { categoryIds: [civilCat._id], categoryId: civilCat._id } }
  );
  console.log('Brand Update result:', resBrand);

  // Fix UserService
  const resService = await Service.updateMany(
    { title: 'Reti' },
    { $set: { categoryId: civilCat._id } }
  );
  console.log('Service Update result:', resService);

  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
