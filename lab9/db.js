const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://anshul:anshul2024@portfolio-db.ajxkkzm.mongodb.net/");
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed:", error.message);
    }
};

module.exports = connectDB;



