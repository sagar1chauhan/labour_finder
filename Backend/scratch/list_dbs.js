const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const client = await mongoose.connect(process.env.MONGODB_URI);
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log("Databases:");
  for (let db of dbs.databases) {
    console.log(` - ${db.name}`);
  }
  process.exit(0);
}
run();
