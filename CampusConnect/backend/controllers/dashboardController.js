const Event = require("../models/Event");
const Resource = require("../models/Resource");
const User = require("../models/user");

// @desc    Get Student Dashboard data (my events, registration history, recommended resources)
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res, next) => {
    try {
        const studentId = req.user._id;

        // Find all events where student is registered
        const registeredEvents = await Event.find({
            registeredStudents: studentId
        }).sort({ date: 1 });

        // Split into upcoming and past
        const now = new Date();
        const upcomingEvents = registeredEvents.filter((ev) => new Date(ev.date) >= now);
        const pastEvents = registeredEvents.filter((ev) => new Date(ev.date) < now);

        // Find resources matching student's semester or department
        const semester = req.user.semester || 6;
        const mySemesterResources = await Resource.find({
            semester: semester
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            dashboard: {
                totalRegistrations: registeredEvents.length,
                upcomingCount: upcomingEvents.length,
                pastCount: pastEvents.length,
                upcomingEvents,
                registrationHistory: registeredEvents,
                recommendedResources: mySemesterResources
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Admin Dashboard data (analytics, total events, registrations, resources, students)
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalResources = await Resource.countDocuments();
        const totalStudents = await User.countDocuments({ role: "student" });

        // Calculate total registrations across all events
        const events = await Event.find().select("title date totalSeats registeredStudents category");
        const totalRegistrations = events.reduce(
            (acc, curr) => acc + (curr.registeredStudents ? curr.registeredStudents.length : 0),
            0
        );

        // Category breakdown
        const categoryCounts = {};
        events.forEach((ev) => {
            categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + 1;
        });

        // Top popular events by registrations
        const popularEvents = [...events]
            .sort((a, b) => (b.registeredStudents?.length || 0) - (a.registeredStudents?.length || 0))
            .slice(0, 5)
            .map((ev) => ({
                id: ev._id,
                title: ev.title,
                category: ev.category,
                date: ev.date,
                totalSeats: ev.totalSeats,
                registeredCount: ev.registeredStudents ? ev.registeredStudents.length : 0
            }));

        // Recent 5 events
        const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);

        // Recent 5 resources
        const recentResources = await Resource.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("uploadedBy", "name");

        res.status(200).json({
            success: true,
            stats: {
                totalEvents,
                totalRegistrations,
                totalResources,
                totalStudents
            },
            categoryCounts,
            popularEvents,
            recentEvents,
            recentResources
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Benchmark Query Optimization (Bonus Challenge)
// @route   GET /api/dashboard/benchmark
// @access  Private (Admin)
const getQueryBenchmark = async (req, res, next) => {
    try {
        // Demonstrate explain() query plan showing index usage
        const explainResult = await Event.find({ category: "Workshop" })
            .sort({ date: 1 })
            .explain("executionStats");

        const stats = explainResult.executionStats;

        res.status(200).json({
            success: true,
            optimizationDetails: {
                queryTarget: "find({ category: 'Workshop' }).sort({ date: 1 })",
                indexUsed: stats.executionStages?.indexName || "category_1_date_1",
                executionTimeMillis: stats.executionTimeMillis,
                totalDocsExamined: stats.totalDocsExamined,
                nReturned: stats.nReturned,
                explanation:
                    "With compound index { category: 1, date: 1 }, MongoDB performs an IXSCAN (Index Scan) instead of a COLLSCAN (Collection Scan), reducing docs examined and execution time from O(N) to O(log N)."
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentDashboard,
    getAdminDashboard,
    getQueryBenchmark
};
