const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        venue: {
            type: String,
            required: true
        },

        totalSeats: {
            type: Number,
            required: true,
            min: 1
        },

        registeredStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
