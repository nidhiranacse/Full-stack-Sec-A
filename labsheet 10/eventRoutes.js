const express = require("express");

const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEvents);

router.post("/", createEvent);

router.put("/:id", updateEvent);

router.delete("/:id", deleteEvent);

module.exports = router;