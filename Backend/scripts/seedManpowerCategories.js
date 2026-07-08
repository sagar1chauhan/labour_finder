const mongoose = require('mongoose');
const ManpowerCategory = require('../models/ManpowerCategory');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Homster');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Upload an image URL to Cloudinary and return the Cloudinary URL
 */
const uploadToCloudinary = async (imageUrl, folder, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `civil-connect/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    });
    console.log(`  ✅ Uploaded: ${publicId} → ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Upload failed for ${publicId}:`, error.message);
    return null;
  }
};

const seedManpowerCategories = async () => {
  try {
    console.log('🚀 Starting Manpower Categories seeding...\n');

    // Clear existing data
    await ManpowerCategory.deleteMany({});
    console.log('🗑️  Cleared existing manpower categories\n');

    // Source images — transparent PNGs from free sources
    // Using pngimg.com and other free transparent PNG sources
    const sourceImages = {
      // Main category icons
      'engineer': 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
      'mason': 'https://cdn-icons-png.flaticon.com/512/3079/3079162.png',
      'contractor': 'https://cdn-icons-png.flaticon.com/512/2942/2942031.png',
      'vehicle': 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
      'rental': 'https://cdn-icons-png.flaticon.com/512/2271/2271046.png',
      // Sub-category images
      'architect': 'https://cdn-icons-png.flaticon.com/512/1995/1995539.png',
      'civil-engineer': 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
      'supervisor': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      'home-decor': 'https://cdn-icons-png.flaticon.com/512/2956/2956744.png',
      'tile-fixer': 'https://cdn-icons-png.flaticon.com/512/4264/4264900.png',
      'plumber': 'https://cdn-icons-png.flaticon.com/512/4264/4264868.png',
      'carpenter': 'https://cdn-icons-png.flaticon.com/512/2800/2800187.png',
      'electrician': 'https://cdn-icons-png.flaticon.com/512/4264/4264872.png',
      'painter': 'https://cdn-icons-png.flaticon.com/512/4264/4264882.png',
      'plaster': 'https://cdn-icons-png.flaticon.com/512/2271/2271046.png',
      'bar-bander': 'https://cdn-icons-png.flaticon.com/512/1668/1668791.png',
      'shuttering': 'https://cdn-icons-png.flaticon.com/512/2942/2942031.png',
      'jcb': 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
      'tractor': 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
      'tempo': 'https://cdn-icons-png.flaticon.com/512/3188/3188586.png',
      'eicher': 'https://cdn-icons-png.flaticon.com/512/3774/3774310.png',
      'crane': 'https://cdn-icons-png.flaticon.com/512/3774/3774290.png',
      'water-tanker': 'https://cdn-icons-png.flaticon.com/512/3774/3774340.png',
      'mixture': 'https://cdn-icons-png.flaticon.com/512/2271/2271046.png',
      'breaker': 'https://cdn-icons-png.flaticon.com/512/1668/1668791.png',
      'compressor': 'https://cdn-icons-png.flaticon.com/512/2271/2271113.png'
    };

    console.log('📤 Uploading images to Cloudinary...\n');

    // Upload all images to Cloudinary
    const cloudinaryUrls = {};
    for (const [key, url] of Object.entries(sourceImages)) {
      cloudinaryUrls[key] = await uploadToCloudinary(url, 'manpower', key);
    }

    console.log('\n📦 Creating Manpower Categories...\n');

    // Define categories from SOP
    const categoriesData = [
      {
        title: 'Engineer',
        icon: '👷‍♂️',
        iconUrl: cloudinaryUrls['engineer'],
        order: 1,
        subCategories: [
          { title: 'Architect', iconUrl: cloudinaryUrls['architect'], order: 1 },
          { title: 'Engineer', iconUrl: cloudinaryUrls['civil-engineer'], order: 2 },
          { title: 'Supervisor', iconUrl: cloudinaryUrls['supervisor'], order: 3 },
          { title: 'Home decor', iconUrl: cloudinaryUrls['home-decor'], order: 4 }
        ]
      },
      {
        title: 'Mason & Labour',
        icon: '🧱',
        iconUrl: cloudinaryUrls['mason'],
        order: 2,
        subCategories: [
          { title: 'Tile fixer', iconUrl: cloudinaryUrls['tile-fixer'], order: 1 },
          { title: 'Plumber work', iconUrl: cloudinaryUrls['plumber'], order: 2 },
          { title: 'Carpenter', iconUrl: cloudinaryUrls['carpenter'], order: 3 },
          { title: 'Electrician', iconUrl: cloudinaryUrls['electrician'], order: 4 },
          { title: 'Painter', iconUrl: cloudinaryUrls['painter'], order: 5 },
          { title: 'Plaster & dismantler', iconUrl: cloudinaryUrls['plaster'], order: 6 },
          { title: 'Bar Bander', iconUrl: cloudinaryUrls['bar-bander'], order: 7 },
          { title: 'Shuttering', iconUrl: cloudinaryUrls['shuttering'], order: 8 }
        ]
      },
      {
        title: 'Contractor',
        icon: '🏗️',
        iconUrl: cloudinaryUrls['contractor'],
        order: 3,
        subCategories: [
          { title: 'Building contractor', iconUrl: cloudinaryUrls['contractor'], order: 1 },
          { title: 'Renovation contractor', iconUrl: cloudinaryUrls['contractor'], order: 2 },
          { title: 'Interior contractor', iconUrl: cloudinaryUrls['home-decor'], order: 3 }
        ]
      },
      {
        title: 'Vehicle Service',
        icon: '🚜',
        iconUrl: cloudinaryUrls['vehicle'],
        order: 4,
        subCategories: [
          { title: 'JCB', iconUrl: cloudinaryUrls['jcb'], order: 1 },
          { title: 'Tractor', iconUrl: cloudinaryUrls['tractor'], order: 2 },
          { title: 'Tempo', iconUrl: cloudinaryUrls['tempo'], order: 3 },
          { title: 'Eicher', iconUrl: cloudinaryUrls['eicher'], order: 4 },
          { title: 'Crane', iconUrl: cloudinaryUrls['crane'], order: 5 },
          { title: 'Water Tanker', iconUrl: cloudinaryUrls['water-tanker'], order: 6 }
        ]
      },
      {
        title: 'Rental Machine',
        icon: '⚙️',
        iconUrl: cloudinaryUrls['rental'],
        order: 5,
        subCategories: [
          { title: 'Mixture', iconUrl: cloudinaryUrls['mixture'], order: 1 },
          { title: 'Breaker', iconUrl: cloudinaryUrls['breaker'], order: 2 },
          { title: 'Compressor', iconUrl: cloudinaryUrls['compressor'], order: 3 }
        ]
      }
    ];

    for (const catData of categoriesData) {
      const category = new ManpowerCategory(catData);
      await category.save();
      console.log(`  ✅ Created: ${category.title} (${category.subCategories.length} subcategories)`);
    }

    console.log(`\n🎉 Successfully seeded ${categoriesData.length} manpower categories!`);

  } catch (error) {
    console.error('❌ Error seeding manpower categories:', error);
  }
};

// Also update the Service Categories in DB to match SOP
const updateServiceCategories = async () => {
  try {
    console.log('\n📦 Updating Service Categories (SOP: Electrician, Mechanic, House Keeping, Cleaning)...\n');

    const Category = require('../models/Category');
    const { SERVICE_STATUS } = require('../utils/constants');

    // SOP service categories to add (keep existing + add new)
    const sopServiceCategories = [
      { title: 'Electrician', slug: 'electrician', description: 'Professional electrical services', homeOrder: 10 },
      { title: 'Mechanic', slug: 'mechanic', description: 'Vehicle and machinery repair services', homeOrder: 11 },
      { title: 'House Keeping', slug: 'house-keeping', description: 'Professional housekeeping services', homeOrder: 12 },
    ];

    for (const catData of sopServiceCategories) {
      const exists = await Category.findOne({ slug: catData.slug });
      if (!exists) {
        await Category.create({
          ...catData,
          categoryType: 'service',
          showOnHome: true,
          isPopular: true,
          status: SERVICE_STATUS.ACTIVE
        });
        console.log(`  ✅ Created service category: ${catData.title}`);
      } else {
        console.log(`  ⏭️  Service category already exists: ${catData.title}`);
      }
    }

    // Ensure 'Cleaning' exists (it should from seedDatabase.js)
    const cleaning = await Category.findOne({ slug: 'cleaning' });
    if (!cleaning) {
      await Category.create({
        title: 'Cleaning',
        slug: 'cleaning',
        categoryType: 'service',
        showOnHome: true,
        isPopular: true,
        status: SERVICE_STATUS.ACTIVE,
        homeOrder: 13,
        description: 'Professional cleaning services'
      });
      console.log('  ✅ Created service category: Cleaning');
    } else {
      console.log('  ⏭️  Service category already exists: Cleaning');
    }

    // SOP material/product categories
    const sopProductCategories = [
      { title: 'Tool Shop', slug: 'tool-shop', description: 'Hardware tools and equipment', homeOrder: 20 },
      { title: 'Traders', slug: 'traders', description: 'Construction material traders', homeOrder: 21 },
      { title: 'Hardware', slug: 'hardware', description: 'Hardware supplies and fittings', homeOrder: 22 },
      { title: 'Plywood', slug: 'plywood', description: 'Plywood and wood materials', homeOrder: 23 },
    ];

    for (const catData of sopProductCategories) {
      const exists = await Category.findOne({ slug: catData.slug });
      if (!exists) {
        await Category.create({
          ...catData,
          categoryType: 'product',
          showOnHome: true,
          isPopular: true,
          status: SERVICE_STATUS.ACTIVE
        });
        console.log(`  ✅ Created product category: ${catData.title}`);
      } else {
        console.log(`  ⏭️  Product category already exists: ${catData.title}`);
      }
    }

    console.log('\n✅ Service & Product categories updated!\n');
  } catch (error) {
    console.error('❌ Error updating service categories:', error);
  }
};

// Run seeding
const runSeeding = async () => {
  await connectDB();
  await seedManpowerCategories();
  await updateServiceCategories();
  process.exit(0);
};

runSeeding();
