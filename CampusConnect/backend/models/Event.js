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
            required: [true, "Event description is required"],
            trim: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Workshop",
                "Hackathon",
                "Placement Drive",
                "Seminar",
                "Tech Talk",
                "Cultural",
                "Other"
            ],
            default: "Workshop"
        },
        date: {
            type: Date,
            required: [true, "Event date is required"]
        },
        time: {
            type: String,
            required: [true, "Event time is required"],
            trim: true
        },
        venue: {
            type: String,
            required: [true, "Event venue is required"],
            trim: true
        },
        totalSeats: {
            type: Number,
            required: [true, "Total seats is required"],
            min: [1, "Total seats must be at least 1"]
        },
        registeredStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual property to calculate available seats
eventSchema.virtual("availableSeats").get(function () {
    const registeredCount = this.registeredStudents ? this.registeredStudents.length : 0;
    return Math.max(0, this.totalSeats - registeredCount);
});

// Indexes for query optimization (Bonus challenge & performance)
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Event", eventSchema);
