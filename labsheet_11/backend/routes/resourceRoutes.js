const express = require("express");

const {
    uploadResource,
    getResources,
    deleteResource
} = require("../controllers/resourceController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getResources);

router.post(
    "/",
    protect,
    adminOnly,
    upload.single("file"),
    uploadResource
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteResource
);

module.exports = router;