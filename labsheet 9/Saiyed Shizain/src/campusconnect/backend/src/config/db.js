const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusconnect";
  await mongoose.connect(uri);
  console.log("[db] connected to MongoDB");
}

module.exports = connectDB;
