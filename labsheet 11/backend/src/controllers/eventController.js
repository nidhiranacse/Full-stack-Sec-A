import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

// @desc    Get all events with search, category/date filtering & pagination
// @route   GET /api/events
// @access  Public (Optional auth for isRegistered flag)
export const getEvents = async (req, res, next) => {
  try {
    const { search, category, startDate, endDate, page = 1, limit = 9 } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Search by title or description (regex or text search)
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .lean();

    // If student user is logged in, attach registration status
    let studentRegistrations = new Set();
    if (req.user && req.user.role === 'student') {
      const userRegs = await Registration.find({
        student: req.user._id,
        status: 'confirmed'
      }).select('event');
      studentRegistrations = new Set(userRegs.map((r) => r.event.toString()));
    }

    const formattedEvents = events.map((event) => {
      const seatsAvailable = Math.max(0, event.maxSeats - (event.registeredCount || 0));
      return {
        ...event,
        seatsAvailable,
        isFull: seatsAvailable === 0,
        isRegistered: studentRegistrations.has(event._id.toString())
      };
    });

    res.status(200).json({
      success: true,
      count: formattedEvents.length,
      total: totalEvents,
      totalPages: Math.ceil(totalEvents / limitNum) || 1,
      currentPage: pageNum,
      events: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public (Optional auth for isRegistered flag)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    let isRegistered = false;
    if (req.user && req.user.role === 'student') {
      const reg = await Registration.findOne({
        event: event._id,
        student: req.user._id,
        status: 'confirmed'
      });
      isRegistered = !!reg;
    }

    const eventObj = event.toJSON();
    eventObj.isRegistered = isRegistered;

    res.status(200).json({
      success: true,
      event: eventObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin only)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, venue, maxSeats, organizer, speaker } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      venue,
      maxSeats: Number(maxSeats) || 50,
      organizer: organizer || 'CampusConnect Committee',
      speaker: speaker || 'Keynote Speaker',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const { title, description, category, date, time, venue, maxSeats, organizer, speaker } = req.body;

    if (maxSeats !== undefined && Number(maxSeats) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot decrease seat capacity below current registered count (${event.registeredCount}).`
      });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (maxSeats !== undefined) event.maxSeats = Number(maxSeats);
    if (organizer) event.organizer = organizer;
    if (speaker) event.speaker = speaker;

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Delete associated registrations
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student only)
export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Check if seats are available
    if (event.registeredCount >= event.maxSeats) {
      return res.status(400).json({
        success: false,
        message: 'Registration closed. All seats have been filled.'
      });
    }

    // Check if student is already registered
    const existingReg = await Registration.findOne({ event: eventId, student: studentId });
    if (existingReg && existingReg.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.'
      });
    }

    if (existingReg && existingReg.status === 'cancelled') {
      existingReg.status = 'confirmed';
      existingReg.registeredAt = new Date();
      await existingReg.save();
    } else {
      await Registration.create({
        event: eventId,
        student: studentId,
        status: 'confirmed'
      });
    }

    // Atomically increment registeredCount
    event.registeredCount += 1;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event!',
      seatsRemaining: Math.max(0, event.maxSeats - event.registeredCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unregister from an event
// @route   POST /api/events/:id/unregister
// @access  Private (Student only)
export const unregisterFromEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const reg = await Registration.findOne({ event: eventId, student: studentId, status: 'confirmed' });
    if (!reg) {
      return res.status(400).json({
        success: false,
        message: 'You do not have an active registration for this event.'
      });
    }

    await reg.deleteOne();

    // Decrement registeredCount safely
    if (event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled.',
      seatsRemaining: Math.max(0, event.maxSeats - event.registeredCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of registered students for an event
// @route   GET /api/events/:id/attendees
// @access  Private (Admin only)
export const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const registrations = await Registration.find({ event: event._id, status: 'confirmed' })
      .populate('student', 'name email studentId department semester')
      .sort({ registeredAt: -1 });

    const attendees = registrations.map((r) => ({
      registrationId: r._id,
      registeredAt: r.registeredAt,
      status: r.status,
      student: r.student
    }));

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        maxSeats: event.maxSeats,
        registeredCount: event.registeredCount
      },
      totalAttendees: attendees.length,
      attendees
    });
  } catch (error) {
    next(error);
  }
};
