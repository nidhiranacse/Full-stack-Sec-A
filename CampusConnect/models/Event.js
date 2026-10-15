const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String,

    date: {
        type: Date,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    venue: String,

    seats: {
        type: Number,
        required: true
    },

    registeredSeats: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);