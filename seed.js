// Populates the database with a demo admin, student, and a couple of events.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

const run = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ['admin@campusconnect.test', 'student@campusconnect.test'] } });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@campusconnect.test',
    password: 'Admin@123',
    role: 'admin',
  });

  const student = await User.create({
    name: 'Demo Student',
    email: 'student@campusconnect.test',
    password: 'Student@123',
    role: 'student',
  });

  await Event.deleteMany({ createdBy: admin._id });

  await Event.create([
    {
      title: 'React & Node Full-Stack Workshop',
      description: 'Hands-on workshop covering React front-end and Express back-end basics.',
      category: 'workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'CS Seminar Hall',
      totalSeats: 60,
      createdBy: admin._id,
    },
    {
      title: 'CampusConnect Hackathon 2026',
      description: '24-hour hackathon building solutions for campus problems.',
      category: 'hackathon',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: 'Innovation Lab',
      totalSeats: 100,
      createdBy: admin._id,
    },
    {
      title: 'TCS Placement Drive',
      description: 'On-campus placement drive for final year students.',
      category: 'placement-drive',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: 'Main Auditorium',
      totalSeats: 200,
      createdBy: admin._id,
    },
  ]);

  console.log('Seed complete:');
  console.log('  Admin   -> admin@campusconnect.test / Admin@123');
  console.log('  Student -> student@campusconnect.test / Student@123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
