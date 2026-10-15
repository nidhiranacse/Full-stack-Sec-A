const User = require("../models/User");
const Event = require("../models/Event");
const Resource = require("../models/Resource");

// =========================
// ADMIN DASHBOARD
// =========================

const getAdminDashboard = async (req, res) => {
    try {
        const totalStudents =
            await User.countDocuments({
                role: "student"
            });

        const totalAdmins =
            await User.countDocuments({
                role: "admin"
            });

        const totalEvents =
            await Event.countDocuments();

        const totalResources =
            await Resource.countDocuments();

        const allEvents = await Event.find();

        // Calculate total registrations
        const totalRegistrations =
            allEvents.reduce(
                (total, event) =>
                    total +
                    event.registeredStudents.length,
                0
            );

        // Upcoming events
        const upcomingEvents =
            await Event.find({
                date: {
                    $gte: new Date()
                }
            })
                .sort({ date: 1 })
                .limit(5);

        res.status(200).json({
            statistics: {
                totalStudents,
                totalAdmins,
                totalEvents,
                totalResources,
                totalRegistrations
            },

            upcomingEvents
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to load admin dashboard",
            error: error.message
        });
    }
};


// =========================
// EVENT REGISTERED STUDENTS
// =========================

const getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(
            req.params.eventId
        )
            .populate(
                "registeredStudents",
                "name email"
            );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            event: {
                id: event._id,
                title: event.title,
                totalSeats: event.totalSeats,
                registeredCount:
                    event.registeredStudents.length
            },

            students: event.registeredStudents
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Failed to fetch registered students",
            error: error.message
        });
    }
};

module.exports = {
    getAdminDashboard,
    getEventRegistrations
};