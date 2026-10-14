const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { listAnnouncements, createAnnouncement } = require("../controllers/announcementController");

const router = express.Router();

const announcementSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().max(5000).optional(),
});

router.get("/", authenticate, listAnnouncements);
router.post("/", authenticate, authorize("ADMIN"), validate({ body: announcementSchema }), createAnnouncement);

module.exports = router;
