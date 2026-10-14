const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { cacheEvents, invalidateEventsCache } = require("../middleware/cache");
const { listEvents, createEvent, rsvpEvent } = require("../controllers/eventController");

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  date: z.string().min(1, "Date is required"),
  venue: z.string().max(200).optional(),
});

// Completed vs Lab 9: GET is now cached; mutations invalidate the cache.
router.get("/", authenticate, cacheEvents, listEvents);
router.post("/", authenticate, authorize("ADMIN"), validate({ body: eventSchema }), async (req, res, next) => {
  try {
    await createEvent(req, res);
    await invalidateEventsCache();
  } catch (err) {
    next(err);
  }
});
router.post("/:id/rsvp", authenticate, authorize("ADMIN", "STUDENT"), async (req, res, next) => {
  try {
    await rsvpEvent(req, res);
    if (res.statusCode === 200) {
      await invalidateEventsCache();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
