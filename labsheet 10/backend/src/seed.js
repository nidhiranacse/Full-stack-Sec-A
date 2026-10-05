import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Announcement } from './models/Announcement.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/campusconnect';
    await mongoose.connect(mongoUri);
    console.log(`[Database Seed] Connected to ${mongoUri}`);

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});

    console.log('[Database Seed] Cleared previous records.');

    // 1. Create Users
    const adminPasswordHash = await User.hashPassword('AdminPassword123!');
    const studentPasswordHash = await User.hashPassword('StudentPassword123!');

    const adminUser = await User.create({
      name: 'Dean Admin',
      email: 'admin@campusconnect.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    });

    const studentUser = await User.create({
      name: 'Alex Student',
      email: 'student@campusconnect.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT'
    });

    console.log(`[Database Seed] Created Users:
  - Admin: ${adminUser.email} (Password: AdminPassword123!)
  - Student: ${studentUser.email} (Password: StudentPassword123!)`);

    // 2. Create Events
    const events = [
      {
        title: 'Annual Campus Hackathon & CodeFest 2026',
        description: '36-hour non-stop collegiate hackathon featuring Web3, AI, and Cloud tracks with $10,000 in prizes.',
        date: new Date(Date.now() + 5 * 86400000),
        location: 'CS Department Innovation Hub, Block C',
        category: 'WORKSHOP',
        capacity: 120,
        createdBy: adminUser._id,
        rsvpUsers: [studentUser._id]
      },
      {
        title: 'National AI & Machine Learning Symposium',
        description: 'Keynotes from top industry researchers on Large Language Models, Robotics, and Responsible AI.',
        date: new Date(Date.now() + 10 * 86400000),
        location: 'Auditorium Main Hall',
        category: 'ACADEMIC',
        capacity: 250,
        createdBy: adminUser._id,
        rsvpUsers: []
      },
      {
        title: 'Spring Cultural Festival "VIBRANCE 2026"',
        description: 'Annual inter-college cultural fest celebrating music, dance, theater, and culinary arts.',
        date: new Date(Date.now() + 15 * 86400000),
        location: 'Campus Open Air Amphitheatre',
        category: 'CULTURAL',
        capacity: 500,
        createdBy: adminUser._id,
        rsvpUsers: [studentUser._id]
      },
      {
        title: 'Campus Placement & Career Fair',
        description: 'Over 40 tech and consulting enterprises recruiting for internships and full-time graduate roles.',
        date: new Date(Date.now() + 20 * 86400000),
        location: 'Multipurpose Sports Complex',
        category: 'SEMINAR',
        capacity: 300,
        createdBy: adminUser._id,
        rsvpUsers: []
      },
      {
        title: 'Inter-Departmental Badminton & Futsal League',
        description: 'Championship league for college student and faculty teams. Medals and trophies awarded.',
        date: new Date(Date.now() + 25 * 86400000),
        location: 'Student Activity Arena',
        category: 'SPORTS',
        capacity: 60,
        createdBy: adminUser._id,
        rsvpUsers: []
      }
    ];

    await Event.insertMany(events);
    console.log(`[Database Seed] Created ${events.length} sample events.`);

    // 3. Create Announcements
    const announcements = [
      {
        title: 'Mid-Semester Examination Schedule Published',
        message: 'The mid-semester examination timetable has been officially released on the examination portal. Check your subject slots.',
        priority: 'HIGH',
        createdBy: adminUser._id
      },
      {
        title: 'Central Library Extended Study Hours',
        message: 'The university library reading rooms will remain open until midnight throughout the examination period.',
        priority: 'MEDIUM',
        createdBy: adminUser._id
      },
      {
        title: 'Campus Wi-Fi Maintenance Window Notice',
        message: 'Routine infrastructure maintenance will be performed on Sunday between 2:00 AM and 5:00 AM.',
        priority: 'LOW',
        createdBy: adminUser._id
      }
    ];

    await Announcement.insertMany(announcements);
    console.log(`[Database Seed] Created ${announcements.length} sample announcements.`);

    console.log('\n[Database Seed] SUCCESS! Database seeded successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Database Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
