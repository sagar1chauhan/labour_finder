const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
  const allCats = await Category.find({});
  console.log('Total categories in DB:', allCats.length);
  console.log(JSON.stringify(allCats.map(c => ({ _id: c._id, title: c.title, categoryType: c.categoryType, status: c.status, showOnHome: c.showOnHome })), null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
