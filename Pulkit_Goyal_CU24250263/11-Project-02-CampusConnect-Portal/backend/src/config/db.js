const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✓ MongoDB Connected for CampusConnect: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`ℹ️ MongoDB offline; CampusConnect running in local memory mode.`);
  }
}

module.exports = connectDB;
