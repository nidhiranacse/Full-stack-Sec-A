const Event = require("../models/Event");
const { z } = require("zod");
const { redisClient } = require("../config/redis");

// ============================================================
// EVENT VALIDATION
// ============================================================

const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    date: z.string().min(1, "Date is required"),
    location: z.string().min(2, "Location is required")
});

// ============================================================
// CREATE EVENT
// POST /api/events
// ADMIN ONLY
// ============================================================

const createEvent = async (req, res) => {
    try {
        const result = eventSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const { title, description, date, location } = result.data;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            createdBy: req.user.userId
        });

        // Invalidate event cache after creating an event
        await redisClient.del("events:1:10:");

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create event"
        });
    }
};

// ============================================================
// GET EVENTS WITH REDIS CACHE
// GET /api/events
// ============================================================

const getEvents = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 50);
        const search = req.query.search || "";

        // Create unique cache key for pagination/search
        const cacheKey = `events:${page}:${limit}:${search}`;

        // Check Redis first
        const cachedEvents = await redisClient.get(cacheKey);

        if (cachedEvents) {
            console.log("Events served from Redis cache");

            return res.status(200).json({
                ...JSON.parse(cachedEvents),
                cached: true
            });
        }

        // Search filter
        const filter = search
            ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { location: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        const total = await Event.countDocuments(filter);

        const events = await Event.find(filter)
            .sort({ date: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const responseData = {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            events
        };

        // Store result in Redis for 60 seconds
        await redisClient.setEx(
            cacheKey,
            60,
            JSON.stringify(responseData)
        );

        console.log("Events stored in Redis cache");

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch events"
        });
    }
};

// ============================================================
// UPDATE EVENT
// PUT /api/events/:id
// ADMIN ONLY
// ============================================================

const updateEvent = async (req, res) => {
    try {
        const result = eventSchema.partial().safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            result.data,
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Invalidate cache
        await redisClient.del("events:1:10:");

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        console.error("Update event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update event"
        });
    }
};

// ============================================================
// DELETE EVENT
// DELETE /api/events/:id
// ADMIN ONLY
// ============================================================

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Invalidate cache
        await redisClient.del("events:1:10:");

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("Delete event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete event"
        });
    }
};

// ============================================================
// RSVP TO EVENT
// POST /api/events/:id/rsvp
// STUDENT ONLY
// ============================================================

const rsvpEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (event.attendees.includes(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: "Already RSVP'd to this event"
            });
        }

        event.attendees.push(req.user.userId);

        await event.save();

        // Invalidate cache because event data changed
        await redisClient.del("events:1:10:");

        res.status(200).json({
            success: true,
            message: "RSVP successful",
            event
        });

    } catch (error) {
        console.error("RSVP error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to RSVP"
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    rsvpEvent
};