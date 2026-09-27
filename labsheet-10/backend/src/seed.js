const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at ${mongoUri}`);

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Admin & Student users
    const adminPasswordHash = await User.hashPassword('AdminPassword123');
    const studentPasswordHash = await User.hashPassword('StudentPassword123');

    const admin = await User.create({
      name: 'Dr. Sarah Connor (Dean of Events)',
      email: 'admin@campus.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    });

    const student = await User.create({
      name: 'Afroj Ansari',
      email: 'student@campus.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
    });

    console.log(`[Seed] Created Users:\n  - Admin:   ${admin.email} (AdminPassword123)\n  - Student: ${student.email} (StudentPassword123)`);

    // 2. Create Sample Campus Events
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const events = await Event.create([
      {
        title: 'National College Hackathon 2026',
        description: 'A 36-hour non-stop innovation hackathon focusing on AI, Web3, and Sustainable Tech with prizes worth $10,000.',
        date: new Date(now + 5 * day),
        location: 'Campus Tech Arena, Building C',
        category: 'Hackathon',
        capacity: 150,
        createdBy: admin._id,
        rsvps: [student._id],
      },
      {
        title: 'Full-Stack Modern Web Architecture Workshop',
        description: 'Hands-on masterclass covering React 18, Node.js microservices, Redis caching, and Docker containerization.',
        date: new Date(now + 8 * day),
        location: 'Computer Science Lab 4',
        category: 'Workshop',
        capacity: 60,
        createdBy: admin._id,
        rsvps: [],
      },
      {
        title: 'Annual Spring Cultural Fiesta & Music Night',
        description: 'A vibrant evening featuring campus rock bands, dance crews, international food stalls, and art exhibitions.',
        date: new Date(now + 12 * day),
        location: 'Open Air Amphitheatre',
        category: 'Cultural',
        capacity: 500,
        createdBy: admin._id,
        rsvps: [student._id],
      },
      {
        title: 'Guest Lecture: Scalable Systems in Production',
        description: 'Distinguished engineering talk by industry architects on high-throughput distributed systems and caching patterns.',
        date: new Date(now + 15 * day),
        location: 'Main Auditorium',
        category: 'Seminar',
        capacity: 200,
        createdBy: admin._id,
        rsvps: [],
      },
      {
        title: 'Inter-Department Basketball Championship',
        description: 'Cheer for your department team in the opening tournament matches of the annual inter-college sports league.',
        date: new Date(now + 18 * day),
        location: 'Indoor Sports Complex',
        category: 'Sports',
        capacity: 300,
        createdBy: admin._id,
        rsvps: [],
      },
      {
        title: 'Cybersecurity & Ethical Hacking Bootcamp',
        description: 'Practical exploration of vulnerability testing, network penetration, and web application security standards.',
        date: new Date(now + 22 * day),
        location: 'Cyber Lab 2',
        category: 'Workshop',
        capacity: 80,
        createdBy: admin._id,
        rsvps: [],
      },
    ]);

    console.log(`[Seed] Created ${events.length} sample events.`);

    // 3. Create Sample Announcements
    const announcements = await Announcement.create([
      {
        title: 'Registration Open for National College Hackathon 2026',
        content: 'Teams of up to 4 members can register starting today! Exciting prizes, developer swag, and internship opportunities await.',
        priority: 'HIGH',
        category: 'Hackathon',
        createdBy: admin._id,
      },
      {
        title: 'Campus Wi-Fi Maintenance Window This Saturday',
        content: 'Network operations center will conduct scheduled core router upgrades on Saturday between 02:00 AM and 05:00 AM.',
        priority: 'NORMAL',
        category: 'Maintenance',
        createdBy: admin._id,
      },
      {
        title: 'Reminder: Lab Sheet 10 Submission Portal',
        content: 'Please ensure your full-stack containerized project and benchmark report are submitted before the deadline.',
        priority: 'URGENT',
        category: 'Academic',
        createdBy: admin._id,
      },
    ]);

    console.log(`[Seed] Created ${announcements.length} initial announcements.`);
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
