const Event = require("../models/Event");

// Create event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, venue, maxSeats } = req.body;

        if (!title || !description || !date || !venue || !maxSeats) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            venue,
            maxSeats,
            availableSeats: maxSeats,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Event created successfully",
            event
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate("createdBy", "name email")
            .sort({ date: 1 });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get one event
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Update event
const updateEvent = async (req, res) => {
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

        res.status(200).json({
            message: "Event updated successfully",
            event
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            message: "Event deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent
};