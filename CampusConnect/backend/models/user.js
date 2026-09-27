const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },
        department: {
            type: String,
            default: "Computer Science & Engineering"
        },
        semester: {
            type: Number,
            default: 6
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);