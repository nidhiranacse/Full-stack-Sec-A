const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        match: /^\d{10}$/
    },
    address: {
        type: String,
        required: true
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            qty: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: [
            "Placed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ],
        default: "Placed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);