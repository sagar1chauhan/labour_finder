const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');

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

const seedNotifications = async () => {
  try {
    console.log('Starting notifications seeding...');

    // Get any admin
    const admin = await Admin.findOne({});
    if (!admin) {
      console.log('No admin found. Cannot seed admin notifications.');
      return;
    }

    const bookings = await Booking.find({});

    // Clear existing admin notifications
    await Notification.deleteMany({ adminId: admin._id });
    console.log('Cleared existing admin notifications');

    const sampleNotifications = [
      {
        adminId: admin._id,
        title: 'New Booking Received',
        message: bookings[0] 
          ? `Booking #${bookings[0].bookingNumber} has been placed by John Doe`
          : 'Booking #BK-123456-1 has been placed by John Doe',
        type: 'booking_created',
        relatedId: bookings[0]?._id || null,
        relatedType: 'booking',
        isRead: false
      },
      {
        adminId: admin._id,
        title: 'Booking Cancelled',
        message: bookings[1]
          ? `Booking #${bookings[1].bookingNumber} has been cancelled by customer`
          : 'Booking #BK-123456-2 has been cancelled by customer',
        type: 'booking_cancelled',
        relatedId: bookings[1]?._id || null,
        relatedType: 'booking',
        isRead: false
      },
      {
        adminId: admin._id,
        title: 'Payment Failed',
        message: bookings[2]
          ? `Payment for Booking #${bookings[2].bookingNumber} has failed`
          : 'Payment for Booking #BK-123456-3 has failed',
        type: 'payment_failed',
        relatedId: bookings[2]?._id || null,
        relatedType: 'booking',
        isRead: false
      }
    ];

    for (const notifData of sampleNotifications) {
      const notification = new Notification(notifData);
      await notification.save();
    }

    console.log(`Successfully seeded ${sampleNotifications.length} notifications for admin: ${admin.email}`);
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
const runSeeding = async () => {
  await connectDB();
  await seedNotifications();
  process.exit(0);
};

runSeeding();
