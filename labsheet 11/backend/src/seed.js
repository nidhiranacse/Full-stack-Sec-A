import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Registration } from './models/Registration.js';
import { Resource } from './models/Resource.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Resource.deleteMany({})
    ]);

    console.log('[Seed] Creating Users...');
    // Create Admin
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma (Faculty Admin)',
      email: 'admin@campusconnect.edu',
      password: 'Admin@123',
      role: 'admin',
      studentId: 'FAC-CSE-01',
      department: 'Computer Science & Engineering',
      semester: 8
    });

    // Create Students
    const student1 = await User.create({
      name: 'Vanshika Chauhan',
      email: 'student@campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'CU240250953',
      department: 'Computer Science & Engineering',
      semester: 5
    });

    const student2 = await User.create({
      name: 'Aarav Mehta',
      email: 'aarav.mehta@campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'CU240250912',
      department: 'Information Technology',
      semester: 5
    });

    const student3 = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'CU240250884',
      department: 'Electronics & Communication',
      semester: 4
    });

    console.log('[Seed] Creating Events...');
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    const eventsData = [
      {
        title: 'Full Stack Web Development with React & Node.js',
        description: 'Comprehensive 2-day hands-on workshop covering REST APIs, JWT Auth, Vite, React State Management, and Production Deployment.',
        category: 'Workshop',
        date: new Date(now.getTime() + 5 * day),
        time: '10:00 AM - 04:00 PM',
        venue: 'Auditorium A, Tech Block',
        maxSeats: 50,
        registeredCount: 0,
        organizer: 'CSE Department & ACM Student Chapter',
        speaker: 'Alex Rivera (Staff Engineer @ TechCorp)',
        createdBy: admin._id
      },
      {
        title: 'HackCampus 2026: 36-Hour National Hackathon',
        description: 'Compete with 200+ collegiate innovators in building AI-driven solutions for Smart Cities, Healthcare, and FinTech. Prizes worth INR 2,00,000!',
        category: 'Hackathon',
        date: new Date(now.getTime() + 14 * day),
        time: '09:00 AM (Day 1) - 09:00 PM (Day 2)',
        venue: 'Central Innovation & Incubation Center',
        maxSeats: 100,
        registeredCount: 0,
        organizer: 'Innovation Cell',
        speaker: 'Panel of Venture Capitalists & Tech Leads',
        createdBy: admin._id
      },
      {
        title: 'Microsoft & Amazon Placement Readiness Drive',
        description: 'Mock coding interviews, DSA problem walkthroughs, resume critiques, and HR rounds preparation with placed seniors & alumni.',
        category: 'Placement Drive',
        date: new Date(now.getTime() + 8 * day),
        time: '02:00 PM - 06:00 PM',
        venue: 'Seminar Hall 2, Placement Cell',
        maxSeats: 60,
        registeredCount: 0,
        organizer: 'Training & Placement Cell',
        speaker: 'Campus Alumni @ MAANG',
        createdBy: admin._id
      },
      {
        title: 'Generative AI & LLM Systems Engineering Masterclass',
        description: 'Hands-on architectural session on RAG (Retrieval Augmented Generation), LangChain, Vector Embeddings, and local model inference.',
        category: 'Workshop',
        date: new Date(now.getTime() + 20 * day),
        time: '11:00 AM - 03:00 PM',
        venue: 'Advanced AI Lab, Room 402',
        maxSeats: 35,
        registeredCount: 0,
        organizer: 'AI Research Group',
        speaker: 'Dr. Sunita Rao (AI Research Fellow)',
        createdBy: admin._id
      },
      {
        title: 'Cloud Native Microservices & Kubernetes Seminar',
        description: 'Explore containerization with Docker, multi-service orchestration with Kubernetes, CI/CD pipelines, and cloud security best practices.',
        category: 'Seminar',
        date: new Date(now.getTime() + 25 * day),
        time: '01:00 PM - 04:30 PM',
        venue: 'Conference Hall B',
        maxSeats: 80,
        registeredCount: 0,
        organizer: 'Cloud Computing Club',
        speaker: 'DevOps Lead @ CloudSphere',
        createdBy: admin._id
      },
      {
        title: 'CampusFest 2026: Annual Cultural & Tech Extravaganza',
        description: 'Three days of music, competitive programming, robotics exhibitions, gaming tournaments, and live performances.',
        category: 'Cultural',
        date: new Date(now.getTime() + 35 * day),
        time: '10:00 AM - 09:00 PM',
        venue: 'Open Air Amphitheatre',
        maxSeats: 300,
        registeredCount: 0,
        organizer: 'Student Welfare Council',
        speaker: 'Celebrity Guests & Student Council',
        createdBy: admin._id
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);

    console.log('[Seed] Creating Registrations...');
    // Register student1 for Event 0 and Event 1
    await Registration.create({
      event: createdEvents[0]._id,
      student: student1._id,
      status: 'confirmed'
    });
    createdEvents[0].registeredCount += 1;
    await createdEvents[0].save();

    await Registration.create({
      event: createdEvents[1]._id,
      student: student1._id,
      status: 'confirmed'
    });
    createdEvents[1].registeredCount += 1;
    await createdEvents[1].save();

    // Register student2 for Event 0 and Event 2
    await Registration.create({
      event: createdEvents[0]._id,
      student: student2._id,
      status: 'confirmed'
    });
    createdEvents[0].registeredCount += 1;
    await createdEvents[0].save();

    await Registration.create({
      event: createdEvents[2]._id,
      student: student2._id,
      status: 'confirmed'
    });
    createdEvents[2].registeredCount += 1;
    await createdEvents[2].save();

    // Register student3 for Event 1
    await Registration.create({
      event: createdEvents[1]._id,
      student: student3._id,
      status: 'confirmed'
    });
    createdEvents[1].registeredCount += 1;
    await createdEvents[1].save();

    console.log('[Seed] Creating Academic Resources...');
    const resourcesData = [
      {
        title: 'Full Stack Web Development - Complete Lecture Notes & Code Snippets',
        description: 'Comprehensive notes covering Node.js, Express middleware, MongoDB Mongoose models, and React hooks.',
        subject: 'Full Stack Web Development',
        semester: 5,
        category: 'Notes',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'FullStack_Complete_Notes_Sem5.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        downloads: 42,
        uploadedBy: admin._id
      },
      {
        title: 'Full Stack Development - End Term 2024 & 2025 Solved Question Papers',
        description: 'Previous 3 years university question papers with model answers, code solutions, and viva questions.',
        subject: 'Full Stack Web Development',
        semester: 5,
        category: 'Previous Year Paper',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'FSD_PYQ_Solved_2024_2025.pdf',
        fileSize: 1820000,
        fileType: 'application/pdf',
        downloads: 87,
        uploadedBy: admin._id
      },
      {
        title: 'Database Management Systems (DBMS) - Normalization & SQL Cheatsheet',
        description: 'Concise guide to BCNF, 3NF, ER Diagrams, Relational Algebra, indexing mechanisms, and transaction ACID properties.',
        subject: 'Database Management Systems',
        semester: 4,
        category: 'Notes',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'DBMS_Normalization_SQL_Guide.pdf',
        fileSize: 1340000,
        fileType: 'application/pdf',
        downloads: 124,
        uploadedBy: admin._id
      },
      {
        title: 'Operating Systems - Process Synchronization & Scheduling Solved Papers',
        description: 'Detailed analysis of Semaphore problems, Bankers Algorithm, Deadlock prevention, and Virtual Memory paging.',
        subject: 'Operating Systems',
        semester: 4,
        category: 'Previous Year Paper',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'OS_Previous_Year_Solved_Paper.pdf',
        fileSize: 3100000,
        fileType: 'application/pdf',
        downloads: 95,
        uploadedBy: admin._id
      },
      {
        title: 'Data Structures & Algorithms - Trees, Graphs & Dynamic Programming Handbook',
        description: 'Standard interview problems with step-by-step C++ & Java solutions, time complexity derivations.',
        subject: 'Data Structures & Algorithms',
        semester: 3,
        category: 'Notes',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'DSA_Interview_Master_Handbook.pdf',
        fileSize: 4200000,
        fileType: 'application/pdf',
        downloads: 210,
        uploadedBy: admin._id
      },
      {
        title: 'Computer Networks - Socket Programming & Protocol Analysis Lab Manual',
        description: 'Step-by-step laboratory experiment guide for Wireshark packet capture, TCP/UDP client-server sockets.',
        subject: 'Computer Networks',
        semester: 5,
        category: 'Lab Manual',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'CN_Socket_Programming_LabManual.pdf',
        fileSize: 1650000,
        fileType: 'application/pdf',
        downloads: 58,
        uploadedBy: admin._id
      },
      {
        title: 'B.Tech CSE Semester 5 Official Syllabus & Course Outcomes',
        description: 'Accreditation syllabus document detailing unit-wise topics, textbook references, and grading rubrics.',
        subject: 'Curriculum & Scheme',
        semester: 5,
        category: 'Syllabus',
        fileUrl: '/uploads/sample-resource.pdf',
        fileName: 'BTech_CSE_Sem5_Syllabus.pdf',
        fileSize: 850000,
        fileType: 'application/pdf',
        downloads: 130,
        uploadedBy: admin._id
      }
    ];

    await Resource.insertMany(resourcesData);

    console.log('[Seed] Database seeded successfully!');
    console.log('------------------------------------------------------------');
    console.log('Default Credentials:');
    console.log('Admin:   email: admin@campusconnect.edu   | pass: Admin@123');
    console.log('Student: email: student@campusconnect.edu | pass: Student@123');
    console.log('------------------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
