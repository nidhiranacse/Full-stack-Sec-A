const Resource = require("../models/Resource");

// Create resource - Admin
const createResource = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            semester,
            category,
            fileUrl,
            fileName
        } = req.body;

        if (
            !title ||
            !subject ||
            !semester ||
            !category ||
            !fileUrl ||
            !fileName
        ) {
            return res.status(400).json({
                success: false,
                message: "All required resource fields are needed"
            });
        }

        const resource = await Resource.create({
            title,
            description,
            subject,
            semester,
            category,
            fileUrl,
            fileName,
            uploadedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            resource
        });

    } catch (error) {
        console.error("Create resource error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating resource"
        });
    }
};


// Get resources
const getResources = async (req, res) => {
    try {
        const {
            subject,
            semester,
            category,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        if (subject) {
            query.subject = subject;
        }

        if (semester) {
            query.semester = Number(semester);
        }

        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const resources = await Resource.find(query)
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Resource.countDocuments(query);

        res.status(200).json({
            success: true,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            totalResources: total,
            resources
        });

    } catch (error) {
        console.error("Get resources error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching resources"
        });
    }
};


// Get single resource
const getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate("uploadedBy", "name email");

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            resource
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Invalid resource ID"
        });
    }
};


// Delete resource - Admin
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Delete resource error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting resource"
        });
    }
};


module.exports = {
    createResource,
    getResources,
    getResource,
    deleteResource
};