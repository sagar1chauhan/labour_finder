const mongoose = require('mongoose');
require('dotenv').config();

const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const City = require('../models/City');
const SubscriptionPlan = require('../models/SubscriptionPlan');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    // 1. Ensure a default city exists
    console.log('Ensuring default city exists...');
    const city = await City.ensureDefaultCity();
    console.log(`Default City: ${city.name} (${city._id})`);

    // 2. Ensure a subscription plan exists
    console.log('Ensuring subscription plan exists...');
    let plan = await SubscriptionPlan.findOne({ name: 'Premium Plan' });
    if (!plan) {
      plan = await SubscriptionPlan.create({
        name: 'Premium Plan',
        price: 999,
        duration: 30,
        description: 'Premium partner subscription plan',
        features: ['Unlimited Bookings', 'Direct Customer Contact', 'Featured Listing'],
        isActive: true
      });
    }
    console.log(`Subscription Plan: ${plan.name} (${plan._id})`);

    // 3. Clear existing vendor with this phone if exists
    const targetPhone = '8817921168';
    console.log(`Checking for existing vendor with phone ${targetPhone}...`);
    await Vendor.deleteOne({ phone: targetPhone });

    // 4. Create Approved Vendor with active subscription
    console.log('Creating approved vendor account...');
    const vendor = await Vendor.create({
      name: 'Harsh Pandey',
      email: 'harshpandey0911@gmail.com',
      phone: targetPhone,
      role: 'vendor',
      businessName: 'Pandey Service Agency',
      experience: 5,
      categories: ['Cement & Plaster', 'Cements & Plasters', 'Electrician', 'Cleaning'],
      approvalStatus: 'approved',
      isPhoneVerified: true,
      isEmailVerified: true,
      isSubscriptionActive: true,
      subscription: {
        planId: plan._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
        status: 'active'
      },
      aadhar: {
        number: '123456789012',
        document: 'https://res.cloudinary.com/deorxby43/image/upload/v1/dummy_aadhar_front',
        backDocument: 'https://res.cloudinary.com/deorxby43/image/upload/v1/dummy_aadhar_back'
      },
      pan: {
        number: 'ABCDE1234F',
        document: 'https://res.cloudinary.com/deorxby43/image/upload/v1/dummy_pan'
      },
      address: {
        fullAddress: '123, Central Plaza, Scheme 54, Indore, MP',
        addressLine1: '123, Central Plaza',
        addressLine2: 'Scheme 54',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452010',
        lat: 22.7196,
        lng: 75.8577
      },
      isOnline: true,
      availability: 'AVAILABLE'
    });
    console.log(`Vendor account created successfully: ${vendor.name} (${vendor._id})`);

    // 5. Seed standard categories
    console.log('Seeding standard and vendor categories...');
    // We clear existing categories to prevent slug duplicate keys and have a clean slate
    await Category.deleteMany({});

    const categoriesToSeed = [
      {
        title: 'Cement & Plaster',
        categoryType: 'service',
        homeIconUrl: '🧱',
        homeBadge: 'Best Seller',
        hasSaleBadge: true,
        showOnHome: true,
        homeOrder: 1,
        cityIds: [city._id],
        description: 'Top-quality cement laying and wall plastering services.',
        imageUrl: 'https://img.freepik.com/free-photo/construction-worker-plastering-brick-wall_23-2148748958.jpg',
        status: 'active',
        vendorId: vendor._id
      },
      {
        title: 'Cements & Plasters',
        categoryType: 'service',
        homeIconUrl: '🏗️',
        homeBadge: 'Trending',
        hasSaleBadge: false,
        showOnHome: true,
        homeOrder: 2,
        cityIds: [city._id],
        description: 'Bulk supply and construction support for cements.',
        imageUrl: 'https://img.freepik.com/free-photo/mason-builder-plastering-concrete-wall_23-2149174542.jpg',
        status: 'active',
        vendorId: vendor._id
      },
      {
        title: 'Electrician',
        categoryType: 'service',
        homeIconUrl: '⚡',
        homeBadge: 'Fast Service',
        hasSaleBadge: true,
        showOnHome: true,
        homeOrder: 3,
        cityIds: [city._id],
        description: 'Expert residential and commercial electrical repair.',
        imageUrl: 'https://img.freepik.com/free-photo/electrician-working-house_23-2148404281.jpg',
        status: 'active',
        vendorId: null // Global category
      },
      {
        title: 'Cleaning',
        categoryType: 'service',
        homeIconUrl: '🧹',
        homeBadge: 'Popular',
        hasSaleBadge: false,
        showOnHome: true,
        homeOrder: 4,
        cityIds: [city._id],
        description: 'Deep house cleaning and housekeeping services.',
        imageUrl: 'https://img.freepik.com/free-photo/woman-cleaning-house_23-2148222320.jpg',
        status: 'active',
        vendorId: null // Global category
      },
      {
        title: 'House keeping',
        categoryType: 'service',
        homeIconUrl: '🧼',
        homeBadge: '',
        hasSaleBadge: false,
        showOnHome: true,
        homeOrder: 5,
        cityIds: [city._id],
        description: 'Daily housekeeping and sanitization support.',
        imageUrl: 'https://img.freepik.com/free-photo/housekeeper-servicing-hotel-room_23-2148095282.jpg',
        status: 'active',
        vendorId: null // Global category
      },
      {
        title: 'Mechanic',
        categoryType: 'service',
        homeIconUrl: '🔧',
        homeBadge: '',
        hasSaleBadge: false,
        showOnHome: true,
        homeOrder: 6,
        cityIds: [city._id],
        description: 'Vehicle inspection and mechanical repairs.',
        imageUrl: 'https://img.freepik.com/free-photo/mechanic-repairing-car-engine_23-2148332152.jpg',
        status: 'active',
        vendorId: null // Global category
      },
      {
        title: 'Grocery',
        categoryType: 'product',
        homeIconUrl: '🛒',
        homeBadge: '20% OFF',
        hasSaleBadge: true,
        showOnHome: true,
        homeOrder: 7,
        cityIds: [city._id],
        description: 'Daily essential groceries delivered to your home.',
        imageUrl: 'https://img.freepik.com/free-photo/woman-shopping-grocery-store_23-2148882582.jpg',
        status: 'active',
        vendorId: null // Global category
      }
    ];

    for (let catData of categoriesToSeed) {
      await Category.create(catData);
      console.log(`Seeded category: ${catData.title}`);
    }

    console.log('\n--- Seeding Completed Successfully ---');
    console.log(`Use phone number "${targetPhone}" to log in as vendor.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
