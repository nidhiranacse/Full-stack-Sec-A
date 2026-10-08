const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01
    },
    category: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("MenuItem", menuItemSchema);