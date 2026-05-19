require('dotenv').config(); // Load env first!
const { uploadFile } = require('../services/cloudinaryService');

async function run() {
  const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  console.log("Attempting test upload to Cloudinary...");
  const res = await uploadFile(dummyBase64, { folder: 'test' });
  console.log("Upload response:", res);
  process.exit(0);
}
run();
