const express = require("express");

const {
    createResource,
    getResources,
    getResource,
    deleteResource
} = require("../controllers/resourceController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Students and Admin can view resources
router.get("/", protect, getResources);

// View single resource
router.get("/:id", protect, getResource);

// Admin creates resource
router.post("/", protect, adminOnly, createResource);

// Admin deletes resource
router.delete("/:id", protect, adminOnly, deleteResource);

module.exports = router;