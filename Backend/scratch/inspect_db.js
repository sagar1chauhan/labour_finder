const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Collections:");
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (let col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(` - ${col.name}: ${count} docs`);
  }
  process.exit(0);
}
run();
