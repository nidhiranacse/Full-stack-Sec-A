const express = require("express");

const {
    createAnnouncement
} = require("../controllers/announcementController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createAnnouncement
);

module.exports = router;