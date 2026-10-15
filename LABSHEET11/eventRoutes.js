const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// GET ALL EVENTS + SEARCH + FILTER
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message
    });
  }
});

// STUDENT MY EVENTS
// IMPORTANT: This must come BEFORE /:id
router.get("/my-events", auth, async (req, res) => {
  try {
    const events = await Event.find({
      registeredStudents: req.user.id
    }).sort({ date: 1 });

    res.json({
      totalRegistrations: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student dashboard",
      error: error.message
    });
  }
});

// ADMIN STATS
// IMPORTANT: This must come BEFORE /:id
router.get("/admin/stats", auth, admin, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const events = await Event.find();

    let totalRegistrations = 0;

    events.forEach(event => {
      totalRegistrations += event.registeredStudents.length;
    });

    res.json({
      totalEvents,
      totalRegistrations
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin statistics",
      error: error.message
    });
  }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch event",
      error: error.message
    });
  }
});

// CREATE EVENT - ADMIN
router.post("/", auth, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      category,
      venue,
      totalSeats
    } = req.body;

    if (!title || !description || !date || !category || !venue || !totalSeats) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      category,
      venue,
      totalSeats
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message
    });
  }
});

// UPDATE EVENT - ADMIN
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json({
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update event",
      error: error.message
    });
  }
});

// DELETE EVENT - ADMIN
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message
    });
  }
});

// REGISTER EVENT
router.post("/:id/register", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    if (event.registeredStudents.includes(req.user.id)) {
      return res.status(400).json({
        message: "Already registered for this event"
      });
    }

    if (event.registeredStudents.length >= event.totalSeats) {
      return res.status(400).json({
        message: "No seats available"
      });
    }

    event.registeredStudents.push(req.user.id);
    await event.save();

    res.json({
      message: "Event registration successful",
      availableSeats:
        event.totalSeats - event.registeredStudents.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// UNREGISTER EVENT
router.delete("/:id/register", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    event.registeredStudents =
      event.registeredStudents.filter(
        id => id.toString() !== req.user.id
      );

    await event.save();

    res.json({
      message: "Event unregistered successfully",
      availableSeats:
        event.totalSeats - event.registeredStudents.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Unregistration failed",
      error: error.message
    });
  }
});

module.exports = router;
