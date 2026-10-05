import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Resource } from '../models/Resource.js';
import { User } from '../models/User.js';

// @desc    Get Student Dashboard data (My events, registration history, recommended resources)
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Fetch student's registrations with populated event details
    const registrations = await Registration.find({ student: studentId, status: 'confirmed' })
      .populate('event')
      .sort({ registeredAt: -1 });

    const now = new Date();
    const myEvents = [];
    let upcomingCount = 0;
    let completedCount = 0;

    for (const reg of registrations) {
      if (reg.event) {
        const isUpcoming = new Date(reg.event.date) >= now;
        if (isUpcoming) upcomingCount++;
        else completedCount++;

        myEvents.push({
          registrationId: reg._id,
          registeredAt: reg.registeredAt,
          status: reg.status,
          event: reg.event,
          isUpcoming
        });
      }
    }

    // Recommended resources matching student's semester or department
    const recommendedResources = await Resource.find({
      $or: [{ semester: req.user.semester }, { subject: { $regex: 'Engineering|Computer|Data|Web', $options: 'i' } }]
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalRegistered: myEvents.length,
        upcomingEvents: upcomingCount,
        completedEvents: completedCount
      },
      myEvents,
      recommendedResources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics (Total events, total registrations, seat utilization, roster)
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRegistrations = await Registration.countDocuments({ status: 'confirmed' });

    // Aggregate total seats capacity across all events
    const seatsAgg = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$maxSeats' },
          totalBooked: { $sum: '$registeredCount' }
        }
      }
    ]);

    const totalCapacity = seatsAgg.length > 0 ? seatsAgg[0].totalCapacity : 0;
    const totalBooked = seatsAgg.length > 0 ? seatsAgg[0].totalBooked : 0;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    // Detailed events roster breakdown
    const eventBreakdown = await Event.find()
      .select('title category date venue maxSeats registeredCount')
      .sort({ date: 1 })
      .lean();

    const formattedBreakdown = eventBreakdown.map((e) => ({
      ...e,
      seatsAvailable: Math.max(0, e.maxSeats - e.registeredCount),
      fillPercentage: e.maxSeats > 0 ? Math.round((e.registeredCount / e.maxSeats) * 100) : 0
    }));

    // Recent registrations log
    const recentRegistrations = await Registration.find({ status: 'confirmed' })
      .sort({ registeredAt: -1 })
      .limit(10)
      .populate('student', 'name email studentId department')
      .populate('event', 'title category date')
      .lean();

    res.status(200).json({
      success: true,
      analytics: {
        totalEvents,
        totalResources,
        totalStudents,
        totalRegistrations,
        totalCapacity,
        totalBooked,
        occupancyRate
      },
      events: formattedBreakdown,
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};
