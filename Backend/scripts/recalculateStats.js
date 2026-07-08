const mongoose = require('mongoose');
const Worker = require('../models/Worker');
const Vendor = require('../models/Vendor');
const { updateWorkerStats, updateVendorStats } = require('../utils/vendorStatsHelper');

require('dotenv').config();

const run = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Homster';
    console.log('Connecting to database:', dbUri);
    await mongoose.connect(dbUri);
    console.log('Connected!');

    // 1. Recalculate stats for all workers
    const workers = await Worker.find({});
    console.log(`Found ${workers.length} workers in database.`);
    for (const worker of workers) {
      console.log(`Updating stats for worker: ${worker.name} (${worker._id})`);
      await updateWorkerStats(worker._id);
    }

    // 2. Recalculate stats for all vendors
    const vendors = await Vendor.find({});
    console.log(`Found ${vendors.length} vendors in database.`);
    for (const vendor of vendors) {
      console.log(`Updating stats for vendor: ${vendor.name} (${vendor._id})`);
      await updateVendorStats(vendor._id);
    }

    console.log('All stats recalculated and synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during recalculation:', error);
    process.exit(1);
  }
};

run();
