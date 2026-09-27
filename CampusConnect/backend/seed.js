require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const User = require("./models/user");
const Event = require("./models/Event");
const Resource = require("./models/Resource");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusconnect");
        console.log("Connected to MongoDB for seeding...");

        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create sample resource file if none exists
        const sampleFilePath = path.join(uploadDir, "sample-operating-systems-notes.txt");
        if (!fs.existsSync(sampleFilePath)) {
            fs.writeFileSync(
                sampleFilePath,
                "CampusConnect Sample Study Material\nSubject: Operating Systems\nUnit 1: Process Management and CPU Scheduling Algorithms."
            );
        }

        // Clear existing data
        await User.deleteMany();
        await Event.deleteMany();
        await Resource.deleteMany();
        console.log("Cleared existing database records.");

        // Create Admin & Student passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash("admin123", salt);
        const studentPassword = await bcrypt.hash("student123", salt);
        const student2Password = await bcrypt.hash("student123", salt);

        // 1. Create Users
        const adminUser = await User.create({
            name: "Prof. R. K. Sharma (Faculty Admin)",
            email: "admin@campusconnect.edu",
            password: adminPassword,
            role: "admin",
            department: "Computer Science & Engineering",
            semester: 6
        });

        const studentUser = await User.create({
            name: "Afroj Khan",
            email: "student@campusconnect.edu",
            password: studentPassword,
            role: "student",
            department: "Computer Science & Engineering",
            semester: 6
        });

        const student2 = await User.create({
            name: "Priya Patel",
            email: "priya@campusconnect.edu",
            password: student2Password,
            role: "student",
            department: "Information Technology",
            semester: 6
        });

        console.log("Created users: Admin and 2 Students.");

        // 2. Create Events
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 2);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const inTwoWeeks = new Date(today);
        inTwoWeeks.setDate(today.getDate() + 14);

        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 5);

        const events = await Event.create([
            {
                title: "Full Stack Web Development Workshop",
                description: "Hands-on masterclass covering MERN Stack architecture, RESTful API design, state management, and modern cloud deployment pipelines.",
                category: "Workshop",
                date: tomorrow,
                time: "10:00 AM - 01:00 PM",
                venue: "Computer Science Lab 3, Block A",
                totalSeats: 30,
                registeredStudents: [studentUser._id],
                createdBy: adminUser._id
            },
            {
                title: "HackCampus 2026: 24-Hour Annual Hackathon",
                description: "Join the most exciting hackathon of the semester! Build innovative AI, Web3, or EdTech solutions. Mentorship from industry experts and prize pool of ₹50,000.",
                category: "Hackathon",
                date: nextWeek,
                time: "09:00 AM onwards (24 Hours)",
                venue: "Auditorium Hall, Central Block",
                totalSeats: 100,
                registeredStudents: [studentUser._id, student2._id],
                createdBy: adminUser._id
            },
            {
                title: "TCS & Infosys Campus Placement Drive 2026",
                description: "Eligibility: B.Tech CSE/IT 6th & 8th Sem with CGPA > 7.0. Technical aptitude assessment followed by coding interview round.",
                category: "Placement Drive",
                date: inTwoWeeks,
                time: "09:30 AM - 05:00 PM",
                venue: "Placement Cell & Seminar Hall 1",
                totalSeats: 150,
                registeredStudents: [studentUser._id],
                createdBy: adminUser._id
            },
            {
                title: "AI & Machine Learning in Modern Cloud Systems",
                description: "Guest lecture by Senior Architect from Google Cloud. Deep dive into LLM deployment, vector databases, and model monitoring.",
                category: "Tech Talk",
                date: tomorrow,
                time: "02:30 PM - 04:30 PM",
                venue: "Virtual via Google Meet & Seminar Hall 2",
                totalSeats: 50,
                registeredStudents: [],
                createdBy: adminUser._id
            },
            {
                title: "Git, GitHub & Open Source Contribution BootCamp",
                description: "Learn Git branching strategies, pull requests, merge conflict resolution, and make your first Open Source contribution.",
                category: "Workshop",
                date: pastDate,
                time: "11:00 AM - 01:00 PM",
                venue: "Online Webinar",
                totalSeats: 40,
                registeredStudents: [student2._id],
                createdBy: adminUser._id
            }
        ]);

        console.log(`Created ${events.length} sample campus events.`);

        // 3. Create Sample Resources
        const resources = await Resource.create([
            {
                title: "Operating Systems - Complete Lecture Notes & CPU Scheduling",
                description: "Comprehensive notes covering Process Management, Deadlocks, Memory Management, and Virtual Memory with solved numericals.",
                subject: "Operating Systems",
                semester: 6,
                category: "Notes",
                fileName: "sample-operating-systems-notes.txt",
                filePath: sampleFilePath,
                fileType: "txt",
                fileSize: 15420,
                uploadedBy: adminUser._id
            },
            {
                title: "Design and Analysis of Algorithms - End-Sem 2025 Solved Paper",
                description: "Official previous year question paper with detailed step-by-step solutions for Dynamic Programming, Greedy, and Graph algorithms.",
                subject: "Design and Analysis of Algorithms",
                semester: 6,
                category: "Previous Year Papers",
                fileName: "sample-operating-systems-notes.txt",
                filePath: sampleFilePath,
                fileType: "pdf",
                fileSize: 45210,
                uploadedBy: adminUser._id
            },
            {
                title: "Database Management Systems - SQL & Normalization Lab Manual",
                description: "Lab manual containing all 10 experiment queries, schema designs, ER diagrams, and PL/SQL procedures for DBMS Lab.",
                subject: "Database Management Systems",
                semester: 5,
                category: "Lab Manual",
                fileName: "sample-operating-systems-notes.txt",
                filePath: sampleFilePath,
                fileType: "pdf",
                fileSize: 32010,
                uploadedBy: adminUser._id
            },
            {
                title: "Computer Networks - OSI & TCP/IP Protocol Suite Summary",
                description: "Handwritten revision sheet for quick formula & protocol reference before mid-semester tests.",
                subject: "Computer Networks",
                semester: 6,
                category: "Notes",
                fileName: "sample-operating-systems-notes.txt",
                filePath: sampleFilePath,
                fileType: "docx",
                fileSize: 22100,
                uploadedBy: adminUser._id
            }
        ]);

        console.log(`Created ${resources.length} academic resources.`);
        console.log("\n================ SEED SUCCESS ================");
        console.log("Admin Login:   admin@campusconnect.edu   / admin123");
        console.log("Student Login: student@campusconnect.edu / student123");
        console.log("==============================================\n");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
