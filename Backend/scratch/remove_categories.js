const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

async function removeCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const targetTitles = ['Electrician', 'Cleaning', 'House keeping', 'Mechanic', 'Grocery'];
    console.log(`Removing categories: ${targetTitles.join(', ')}...`);

    const result = await Category.deleteMany({
      title: { $in: targetTitles }
    });

    console.log(`Successfully removed ${result.deletedCount} categories.`);
    
    // List remaining categories
    const remaining = await Category.find({}).select('title').lean();
    console.log('\nRemaining Categories in Database:');
    remaining.forEach(c => console.log(`- ${c.title}`));

    process.exit(0);
  } catch (error) {
    console.error('Error removing categories:', error);
    process.exit(1);
  }
}

removeCategories();
