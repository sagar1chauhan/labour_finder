require('dotenv').config();
const Razorpay = require('razorpay');

const test = async () => {
  try {
    console.log('Testing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await rzp.orders.create({
      amount: 100, // 1 INR in paise
      currency: 'INR',
      receipt: 'receipt_test_' + Date.now()
    });

    console.log('✅ Razorpay credentials are VALID!');
    console.log('Created order ID:', order.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Razorpay credentials are INVALID or order creation failed:');
    console.error(error.message || error);
    process.exit(1);
  }
};

test();
