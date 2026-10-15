// Populates the database with a demo admin, a demo student, and a few
// sample events/resources so you have something to click around immediately.
//
// Run with: npm run seed

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");
const Resource = require("./models/Resource");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Resource.deleteMany({})]);
  console.log("Cleared existing data");

  const admin = await User.create({
    name: "Admin User",
    email: "admin@campusconnect.edu",
    password: "admin123",
    role: "admin",
  });

  const student = await User.create({
    name: "Riya Sharma",
    email: "student@campusconnect.edu",
    password: "student123",
    role: "student",
  });

  const events = await Event.insertMany([
    {
      title: "Intro to React Workshop",
      description: "Hands-on workshop covering React fundamentals, hooks, and building your first app.",
      category: "Workshop",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: "Seminar Hall A",
      totalSeats: 60,
      availableSeats: 60,
      createdBy: admin._id,
    },
    {
      title: "CodeSprint Hackathon 2026",
      description: "24-hour hackathon. Build something awesome and win prizes.",
      category: "Hackathon",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: "CS Department Lab",
      totalSeats: 100,
      availableSeats: 100,
      createdBy: admin._id,
    },
    {
      title: "TCS Campus Placement Drive",
      description: "On-campus placement drive for final year students.",
      category: "Placement Drive",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: "Auditorium",
      totalSeats: 200,
      availableSeats: 200,
      createdBy: admin._id,
    },
  ]);

  console.log(`Seeded ${events.length} events`);
  console.log("Seed complete. Demo credentials:");
  console.log("  Admin   -> admin@campusconnect.edu / admin123");
  console.log("  Student -> student@campusconnect.edu / student123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
