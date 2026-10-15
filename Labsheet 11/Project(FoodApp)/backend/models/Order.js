const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"]
    },
    address: {
        type: String,
        required: [true, "Delivery address is required"],
        trim: true
    },
    items: {
        type: [
            {
                itemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MenuItem",
                    required: true
                },
                name: { type: String, required: true },
                price: { type: Number, required: true, min: 0.01 },
                qty: { type: Number, required: true, min: 1, validate: Number.isInteger }
            }
        ],
        validate: [
            {
                validator: items => items.length >= 1,
                message: "An order must contain at least one item"
            }
        ]
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0.01
    },
    status: {
        type: String,
        enum: ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
        default: "Placed"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);