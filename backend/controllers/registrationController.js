const Registration = require("../models/Registration");
const Event = require("../models/Event");

// Register for event
const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const studentId = req.user.id;

        // Check event
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        // Check already registered
        const existingRegistration = await Registration.findOne({
            student: studentId,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Already registered for this event"
            });
        }

        // Check seats
        if (event.availableSeats <= 0) {
            return res.status(400).json({
                message: "No seats available"
            });
        }

        // Create registration
        const registration = await Registration.create({
            student: studentId,
            event: eventId
        });

        // Decrease available seats
        event.availableSeats -= 1;
        await event.save();

        res.status(201).json({
            message: "Registered successfully",
            registration
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Unregister from event
const unregisterFromEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const studentId = req.user.id;

        const registration = await Registration.findOneAndDelete({
            student: studentId,
            event: eventId
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        // Increase available seats
        await Event.findByIdAndUpdate(
            eventId,
            {
                $inc: {
                    availableSeats: 1
                }
            }
        );

        res.status(200).json({
            message: "Unregistered successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Student registration history
const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({
            student: req.user.id
        })
            .populate("event")
            .sort({ createdAt: -1 });

        res.status(200).json(registrations);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({
            event: req.params.eventId
        })
            .populate("student", "name email")
            .populate("event", "title date venue")
            .sort({ createdAt: -1 });

        res.status(200).json(registrations);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch registered students",
            error: error.message
        });
    }
};


module.exports = {
    registerForEvent,
    unregisterFromEvent,
    getMyRegistrations,
    getEventRegistrations
};