const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Worker = require('../models/Worker');
const PlatformEarning = require('../models/PlatformEarning');

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

const seedTransactions = async () => {
  try {
    console.log('Starting transactions seeding...');

    // Clear existing standard transactions & platform earnings
    await Transaction.deleteMany({});
    await PlatformEarning.deleteMany({});
    console.log('Cleared existing transactions and platform earnings');

    // Fetch existing users, vendors, workers, and bookings
    const users = await User.find({});
    const vendors = await Vendor.find({});
    const workers = await Worker.find({});
    const bookings = await Booking.find({});

    if (bookings.length === 0) {
      console.log('No bookings found. Run bookings seeder first.');
      return;
    }

    const transactionsData = [];

    // Create 2 standard customer payments
    transactionsData.push({
      userId: users[0]?._id || null,
      bookingId: bookings[0]?._id || null,
      type: 'payment',
      amount: bookings[0]?.finalAmount || 500,
      status: 'completed',
      paymentMethod: 'razorpay',
      description: `Payment for booking ${bookings[0]?.bookingNumber || 'BK-01'}`,
      referenceId: 'pay_Njd892h8dsk2',
      balanceBefore: 0,
      balanceAfter: 0
    });

    transactionsData.push({
      userId: users[1]?._id || null,
      bookingId: bookings[1]?._id || null,
      type: 'payment',
      amount: bookings[1]?.finalAmount || 1200,
      status: 'completed',
      paymentMethod: 'razorpay',
      description: `Payment for booking ${bookings[1]?.bookingNumber || 'BK-02'}`,
      referenceId: 'pay_Hhs920skdi28',
      balanceBefore: 0,
      balanceAfter: 0
    });

    // Create commission entries
    transactionsData.push({
      vendorId: vendors[0]?._id || null,
      bookingId: bookings[0]?._id || null,
      type: 'commission',
      amount: 75, // 15% of 500
      status: 'completed',
      paymentMethod: 'system',
      description: `Commission charge for booking ${bookings[0]?.bookingNumber || 'BK-01'}`,
      referenceId: 'comm_Njd892h8dsk2',
      balanceBefore: 500,
      balanceAfter: 425
    });

    transactionsData.push({
      vendorId: vendors[0]?._id || null,
      bookingId: bookings[1]?._id || null,
      type: 'commission',
      amount: 180, // 15% of 1200
      status: 'completed',
      paymentMethod: 'system',
      description: `Commission charge for booking ${bookings[1]?.bookingNumber || 'BK-02'}`,
      referenceId: 'comm_Hhs920skdi28',
      balanceBefore: 1200,
      balanceAfter: 1020
    });

    // Create 2 worker earnings/payments
    transactionsData.push({
      workerId: workers[0]?._id || null,
      bookingId: bookings[0]?._id || null,
      type: 'worker_payment',
      amount: 350,
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Earnings credit for job ${bookings[0]?.bookingNumber || 'BK-01'}`,
      referenceId: 'wk_earning_01',
      balanceBefore: 0,
      balanceAfter: 350
    });

    transactionsData.push({
      workerId: workers[1]?._id || null,
      bookingId: bookings[1]?._id || null,
      type: 'worker_payment',
      amount: 900,
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Earnings credit for job ${bookings[1]?.bookingNumber || 'BK-02'}`,
      referenceId: 'wk_earning_02',
      balanceBefore: 0,
      balanceAfter: 900
    });

    // Create 2 credit deposits (wallet recharge)
    transactionsData.push({
      vendorId: vendors[0]?._id || null,
      type: 'credit',
      amount: 5000,
      status: 'completed',
      paymentMethod: 'razorpay',
      description: 'Wallet recharge via Razorpay',
      referenceId: 'wallet_topup_01',
      balanceBefore: 20000,
      balanceAfter: 25000
    });

    transactionsData.push({
      vendorId: vendors[1]?._id || null,
      type: 'credit',
      amount: 2500,
      status: 'completed',
      paymentMethod: 'razorpay',
      description: 'Wallet recharge via Razorpay',
      referenceId: 'wallet_topup_02',
      balanceBefore: 15500,
      balanceAfter: 18000
    });

    // Create 1 withdrawal debit
    transactionsData.push({
      vendorId: vendors[2]?._id || null,
      type: 'withdrawal',
      amount: 10000,
      status: 'completed',
      paymentMethod: 'bank_transfer',
      description: 'Wallet withdrawal to bank account',
      referenceId: 'withdraw_txn_01',
      balanceBefore: 42000,
      balanceAfter: 32000
    });

    // Save all transactions
    for (const txnData of transactionsData) {
      const transaction = new Transaction(txnData);
      await transaction.save();
    }
    console.log(`Successfully seeded ${transactionsData.length} payment transactions!`);

    // Create platform earning entries for the last 3 days
    const platformEarningsData = [
      {
        date: '2026-06-30',
        totalRevenue: 1500,
        totalBookings: 3,
        totalGST: 270,
        totalTDS: 15,
        platformCommission: 225,
        vendorEarnings: 1005,
        totalSettlementReceived: 1000,
        totalPendingSettlement: 500,
        totalAmountPaidToVendors: 800,
        totalPendingAmountToVendors: 205
      },
      {
        date: '2026-07-01',
        totalRevenue: 2400,
        totalBookings: 4,
        totalGST: 432,
        totalTDS: 24,
        platformCommission: 360,
        vendorEarnings: 1608,
        totalSettlementReceived: 1500,
        totalPendingSettlement: 600,
        totalAmountPaidToVendors: 1200,
        totalPendingAmountToVendors: 408
      },
      {
        date: '2026-07-02',
        totalRevenue: 1800,
        totalBookings: 3,
        totalGST: 324,
        totalTDS: 18,
        platformCommission: 270,
        vendorEarnings: 1206,
        totalSettlementReceived: 1200,
        totalPendingSettlement: 400,
        totalAmountPaidToVendors: 900,
        totalPendingAmountToVendors: 306
      }
    ];

    for (const earningData of platformEarningsData) {
      const platformEarning = new PlatformEarning(earningData);
      await platformEarning.save();
    }
    console.log(`Successfully seeded ${platformEarningsData.length} PlatformEarning records!`);
    console.log('Transactions & earnings seeding completed!');

  } catch (error) {
    console.error('Error seeding transactions:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
const runSeeding = async () => {
  await connectDB();
  await seedTransactions();
  process.exit(0);
};

runSeeding();
