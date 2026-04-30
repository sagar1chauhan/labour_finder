const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const SubscriptionPlan = require('./models/SubscriptionPlan');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const clearPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all subscription plans
    const result = await SubscriptionPlan.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} subscription plans.`);

    process.exit(0);
  } catch (error) {
    console.error('Error clearing plans:', error);
    process.exit(1);
  }
};

clearPlans();
