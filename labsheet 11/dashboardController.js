const User = require("../models/User");
const Event = require("../models/Event");
const Resource = require("../models/Resource");

// =========================
// STUDENT DASHBOARD
// =========================

const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find student's registered events
        const myEvents = await Event.find({
            registeredStudents: userId
        })
            .select(
                "title description category date venue totalSeats registeredStudents"
            )
            .sort({ date: 1 });

        // Add available seats
        const events = myEvents.map((event) => ({
            ...event.toObject(),
            availableSeats:
                event.totalSeats -
                event.registeredStudents.length,

            isRegistered: true
        }));

        // Total registrations
        const totalRegistrations = events.length;

        // Upcoming events
        const upcomingEvents = events.filter(
            (event) => new Date(event.date) >= new Date()
        );

        // Available resources count
        const totalResources =
            await Resource.countDocuments();

        res.status(200).json({
            student: {
                id: req.user.id
            },

            statistics: {
                totalRegistrations,
                upcomingEvents: upcomingEvents.length,
                totalResources
            },

            myEvents: events
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to load student dashboard",
            error: error.message
        });
    }
};


// =========================
// MY EVENTS
// =========================

const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({
            registeredStudents: req.user.id
        })
            .select(
                "title description category date venue totalSeats registeredStudents"
            )
            .sort({ date: 1 });

        const result = events.map((event) => ({
            ...event.toObject(),

            availableSeats:
                event.totalSeats -
                event.registeredStudents.length,

            isRegistered: true
        }));

        res.status(200).json({
            total: result.length,
            events: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your events",
            error: error.message
        });
    }
};


// =========================
// MY PROFILE
// =========================

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};

module.exports = {
    getStudentDashboard,
    getMyEvents,
    getMyProfile
};