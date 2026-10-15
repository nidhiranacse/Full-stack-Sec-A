const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        semester: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Notes",
                "Previous Year Paper",
                "Assignment",
                "Study Material",
                "Other"
            ],
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        fileType: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resource", resourceSchema);