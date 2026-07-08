const mongoose = require('mongoose');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const UserService = require('../models/UserService');
const { SERVICE_STATUS } = require('../utils/constants');

require('dotenv').config();

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

const seedProducts = async () => {
  try {
    console.log('🚀 Starting Products seeding...\n');

    // Get the product categories
    const categories = {
      toolShop: await Category.findOne({ slug: 'tool-shop' }),
      traders: await Category.findOne({ slug: 'traders' }),
      hardware: await Category.findOne({ slug: 'hardware' }),
      plywood: await Category.findOne({ slug: 'plywood' }),
    };

    // Verify categories exist
    for (const [key, value] of Object.entries(categories)) {
      if (!value) {
        console.error(`❌ Category not found: ${key}. Run seedManpowerCategories.js first.`);
        return;
      }
    }

    // Clean up existing brands and products for these categories to prevent duplicates
    const catIds = Object.values(categories).map(c => c._id);
    const existingBrands = await Brand.find({ categoryId: { $in: catIds } });
    const brandIds = existingBrands.map(b => b._id);
    
    await UserService.deleteMany({ brandId: { $in: brandIds } });
    await Brand.deleteMany({ categoryId: { $in: catIds } });
    console.log('🗑️  Cleared existing brands and products for SOP categories');

    // 1. Tool Shop Brands and Products
    const toolBrands = [
      {
        title: 'Bosch Power Tools',
        slug: 'bosch-power-tools',
        categoryId: categories.toolShop._id,
        categoryIds: [categories.toolShop._id],
        iconUrl: 'https://1000logos.net/wp-content/uploads/2017/01/Bosch-Logo.png',
        type: 'product',
        products: [
          { title: 'Bosch GSB 500 RE Impact Drill', basePrice: 3200, discountPrice: 2850, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3602/3602072.png', description: '500W dual mode impact drill machine' },
          { title: 'Bosch Angle Grinder GWS 600', basePrice: 2400, discountPrice: 1999, iconUrl: 'https://cdn-icons-png.flaticon.com/512/2271/2271113.png', description: '670W handy and compact angle grinder' }
        ]
      },
      {
        title: 'DeWalt Tools',
        slug: 'dewalt-tools',
        categoryId: categories.toolShop._id,
        categoryIds: [categories.toolShop._id],
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/DeWalt_logo.svg',
        type: 'product',
        products: [
          { title: 'DeWalt Cordless Drill Driver', basePrice: 7500, discountPrice: 6800, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3602/3602072.png', description: '10.8V XR Li-Ion drill driver' },
          { title: 'DeWalt Claw Hammer (20oz)', basePrice: 950, discountPrice: 850, iconUrl: 'https://cdn-icons-png.flaticon.com/512/2507/2507663.png', description: 'High-strength steel curved claw hammer' }
        ]
      }
    ];

    // 2. Traders Brands and Products (Cement, Plaster, Tiling)
    const traderBrands = [
      {
        title: 'UltraTech Cement',
        slug: 'ultratech-cement',
        categoryId: categories.traders._id,
        categoryIds: [categories.traders._id],
        iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
        type: 'product',
        products: [
          { title: 'UltraTech PPC Cement (50 kg)', basePrice: 420, discountPrice: 385, iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png', description: 'Premium grade Portland Pozzolana Cement' },
          { title: 'UltraTech Super Cement (50 kg)', basePrice: 450, discountPrice: 410, iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png', description: 'High strength cement for critical structures' }
        ]
      },
      {
        title: 'Birla White',
        slug: 'birla-white',
        categoryId: categories.traders._id,
        categoryIds: [categories.traders._id],
        iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
        type: 'product',
        products: [
          { title: 'Birla White Cement (50 kg)', basePrice: 1250, discountPrice: 1155, iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png', description: 'High brightness white Portland cement' },
          { title: 'Birla White WallCare Putty (40 kg)', basePrice: 950, discountPrice: 880, iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png', description: 'Water resistant wall putty for smooth finishes' }
        ]
      }
    ];

    // 3. Hardware Brands and Products
    const hardwareBrands = [
      {
        title: 'Godrej Locks',
        slug: 'godrej-locks',
        categoryId: categories.hardware._id,
        categoryIds: [categories.hardware._id],
        iconUrl: 'https://seeklogo.com/images/G/godrej-logo-C2DD51D569-seeklogo.com.png',
        type: 'product',
        products: [
          { title: 'Godrej Sherlock Padlock (70mm)', basePrice: 650, discountPrice: 580, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3468/3468087.png', description: 'Hardened steel shackle padlock with 3 keys' },
          { title: 'Godrej Ultra Vertibolt Lock', basePrice: 1800, discountPrice: 1550, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3468/3468087.png', description: 'Premium door lock with vertical locking bolt' }
        ]
      },
      {
        title: 'Hardware Fittings',
        slug: 'hardware-fittings',
        categoryId: categories.hardware._id,
        categoryIds: [categories.hardware._id],
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3468/3468087.png',
        type: 'product',
        products: [
          { title: 'Stainless Steel Door Hinges (4 inch)', basePrice: 120, discountPrice: 95, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3468/3468087.png', description: 'Heavy duty SS hinges, pack of 2' },
          { title: 'Brass Tower Bolt (6 inch)', basePrice: 220, discountPrice: 180, iconUrl: 'https://cdn-icons-png.flaticon.com/512/3468/3468087.png', description: 'Solid brass tower bolt for premium doors' }
        ]
      }
    ];

    // 4. Plywood Brands and Products
    const plywoodBrands = [
      {
        title: 'CenturyPly',
        slug: 'centuryply',
        categoryId: categories.plywood._id,
        categoryIds: [categories.plywood._id],
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106367.png',
        type: 'product',
        products: [
          { title: 'Century Plywood MR Grade (18mm, 8x4 feet)', basePrice: 3800, discountPrice: 3500, iconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106367.png', description: 'Commercial MR grade moisture resistant plywood' },
          { title: 'Century Plywood BWR Grade (19mm, 8x4 feet)', basePrice: 4800, discountPrice: 4400, iconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106367.png', description: 'Boiling water resistant marine grade plywood' }
        ]
      },
      {
        title: 'Greenply',
        slug: 'greenply',
        categoryId: categories.plywood._id,
        categoryIds: [categories.plywood._id],
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106367.png',
        type: 'product',
        products: [
          { title: 'Green Gold Plywood (18mm, 8x4 feet)', basePrice: 4100, discountPrice: 3800, iconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106367.png', description: 'Eco-friendly premium BWR grade plywood' }
        ]
      }
    ];

    const allBrands = [...toolBrands, ...traderBrands, ...hardwareBrands, ...plywoodBrands];

    for (const brandData of allBrands) {
      // Create and save Brand
      const brand = new Brand({
        title: brandData.title,
        slug: brandData.slug,
        categoryId: brandData.categoryId,
        categoryIds: brandData.categoryIds,
        iconUrl: brandData.iconUrl,
        type: brandData.type,
        status: SERVICE_STATUS.ACTIVE
      });
      await brand.save();
      console.log(`  ✅ Created Brand: ${brand.title}`);

      // Create products (UserServices) under this Brand
      for (const prodData of brandData.products) {
        const product = new UserService({
          brandId: brand._id,
          categoryId: brandData.categoryId,
          title: prodData.title,
          iconUrl: prodData.iconUrl,
          basePrice: prodData.basePrice,
          discountPrice: prodData.discountPrice,
          gstPercentage: 18,
          status: SERVICE_STATUS.ACTIVE,
          description: prodData.description,
          type: 'product'
        });
        await product.save();
        console.log(`     📦 Created Product: ${product.title}`);
      }
    }

    console.log('\n🎉 Successfully seeded all SOP Brands and Products!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};

const runSeeding = async () => {
  await connectDB();
  await seedProducts();
  process.exit(0);
};

runSeeding();
