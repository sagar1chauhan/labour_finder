const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Booking = require('./models/Booking');
    const booking = await Booking.findOne().sort({ createdAt: -1 }).lean();
    console.log(JSON.stringify({
      bookingNumber: booking.bookingNumber,
      serviceCategory: booking.serviceCategory,
      address: booking.address,
      status: booking.status,
      potentialVendors: booking.potentialVendors
    }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
