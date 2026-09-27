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
            trim: true,
            default: ""
        },
        subject: {
            type: String,
            required: [true, "Subject name is required"],
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
            required: [true, "Resource category is required"],
            enum: [
                "Notes",
                "Previous Year Papers",
                "Syllabus",
                "Lab Manual",
                "Assignment",
                "Reference Material"
            ],
            default: "Notes"
        },
        fileName: {
            type: String,
            required: [true, "File name is required"]
        },
        filePath: {
            type: String,
            required: [true, "File path is required"]
        },
        fileType: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number,
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

// Indexes for fast filtering by subject, semester, and category
resourceSchema.index({ subject: 1, semester: 1 });
resourceSchema.index({ category: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
