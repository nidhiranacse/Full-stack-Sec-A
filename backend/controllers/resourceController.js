const Resource = require("../models/Resource");

const uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF or DOCX file"
            });
        }

        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const resource = await Resource.create({
            title,
            description,
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            message: "Resource uploaded successfully",
            resource
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getResources = async (req, res) => {
    try {
        const resources = await Resource.find()
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(resources);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(
            req.params.id
        );

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json({
            message: "Resource deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    uploadResource,
    getResources,
    deleteResource
};