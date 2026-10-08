const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Event description is required"]
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
            required: [true, "Event date is required"]
        },

        location: {
            type: String,
            required: [true, "Event location is required"]
        },

        totalSeats: {
            type: Number,
            required: [true, "Total seats are required"],
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

eventSchema.index({ title: "text" });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model("Event", eventSchema);