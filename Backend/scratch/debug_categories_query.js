const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const City = require('../models/City');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
  
  // Find a city
  const city = await City.findOne({ name: /bengaluru/i });
  console.log('City found:', city ? { id: city._id, name: city.name } : 'None');
  
  const cityId = city ? city._id : null;
  
  // Query 1: Basic status active
  const catsActive = await Category.find({ status: 'active' });
  console.log('All active categories count:', catsActive.length);
  console.log('All active titles:', catsActive.map(c => c.title));

  // Query 2: With cityId filter
  const query = { status: 'active' };
  if (cityId) {
    query.$or = [
      { cityIds: cityId },
      { cityIds: { $exists: false } },
      { cityIds: { $size: 0 } }
    ];
  }
  const catsWithCity = await Category.find(query);
  console.log('Categories matching city filter count:', catsWithCity.length);
  console.log('City filtered titles:', catsWithCity.map(c => c.title));

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
