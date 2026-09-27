const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize and append timestamp to prevent name collisions
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${cleanName}`);
    }
});

// File filter for allowed extensions (PDF, DOCX, DOC, PPT, PPTX, TXT)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".ppt", ".pptx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, DOCX, DOC, PPT, and TXT files are allowed."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25 MB max file size
    },
    fileFilter: fileFilter
});

module.exports = upload;
