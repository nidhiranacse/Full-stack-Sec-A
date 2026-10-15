const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection error: ${error.message} (Running in standalone demo mode)`);
  }
}

module.exports = connectDB;
