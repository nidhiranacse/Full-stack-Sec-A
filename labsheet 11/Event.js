const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: [
                "Workshop",
                "Hackathon",
                "Placement Drive",
                "Seminar",
                "Other"
            ],
            required: true
        },

        date: {
            type: Date,
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
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);