require('dotenv').config();
const mongoose = require('mongoose');
const OfferBanner = require('../models/OfferBanner');
const cloudinaryService = require('../services/cloudinaryService');

async function testController() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    // We will use a mock request body simulating the frontend form submission
    const mockBody = {
      title: 'Test Offer Banner',
      link: '/services/ac-repair',
      priority: 1,
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    console.log('Step 1: Mock upload starting...');
    const uploadRes = await cloudinaryService.uploadFile(mockBody.image, { folder: 'banners/offers' });
    console.log('Upload response:', uploadRes);

    if (!uploadRes.success) {
      console.error('Upload failed with:', uploadRes.error);
      process.exit(1);
    }

    console.log('Step 2: Database document creation starting...');
    const banner = await OfferBanner.create({
      title: mockBody.title,
      link: mockBody.link,
      priority: mockBody.priority || 0,
      imageUrl: uploadRes.url
    });

    console.log('Step 3: Document created successfully!', banner);
    
    // Clean up test document
    await OfferBanner.deleteOne({ _id: banner._id });
    console.log('Test document cleaned up.');
    process.exit(0);
  } catch (error) {
    console.error('CONTROLLER EXCEPTION CAUGHT:', error);
    process.exit(1);
  }
}

testController();
