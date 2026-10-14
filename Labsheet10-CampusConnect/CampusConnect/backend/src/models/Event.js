const mongoose = require("mongoose");

// ============================================================
// EVENT SCHEMA
// ============================================================

const eventSchema = new mongoose.Schema(
    {
        // Event title
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Event description
        description: {
            type: String,
            required: true,
            trim: true
        },

        // Event date
        date: {
            type: Date,
            required: true
        },

        // Event location
        location: {
            type: String,
            required: true,
            trim: true
        },

        // User who created the event
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Students who RSVP'd
        attendees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);