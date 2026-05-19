const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const Service = require('./models/UserService');
const Category = require('./models/Category');
require('dotenv').config();

async function checkVendorData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const vendorId = '69f04c4cd4ff77bdd934cf0f'; // I need to get the real ID of Harsh Pandey
    // Let's find him first
    const Vendor = require('./models/Vendor');
    const harsh = await Vendor.findOne({ name: /Harsh Pandey/i });
    if (!harsh) {
        console.log('Harsh not found');
        return;
    }
    console.log(`Found Vendor: ${harsh.name} (${harsh._id})`);

    const brands = await Brand.find({ vendorId: harsh._id }).populate('categoryIds', 'title');
    console.log(`\nBrands for ${harsh.name}: ${brands.length}`);
    brands.forEach(b => {
      console.log(`- ${b.title} | Categories: ${b.categoryIds.map(c => c.title).join(', ')} | Status: ${b.status}`);
    });

    const services = await Service.find({ vendorId: harsh._id }).populate('categoryId', 'title');
    console.log(`\nServices for ${harsh.name}: ${services.length}`);
    services.forEach(s => {
      console.log(`- ${s.title} | Category: ${s.categoryId?.title} | Status: ${s.status}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVendorData();
