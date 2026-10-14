const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { listEvents, createEvent, rsvpEvent } = require("../controllers/eventController");

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  date: z.string().min(1, "Date is required"),
  venue: z.string().max(200).optional(),
});

router.get("/", authenticate, listEvents);
router.post("/", authenticate, authorize("ADMIN"), validate({ body: eventSchema }), createEvent);
router.post("/:id/rsvp", authenticate, authorize("ADMIN", "STUDENT"), rsvpEvent);

module.exports = router;
