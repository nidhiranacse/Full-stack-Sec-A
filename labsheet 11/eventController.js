const Event = require("../models/Event");

// =========================
// CREATE EVENT - ADMIN
// =========================

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            venue,
            totalSeats
        } = req.body;

        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !venue ||
            !totalSeats
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const event = await Event.create({
            title,
            description,
            category,
            date,
            venue,
            totalSeats,
            createdBy: req.user.id
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
};


// =========================
// GET ALL EVENTS
// =========================

const getEvents = async (req, res) => {
    try {
        const {
            search,
            category,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // Search by event title
        if (search) {
            query.title = {
                $regex: search,
                $options: "i"
            };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const events = await Event.find(query)
            .populate("createdBy", "name email")
            .sort({ date: 1 })
            .skip(skip)
            .limit(Number(limit));

        const totalEvents = await Event.countDocuments(query);

        const eventsWithSeats = events.map((event) => ({
            ...event.toObject(),

            availableSeats:
                event.totalSeats -
                event.registeredStudents.length
        }));

        res.status(200).json({
            totalEvents,
            currentPage: Number(page),
            totalPages: Math.ceil(totalEvents / limit),
            events: eventsWithSeats
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });
    }
};


// =========================
// GET SINGLE EVENT
// =========================

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("registeredStudents", "name email");

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            event: {
                ...event.toObject(),
                availableSeats:
                    event.totalSeats -
                    event.registeredStudents.length
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch event",
            error: error.message
        });
    }
};


// =========================
// UPDATE EVENT - ADMIN
// =========================

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const {
            title,
            description,
            category,
            date,
            venue,
            totalSeats
        } = req.body;

        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.date = date || event.date;
        event.venue = venue || event.venue;
        event.totalSeats = totalSeats || event.totalSeats;

        if (event.totalSeats < event.registeredStudents.length) {
            return res.status(400).json({
                message:
                    "Total seats cannot be less than registered students"
            });
        }

        await event.save();

        res.status(200).json({
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update event",
            error: error.message
        });
    }
};


// =========================
// DELETE EVENT - ADMIN
// =========================

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        await event.deleteOne();

        res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });
    }
};


// =========================
// REGISTER FOR EVENT
// =========================

const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        // Already registered
        if (
            event.registeredStudents.includes(req.user.id)
        ) {
            return res.status(400).json({
                message: "Already registered for this event"
            });
        }

        // Check seats
        if (
            event.registeredStudents.length >=
            event.totalSeats
        ) {
            return res.status(400).json({
                message: "No seats available"
            });
        }

        event.registeredStudents.push(req.user.id);

        await event.save();

        res.status(200).json({
            message: "Successfully registered for event",
            availableSeats:
                event.totalSeats -
                event.registeredStudents.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Event registration failed",
            error: error.message
        });
    }
};


// =========================
// UNREGISTER FROM EVENT
// =========================

const unregisterFromEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const isRegistered =
            event.registeredStudents.some(
                (studentId) =>
                    studentId.toString() === req.user.id
            );

        if (!isRegistered) {
            return res.status(400).json({
                message: "You are not registered for this event"
            });
        }

        event.registeredStudents =
            event.registeredStudents.filter(
                (studentId) =>
                    studentId.toString() !== req.user.id
            );

        await event.save();

        res.status(200).json({
            message: "Successfully unregistered from event"
        });

    } catch (error) {
        res.status(500).json({
            message: "Unregistration failed",
            error: error.message
        });
    }
};


module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
};