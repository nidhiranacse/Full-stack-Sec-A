const path = require("path");
const fs = require("fs");
const Resource = require("../models/Resource");

// @desc    Get resources with filtering, search, and pagination
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
    try {
        const { search, subject, semester, category, page = 1, limit = 10 } = req.query;

        const query = {};

        if (search && search.trim() !== "") {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { subject: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } }
            ];
        }

        if (subject && subject !== "All") {
            query.subject = { $regex: subject, $options: "i" };
        }

        if (semester && semester !== "All") {
            query.semester = Number(semester);
        }

        if (category && category !== "All") {
            query.category = category;
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const totalResources = await Resource.countDocuments(query);
        const resources = await Resource.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("uploadedBy", "name email");

        // Distinct subjects for easy filter dropdown
        const subjects = await Resource.distinct("subject");

        res.status(200).json({
            success: true,
            totalResources,
            totalPages: Math.ceil(totalResources / limitNum),
            currentPage: pageNum,
            count: resources.length,
            subjects,
            resources
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id).populate(
            "uploadedBy",
            "name email"
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found."
            });
        }

        res.status(200).json({
            success: true,
            resource
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (Admin only)
const uploadResource = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a file to upload (PDF, DOCX, DOC, PPT, TXT)."
            });
        }

        const { title, description, subject, semester, category } = req.body;

        if (!title || !subject || !semester) {
            // Delete uploaded file if metadata validation fails
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Please provide title, subject, and semester."
            });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();

        const resource = await Resource.create({
            title,
            description: description || "",
            subject,
            semester: Number(semester),
            category: category || "Notes",
            fileName: req.file.filename,
            filePath: req.file.path,
            fileType: ext.replace(".", "") || "file",
            fileSize: req.file.size,
            uploadedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Resource uploaded successfully!",
            resource
        });
    } catch (error) {
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Download resource file
// @route   GET /api/resources/:id/download
// @access  Public / Private
const downloadResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found."
            });
        }

        const filePath = path.resolve(resource.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found on server storage."
            });
        }

        // Send file for download with original filename
        res.download(filePath, resource.fileName);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin only)
const deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found."
            });
        }

        // Delete physical file from uploads folder
        if (resource.filePath && fs.existsSync(resource.filePath)) {
            fs.unlinkSync(resource.filePath);
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Resource deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getResources,
    getResourceById,
    uploadResource,
    downloadResource,
    deleteResource
};
