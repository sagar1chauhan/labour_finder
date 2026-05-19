const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const City = require('./models/City');
require('dotenv').config();

async function checkOnlineVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const onlineVendors = await Vendor.find({ 
      isOnline: true, 
      availability: 'AVAILABLE' 
    }).select('name businessName address isOnline availability approvalStatus service categories currentSocketId updatedAt');

    console.log(`Found ${onlineVendors.length} online vendors:`);
    onlineVendors.forEach(v => {
      console.log(`- ${v.name} (${v.businessName || 'No Business Name'}) | City: ${v.address?.city} | Status: ${v.approvalStatus}`);
      console.log(`  Socket: ${v.currentSocketId || 'NONE (Ghost?)'}`);
      console.log(`  Last Updated: ${v.updatedAt}`);
    });

    const cities = await City.find({ isActive: true }).select('name slug');
    console.log('\nActive Cities:');
    cities.forEach(c => {
      console.log(`- ${c.name} (Slug: ${c.slug}, ID: ${c._id})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOnlineVendors();
