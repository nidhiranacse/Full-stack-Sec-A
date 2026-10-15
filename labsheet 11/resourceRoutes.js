const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    uploadResource,
    getResources,
    getResourceById,
    downloadResource,
    deleteResource
} = require("../controllers/resourceController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// =========================
// MULTER CONFIGURATION
// =========================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


// Only PDF and DOCX
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only PDF and DOCX files are allowed"),
            false
        );
    }
};


const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


// =========================
// ROUTES
// =========================

// Get all resources
router.get("/", protect, getResources);

// Get single resource
router.get("/:id", protect, getResourceById);

// Download resource
router.get(
    "/:id/download",
    protect,
    downloadResource
);

// Admin upload
router.post(
    "/",
    protect,
    adminOnly,
    upload.single("file"),
    uploadResource
);

// Admin delete
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteResource
);


module.exports = router;