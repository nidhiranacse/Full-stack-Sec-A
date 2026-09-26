const Event = require("../models/Event");

// Create event - Admin only
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            location,
            totalSeats
        } = req.body;

        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !location ||
            !totalSeats
        ) {
            return res.status(400).json({
                success: false,
                message: "All event fields are required"
            });
        }

        const event = await Event.create({
            title,
            description,
            category,
            date,
            location,
            totalSeats,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating event"
        });
    }
};


// Get all events - Students and Admin
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
            query.$text = {
                $search: search
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

        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            totalEvents: total,
            events
        });

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching events"
        });
    }
};


// Get single event
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("registeredStudents", "name email");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Invalid event ID"
        });
    }
};


// Update event - Admin only
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event: updatedEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while updating event"
        });
    }
};


// Delete event - Admin only
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while deleting event"
        });
    }
};

// Register student for an event
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Check if already registered
        if (event.registeredStudents.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this event"
            });
        }

        // Check available seats
        if (event.registeredStudents.length >= event.totalSeats) {
            return res.status(400).json({
                success: false,
                message: "No seats available for this event"
            });
        }

        event.registeredStudents.push(req.user._id);

        await event.save();

        res.status(200).json({
            success: true,
            message: "Successfully registered for event",
            availableSeats:
                event.totalSeats - event.registeredStudents.length
        });

    } catch (error) {
        console.error("Register event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while registering for event"
        });
    }
};


// Unregister student from event
const unregisterFromEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        const studentIndex = event.registeredStudents.findIndex(
            (studentId) => studentId.toString() === req.user._id.toString()
        );

        if (studentIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "You are not registered for this event"
            });
        }

        event.registeredStudents.splice(studentIndex, 1);

        await event.save();

        res.status(200).json({
            success: true,
            message: "Successfully unregistered from event",
            availableSeats:
                event.totalSeats - event.registeredStudents.length
        });

    } catch (error) {
        console.error("Unregister event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while unregistering"
        });
    }
};



// Get student's registered events
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({
            registeredStudents: req.user._id
        })
        .sort({ date: 1 });

        res.status(200).json({
            success: true,
            totalEvents: events.length,
            events
        });

    } catch (error) {
        console.error("Get my events error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching your events"
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getMyEvents
};