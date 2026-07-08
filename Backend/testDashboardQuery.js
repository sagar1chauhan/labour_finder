require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const Vendor = require('./models/Vendor');

const run = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected!');

    const vendors = await Vendor.find({}).select('name phone businessName').lean();
    console.log('All Vendors in DB:', JSON.stringify(vendors, null, 2));

    const bookings = await Booking.find({ status: { $ne: 'cancelled' } }).select('bookingNumber vendorId workerId status potentialVendors').lean();
    console.log('Active/Searching Bookings in DB:', JSON.stringify(bookings, null, 2));

    // Let's find Rajesh Kumar specifically
    const rajesh = vendors.find(v => v.name.includes('Rajesh Kumar'));
    if (!rajesh) {
      console.log('Rajesh Kumar not found in vendors list');
      process.exit(1);
    }

    const vId = rajesh._id;
    console.log('Running match test for vendor vId:', vId);

    const testMatch = await Booking.find({
      $or: [
        { vendorId: vId, status: { $ne: 'awaiting_payment' } },
        {
          vendorId: null,
          status: { $in: ['requested', 'searching'] },
          'potentialVendors.vendorId': vId
        }
      ]
    }).lean();

    console.log('Matched Bookings count:', testMatch.length);
    console.log('Matched Bookings:', JSON.stringify(testMatch, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
