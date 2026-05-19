const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

const requestedCategories = [
  // Services
  {
    title: 'Electrician',
    slug: 'electrician',
    categoryType: 'service',
    homeIconUrl: '⚡',
    showOnHome: true,
    status: 'active',
    homeOrder: 1,
    description: 'Professional electrical services and home repairs'
  },
  {
    title: 'Mechanic',
    slug: 'mechanic',
    categoryType: 'service',
    homeIconUrl: '🔧',
    showOnHome: true,
    status: 'active',
    homeOrder: 2,
    description: 'Professional vehicle and machine mechanic services'
  },
  {
    title: 'House keeping',
    slug: 'house-keeping',
    categoryType: 'service',
    homeIconUrl: '🧹',
    showOnHome: true,
    status: 'active',
    homeOrder: 3,
    description: 'Professional housekeeping and home management services'
  },
  {
    title: 'Cleaning',
    slug: 'cleaning',
    categoryType: 'service',
    homeIconUrl: '🧼',
    showOnHome: true,
    status: 'active',
    homeOrder: 4,
    description: 'Professional house and office cleaning services'
  },
  
  // Materials / Products
  {
    title: 'Tool shop',
    slug: 'tool-shop',
    categoryType: 'product',
    homeIconUrl: '🛠️',
    showOnHome: true,
    status: 'active',
    homeOrder: 5,
    description: 'Quality tools and hardware equipment'
  },
  {
    title: 'Traders',
    slug: 'traders',
    categoryType: 'product',
    homeIconUrl: '🤝',
    showOnHome: true,
    status: 'active',
    homeOrder: 6,
    description: 'Materials trading and wholesale supply'
  },
  {
    title: 'Hardware',
    slug: 'hardware',
    categoryType: 'product',
    homeIconUrl: '🔩',
    showOnHome: true,
    status: 'active',
    homeOrder: 7,
    description: 'Construction and building hardware supplies'
  },
  {
    title: 'Plywood',
    slug: 'plywood',
    categoryType: 'product',
    homeIconUrl: '🪵',
    showOnHome: true,
    status: 'active',
    homeOrder: 8,
    description: 'High-quality plywood and timber materials'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
  console.log('Connected to MongoDB.');

  for (const catData of requestedCategories) {
    // Check if category exists (case-insensitive by title or slug)
    let existing = await Category.findOne({
      $or: [
        { title: { $regex: new RegExp(`^${catData.title}$`, 'i') } },
        { slug: catData.slug }
      ]
    });

    if (existing) {
      console.log(`Category "${catData.title}" already exists. Updating to active...`);
      existing.status = 'active';
      existing.categoryType = catData.categoryType;
      existing.homeIconUrl = catData.homeIconUrl;
      existing.showOnHome = true;
      existing.homeOrder = catData.homeOrder;
      existing.description = catData.description;
      await existing.save();
      console.log(`Updated: ${existing.title}`);
    } else {
      const created = await Category.create(catData);
      console.log(`Created new category: ${created.title} (${created.categoryType})`);
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
