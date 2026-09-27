const express = require("express");
const router = express.Router();
const {
    getResources,
    getResourceById,
    uploadResource,
    downloadResource,
    deleteResource
} = require("../controllers/resourceController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

// Public routes for viewing and downloading
router.get("/", getResources);
router.get("/:id", getResourceById);
router.get("/:id/download", downloadResource);

// Admin / Faculty upload and delete
router.post(
    "/",
    protect,
    authorize("admin"),
    upload.single("file"),
    uploadResource
);

router.delete("/:id", protect, authorize("admin"), deleteResource);

module.exports = router;
