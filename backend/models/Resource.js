const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Resource title is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true
        },

        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: 1,
            max: 8
        },

        category: {
            type: String,
            enum: [
                "Notes",
                "Previous Year Paper",
                "Study Material",
                "Other"
            ],
            required: true
        },

        fileUrl: {
            type: String,
            required: [true, "File URL is required"]
        },

        fileName: {
            type: String,
            required: [true, "File name is required"]
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

resourceSchema.index({ subject: 1 });
resourceSchema.index({ semester: 1 });
resourceSchema.index({ category: 1 });

module.exports = mongoose.model("Resource", resourceSchema);