const Event = require("../models/Event");
const { redisClient } = require("../config/redis");
const CACHE_KEY = "events";
const getEvents = async (req, res) => {
    try {
        const cachedEvents = await redisClient.get(CACHE_KEY);
        if (cachedEvents) {
            console.log("Serving events from Redis cache");
            return res.status(200).json({
                source: "cache",
                events: JSON.parse(cachedEvents)
            });
        }
        console.log("Fetching events from MongoDB");
        const events = await Event.find().sort({ date: 1 });
        await redisClient.setEx(
            CACHE_KEY,
            60,
            JSON.stringify(events)
        );
        res.status(200).json({
            source: "database",
            events
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });
    }
};
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location
        });
        await redisClient.del(CACHE_KEY);
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
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        await redisClient.del(CACHE_KEY);
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
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        await redisClient.del(CACHE_KEY);
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
module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};