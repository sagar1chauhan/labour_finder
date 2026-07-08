const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const Worker = require('../models/Worker');
const User = require('../models/User');
const UserService = require('../models/UserService');
const Category = require('../models/Category');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../utils/constants');

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

const seedVendorBookings = async () => {
  try {
    console.log('Starting vendor bookings seeding...');

    // 1. Get existing vendors, workers
    const vendors = await Vendor.find({ approvalStatus: 'approved' });
    const workers = await Worker.find({});
    const electricityCategory = await Category.findOne({ title: 'Electricity' });

    if (vendors.length === 0) {
      console.log('No approved vendors found. Run vendor seeding first.');
      return;
    }

    // 2. Create or find Category & dummy UserService
    let catId;
    if (electricityCategory) {
      catId = electricityCategory._id;
    } else {
      const newCat = new Category({
        title: 'Electricity',
        slug: 'electricity',
        description: 'Electrical services',
        isActive: true
      });
      await newCat.save();
      catId = newCat._id;
    }

    let dummyService = await UserService.findOne({ title: 'Ceiling Fan Repair' });
    if (!dummyService) {
      dummyService = new UserService({
        categoryId: catId,
        title: 'Ceiling Fan Repair',
        basePrice: 500,
        gstPercentage: 18,
        status: 'active',
        description: 'Repair and installation of ceiling fans'
      });
      await dummyService.save();
      console.log('Created dummy UserService for bookings');
    }

    // 3. Create sample users for bookings
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543220',
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '9876543221',
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '9876543222',
        isPhoneVerified: true,
        isEmailVerified: true
      }
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ phone: userData.phone });
      if (!user) {
        user = new User(userData);
        await user.save();
      }
      createdUsers.push(user);
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Create sample bookings for each vendor
    const bookingsData = [];

    // Bookings for Rajesh Kumar
    const rajesh = vendors.find(v => v.name === 'Rajesh Kumar');
    if (rajesh) {
      const rajeshWorkers = workers.filter(w => w.vendorId && w.vendorId.toString() === rajesh._id.toString());

      bookingsData.push(
        {
          bookingNumber: `BK-${Date.now()}-1`,
          userId: createdUsers[0]._id,
          vendorId: rajesh._id,
          serviceId: dummyService._id,
          workerId: rajeshWorkers[0]?._id || null,
          serviceName: 'Ceiling Fan Repair',
          serviceCategory: 'Electricity',
          basePrice: 500,
          finalAmount: 500,
          scheduledDate: new Date(),
          scheduledTime: '14:00 - 16:00',
          timeSlot: { start: '14:00', end: '16:00' },
          status: BOOKING_STATUS.COMPLETED,
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          address: {
            addressLine1: '456 Park Avenue',
            city: 'Indore',
            state: 'Madhya Pradesh',
            pincode: '452001'
          },
          description: 'Fan is not working properly, needs repair',
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          bookingNumber: `BK-${Date.now()}-2`,
          userId: createdUsers[1]._id,
          vendorId: rajesh._id,
          serviceId: dummyService._id,
          workerId: rajeshWorkers[1]?._id || null,
          serviceName: 'Ceiling Fan Repair',
          serviceCategory: 'Electricity',
          basePrice: 1200,
          finalAmount: 1200,
          scheduledDate: new Date(),
          scheduledTime: '10:00 - 12:00',
          timeSlot: { start: '10:00', end: '12:00' },
          status: BOOKING_STATUS.IN_PROGRESS,
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          address: {
            addressLine1: '789 MG Road',
            city: 'Indore',
            state: 'Madhya Pradesh',
            pincode: '452002'
          },
          description: 'AC not cooling properly'
        },
        {
          bookingNumber: `BK-${Date.now()}-3`,
          userId: createdUsers[2]._id,
          vendorId: rajesh._id,
          serviceId: dummyService._id,
          serviceName: 'Ceiling Fan Repair',
          serviceCategory: 'Electricity',
          basePrice: 800,
          finalAmount: 800,
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          scheduledTime: '11:00 - 13:00',
          timeSlot: { start: '11:00', end: '13:00' },
          status: BOOKING_STATUS.ACCEPTED,
          paymentStatus: PAYMENT_STATUS.PENDING,
          address: {
            addressLine1: '321 Station Road',
            city: 'Indore',
            state: 'Madhya Pradesh',
            pincode: '452003'
          },
          description: 'Leakage in bathroom tap'
        }
      );
    }

    // Bookings for Amit Sharma
    const amit = vendors.find(v => v.name === 'Amit Sharma');
    if (amit) {
      const amitWorkers = workers.filter(w => w.vendorId && w.vendorId.toString() === amit._id.toString());

      bookingsData.push(
        {
          bookingNumber: `BK-${Date.now()}-4`,
          userId: createdUsers[0]._id,
          vendorId: amit._id,
          serviceId: dummyService._id,
          workerId: amitWorkers[0]?._id || null,
          serviceName: 'Ceiling Fan Repair',
          serviceCategory: 'Electricity',
          basePrice: 600,
          finalAmount: 600,
          scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          scheduledTime: '09:00 - 11:00',
          timeSlot: { start: '09:00', end: '11:00' },
          status: BOOKING_STATUS.COMPLETED,
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          address: {
            addressLine1: '555 New Colony',
            city: 'Indore',
            state: 'Madhya Pradesh',
            pincode: '452004'
          },
          description: 'Electrical wiring repair needed',
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      );
    }

    // Create bookings
    for (const bookingData of bookingsData) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(`Created booking: ${booking.bookingNumber} with status: ${booking.status}`);
    }

    console.log(`Seeded ${bookingsData.length} bookings successfully!`);
    console.log('Vendor bookings seeding completed!');

  } catch (error) {
    console.error('Error seeding vendor bookings:', error);
  }
};

// Run the seeding
const runSeeding = async () => {
  await connectDB();
  await seedVendorBookings();
  process.exit(0);
};

runSeeding();
