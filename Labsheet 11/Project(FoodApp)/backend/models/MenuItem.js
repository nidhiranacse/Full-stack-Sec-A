const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Item price is required"],
            min: [0.01, "Price must be greater than zero"]
        },
        category: {
            type: String,
            trim: true,
            default: "Other"
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);