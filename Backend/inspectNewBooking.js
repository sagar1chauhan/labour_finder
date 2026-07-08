require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');

const run = async () => {
  try {
    await connectDB();
    const booking = await Booking.findOne({ bookingNumber: 'BK1782994528607JHORD' }).lean();
    console.log('Booking BK1782994528607JHORD details:', JSON.stringify(booking, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
