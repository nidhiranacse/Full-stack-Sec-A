const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent same student from registering twice
registrationSchema.index(
    { student: 1, event: 1 },
    { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);