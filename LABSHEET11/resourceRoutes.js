const express = require("express");
const multer = require("multer");
const Resource = require("../models/Resource");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// File storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and DOCX files are allowed"));
        }
    }
});


// GET all resources
router.get("/", async (req, res) => {
    try {
        const resources = await Resource.find()
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(resources);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resources",
            error: error.message
        });
    }
});


// UPLOAD resource - Admin only
router.post(
    "/",
    auth,
    admin,
    upload.single("file"),
    async (req, res) => {
        try {
            const { title, subject, semester } = req.body;

            if (!title || !subject || !semester || !req.file) {
                return res.status(400).json({
                    message: "Title, subject, semester and file are required"
                });
            }

            const resource = await Resource.create({
                title,
                subject,
                semester,
                fileName: req.file.originalname,
                filePath: req.file.path,
                uploadedBy: req.user.id
            });

            res.status(201).json({
                message: "Resource uploaded successfully",
                resource
            });

        } catch (error) {
            res.status(500).json({
                message: "Resource upload failed",
                error: error.message
            });
        }
    }
);


// DOWNLOAD resource
router.get("/:id/download", auth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.download(resource.filePath, resource.fileName);

    } catch (error) {
        res.status(500).json({
            message: "Download failed",
            error: error.message
        });
    }
});


// DELETE resource - Admin only
router.delete("/:id", auth, admin, async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Delete failed",
            error: error.message
        });
    }
});


module.exports = router;
