const Event = require("../models/Event");

// @desc    Get all events with search, filter, and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
    try {
        const { search, category, filter, page = 1, limit = 9 } = req.query;

        const query = {};

        // Search by keyword in title or description
        if (search && search.trim() !== "") {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
                { venue: { $regex: search.trim(), $options: "i" } }
            ];
        }

        // Filter by category
        if (category && category !== "All") {
            query.category = category;
        }

        // Filter by date (upcoming vs past)
        const now = new Date();
        if (filter === "upcoming") {
            query.date = { $gte: now.setHours(0, 0, 0, 0) };
        } else if (filter === "past") {
            query.date = { $lt: now.setHours(0, 0, 0, 0) };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 9;
        const skip = (pageNum - 1) * limitNum;

        const totalEvents = await Event.countDocuments(query);
        const events = await Event.find(query)
            .sort({ date: 1 })
            .skip(skip)
            .limit(limitNum)
            .populate("createdBy", "name email");

        res.status(200).json({
            success: true,
            totalEvents,
            totalPages: Math.ceil(totalEvents / limitNum),
            currentPage: pageNum,
            count: events.length,
            events
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        res.status(200).json({
            success: true,
            event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
const createEvent = async (req, res, next) => {
    try {
        const { title, description, category, date, time, venue, totalSeats } = req.body;

        if (!title || !description || !date || !time || !venue || !totalSeats) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required event details."
            });
        }

        const event = await Event.create({
            title,
            description,
            category: category || "Workshop",
            date,
            time,
            venue,
            totalSeats: Number(totalSeats),
            registeredStudents: [],
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully!",
            event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        const { title, description, category, date, time, venue, totalSeats } = req.body;

        // If reducing totalSeats, ensure it's not below current registrations
        if (totalSeats && Number(totalSeats) < event.registeredStudents.length) {
            return res.status(400).json({
                success: false,
                message: `Total seats cannot be less than currently registered students (${event.registeredStudents.length}).`
            });
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title: title || event.title,
                description: description || event.description,
                category: category || event.category,
                date: date || event.date,
                time: time || event.time,
                venue: venue || event.venue,
                totalSeats: totalSeats ? Number(totalSeats) : event.totalSeats
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Event updated successfully!",
            event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Event removed successfully."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register student for an event
// @route   POST /api/events/:id/register
// @access  Private (Student only)
const registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        // Check if student already registered
        const alreadyRegistered = event.registeredStudents.some(
            (studentId) => studentId.toString() === req.user._id.toString()
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this event."
            });
        }

        // Check seat availability
        if (event.registeredStudents.length >= event.totalSeats) {
            return res.status(400).json({
                success: false,
                message: "Sorry, all seats for this event are fully booked."
            });
        }

        // Add user to registeredStudents
        event.registeredStudents.push(req.user._id);
        await event.save();

        res.status(200).json({
            success: true,
            message: "Registration successful! You have secured a seat.",
            event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Unregister / cancel registration for an event
// @route   POST /api/events/:id/unregister
// @access  Private (Student only)
const unregisterFromEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        // Check if student is registered
        const isRegistered = event.registeredStudents.some(
            (studentId) => studentId.toString() === req.user._id.toString()
        );

        if (!isRegistered) {
            return res.status(400).json({
                success: false,
                message: "You are not registered for this event."
            });
        }

        // Remove student
        event.registeredStudents = event.registeredStudents.filter(
            (studentId) => studentId.toString() !== req.user._id.toString()
        );

        await event.save();

        res.status(200).json({
            success: true,
            message: "You have successfully cancelled your registration for this event.",
            event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get list of registered students for an event
// @route   GET /api/events/:id/attendees
// @access  Private (Admin only)
const getEventAttendees = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            "registeredStudents",
            "name email department semester createdAt"
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        res.status(200).json({
            success: true,
            eventId: event._id,
            eventTitle: event.title,
            totalSeats: event.totalSeats,
            registeredCount: event.registeredStudents.length,
            attendees: event.registeredStudents
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventAttendees
};
