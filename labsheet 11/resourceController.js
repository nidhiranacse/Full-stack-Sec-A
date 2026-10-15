const Resource = require("../models/Resource");
const fs = require("fs");

// =========================
// UPLOAD RESOURCE - ADMIN
// =========================

const uploadResource = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            semester,
            category
        } = req.body;

        if (
            !title ||
            !subject ||
            !semester ||
            !category
        ) {
            return res.status(400).json({
                message:
                    "Title, subject, semester and category are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF or DOCX file"
            });
        }

        const resource = await Resource.create({
            title,
            description,
            subject,
            semester,
            category,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            message: "Resource uploaded successfully",
            resource
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to upload resource",
            error: error.message
        });
    }
};


// =========================
// GET ALL RESOURCES
// =========================

const getResources = async (req, res) => {
    try {
        const {
            search,
            subject,
            semester,
            category,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // Search by title
        if (search) {
            query.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (subject) {
            query.subject = subject;
        }

        if (semester) {
            query.semester = semester;
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

        const totalResources =
            await Resource.countDocuments(query);

        res.status(200).json({
            totalResources,
            currentPage: Number(page),
            totalPages: Math.ceil(
                totalResources / limit
            ),
            resources
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resources",
            error: error.message
        });
    }
};


// =========================
// GET SINGLE RESOURCE
// =========================

const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(
            req.params.id
        ).populate("uploadedBy", "name email");

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json({
            resource
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resource",
            error: error.message
        });
    }
};


// =========================
// DOWNLOAD RESOURCE
// =========================

const downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(
            req.params.id
        );

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        if (!fs.existsSync(resource.filePath)) {
            return res.status(404).json({
                message: "File not found on server"
            });
        }

        res.download(
            resource.filePath,
            resource.fileName
        );

    } catch (error) {
        res.status(500).json({
            message: "Download failed",
            error: error.message
        });
    }
};


// =========================
// DELETE RESOURCE - ADMIN
// =========================

const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(
            req.params.id
        );

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        // Delete physical file
        if (fs.existsSync(resource.filePath)) {
            fs.unlinkSync(resource.filePath);
        }

        // Delete database record
        await resource.deleteOne();

        res.status(200).json({
            message: "Resource deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete resource",
            error: error.message
        });
    }
};


module.exports = {
    uploadResource,
    getResources,
    getResourceById,
    downloadResource,
    deleteResource
};