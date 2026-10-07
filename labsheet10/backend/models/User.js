const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  passwordHash: String,
  role: {
    type: String,
    enum: ["ADMIN", "STUDENT"],
    default: "STUDENT"
  }
});

module.exports = mongoose.model("User", userSchema);