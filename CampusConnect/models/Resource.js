const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    subject: String,

    semester: String,

    fileName: String,

    filePath: String
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);