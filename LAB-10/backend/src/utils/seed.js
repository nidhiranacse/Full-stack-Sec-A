const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate valid sample PDF bytes
const samplePdfContent = Buffer.from(
  '%PDF-1.4\n' +
  '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
  '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
  '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n' +
  '4 0 obj << /Length 45 >> stream\n' +
  'BT /F1 24 Tf 100 700 Td (CampusConnect Study Material) Tj ET\n' +
  'endstream\n' +
  'endobj\n' +
  'xref\n' +
  '0 5\n' +
  '0000000000 65535 f \n' +
  '0000000009 00000 n \n' +
  '0000000058 00000 n \n' +
  '0000000115 00000 n \n' +
  '0000000203 00000 n \n' +
  'trailer << /Size 5 /Root 1 0 R >>\n' +
  'startxref\n' +
  '298\n' +
  '%%EOF'
);

// Sample DOCX mock binary
const sampleDocxContent = Buffer.from('PK\x03\x04CampusConnect Sample DOCX Study Document Content');

function seedDatabase() {
  console.log('--- Starting CampusConnect Database Seeding ---');

  // Clear existing data for fresh clean seed
  db.exec(`
    DELETE FROM registrations;
    DELETE FROM resources;
    DELETE FROM events;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  const passwordHashAdmin = bcrypt.hashSync('Admin@123', 10);
  const passwordHashStudent = bcrypt.hashSync('Student@123', 10);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, department, semester)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run(
    'Dr. Rajesh Sharma (Faculty Admin)',
    'admin@campusconnect.edu',
    passwordHashAdmin,
    'admin',
    'Computer Science & Engineering',
    'Faculty'
  ).lastInsertRowid;

  const student1Id = insertUser.run(
    'Rahul Sharma',
    'rahul.sharma@campusconnect.edu',
    passwordHashStudent,
    'student',
    'Computer Science & Engineering',
    '6th Sem'
  ).lastInsertRowid;

  const student2Id = insertUser.run(
    'Priya Patel',
    'priya.patel@campusconnect.edu',
    passwordHashStudent,
    'student',
    'Information Technology',
    '6th Sem'
  ).lastInsertRowid;

  const student3Id = insertUser.run(
    'Amit Kumar',
    'amit.kumar@campusconnect.edu',
    passwordHashStudent,
    'student',
    'Electronics & Communication',
    '4th Sem'
  ).lastInsertRowid;

  console.log('✓ Users created: 1 Admin, 3 Students');

  // 2. Insert Events (14 events to thoroughly satisfy >10 pagination)
  const insertEvent = db.prepare(`
    INSERT INTO events (title, description, category, date, time, venue, total_seats, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const eventsData = [
    {
      title: 'Full Stack Web Development with MERN & Next.js',
      description: 'Hands-on intensive masterclass covering modern React, Express, MongoDB, Next.js App Router, and production deployments.',
      category: 'Workshop',
      date: '2026-10-15',
      time: '10:00 AM - 04:00 PM',
      venue: 'Lab 4, APJ Abdul Kalam Block',
      total_seats: 60
    },
    {
      title: 'HackIndia 2026: 36-Hour National Hackathon',
      description: 'Annual hackathon with cash prizes over INR 2 Lakhs. Themes include AI in Healthcare, FinTech, EdTech, and Smart Cities.',
      category: 'Hackathon',
      date: '2026-10-22',
      time: '09:00 AM Onwards',
      venue: 'Main Auditorium & Innovation Labs',
      total_seats: 120
    },
    {
      title: 'Google & Microsoft Campus Placement Drive 2026',
      description: 'Pre-placement talk, online technical coding test, and in-person interviews for SDE-1 and Cloud Engineer roles.',
      category: 'Placement Drive',
      date: '2026-10-28',
      time: '08:30 AM - 06:00 PM',
      venue: 'Placement Cell & Seminar Hall 1',
      total_seats: 80
    },
    {
      title: 'Demystifying AI & Generative Agents',
      description: 'Expert keynote by industry researchers exploring Transformer architectures, Autonomous Agents, and Prompt Engineering.',
      category: 'Seminar',
      date: '2026-11-02',
      time: '02:00 PM - 05:00 PM',
      venue: 'Auditorium Hall B',
      total_seats: 150
    },
    {
      title: 'Tantra 2026: Annual Inter-College Technical Symposium',
      description: 'Grand annual tech festival featuring 20+ competitions: RoboWars, Code Sprint, Circuit Debugging, and Project Displays.',
      category: 'Tech Fest',
      date: '2026-11-10',
      time: '09:00 AM - 07:00 PM',
      venue: 'Campus Grounds & Central Quad',
      total_seats: 250
    },
    {
      title: 'Cloud Computing & AWS Architecture Bootcamp',
      description: 'Learn EC2, S3, Lambda serverless, and VPC networking. Includes live sandbox accounts and certification vouchers.',
      category: 'Workshop',
      date: '2026-11-15',
      time: '11:00 AM - 03:00 PM',
      venue: 'Computer Center 2',
      total_seats: 45
    },
    {
      title: 'CyberSecurity CTF: Capture The Flag Championship',
      description: 'Jeopardy-style CTF challenge focusing on web exploitation, cryptography, reverse engineering, and binary security.',
      category: 'Hackathon',
      date: '2026-11-20',
      time: '10:00 AM - 06:00 PM',
      venue: 'Cyber Security Lab',
      total_seats: 50
    },
    {
      title: 'Amazon & Atlassian Placement Preparation Drive',
      description: 'Mock technical coding interviews, system design fundamentals, and behavioral HR rounds guided by alumni engineers.',
      category: 'Placement Drive',
      date: '2026-11-25',
      time: '09:30 AM - 04:30 PM',
      venue: 'Training & Placement Hall 2',
      total_seats: 75
    },
    {
      title: 'Microservices with Docker and Kubernetes Hands-on',
      description: 'Containerization, cluster configuration, Helm charts, and continuous deployment workflows explained step-by-step.',
      category: 'Workshop',
      date: '2026-12-01',
      time: '10:00 AM - 02:00 PM',
      venue: 'High Performance Computing Lab',
      total_seats: 40
    },
    {
      title: 'Data Science and Deep Learning with PyTorch',
      description: 'Practical training on computer vision, CNNs, image classification, and transfer learning models using Python and PyTorch.',
      category: 'Workshop',
      date: '2026-12-05',
      time: '01:00 PM - 05:00 PM',
      venue: 'Lab 3, CSE Department',
      total_seats: 55
    },
    {
      title: 'Blockchain & Web3 Decentralized Apps Summit',
      description: 'Deep dive into Ethereum smart contracts, Solidity, IPFS, and building zero-knowledge decentralized identity systems.',
      category: 'Seminar',
      date: '2026-12-10',
      time: '02:00 PM - 05:30 PM',
      venue: 'Conference Room 101',
      total_seats: 90
    },
    {
      title: 'AlgoSprint: Speed Coding Challenge',
      description: 'Competitive programming sprint solving dynamic programming, graphs, and greedy algorithms within 90 minutes.',
      category: 'Hackathon',
      date: '2026-12-14',
      time: '04:00 PM - 06:30 PM',
      venue: 'Online & Lab 1',
      total_seats: 100
    },
    {
      title: 'TCS & Infosys Core Campus Hiring Drive',
      description: 'National Qualifier Test (NQT) screening, digital aptitude rounds, and technical interview panels for final year students.',
      category: 'Placement Drive',
      date: '2026-12-18',
      time: '08:00 AM - 05:00 PM',
      venue: 'Auditorium Complex',
      total_seats: 200
    },
    {
      title: 'Robotics & IoT Smart Campus Expo',
      description: 'Showcase of automated drones, smart campus navigation bots, and embedded micro-controller projects with industry sponsors.',
      category: 'Tech Fest',
      date: '2026-12-22',
      time: '10:00 AM - 05:00 PM',
      venue: 'Mechanical & Robotics Bay',
      total_seats: 180
    }
  ];

  const createdEventIds = [];
  for (const ev of eventsData) {
    const res = insertEvent.run(
      ev.title,
      ev.description,
      ev.category,
      ev.date,
      ev.time,
      ev.venue,
      ev.total_seats,
      adminId
    );
    createdEventIds.push(res.lastInsertRowid);
  }
  console.log(`✓ Events created: ${createdEventIds.length} events seeded`);

  // 3. Insert Registrations
  const insertReg = db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)');
  insertReg.run(student1Id, createdEventIds[0]); // Rahul -> MERN Workshop
  insertReg.run(student1Id, createdEventIds[1]); // Rahul -> HackIndia
  insertReg.run(student1Id, createdEventIds[2]); // Rahul -> Placement Drive
  insertReg.run(student2Id, createdEventIds[0]); // Priya -> MERN Workshop
  insertReg.run(student2Id, createdEventIds[3]); // Priya -> AI Seminar
  insertReg.run(student3Id, createdEventIds[1]); // Amit -> HackIndia
  insertReg.run(student3Id, createdEventIds[4]); // Amit -> Tantra Tech Fest
  console.log('✓ Initial registrations created');

  // 4. Create Sample Upload Files and Study Resources
  const sampleResources = [
    {
      title: 'Data Structures & Algorithms - Complete Lecture Notes',
      description: 'Trees, Graphs, Sorting algorithms, Big-O complexity analysis and pseudocode implementations.',
      subject: 'Data Structures and Algorithms',
      semester: '3rd Sem',
      category: 'Notes',
      fileName: 'DSA_Lecture_Notes_Unit1_5.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Computer Networks - End Semester Question Paper 2025',
      description: 'Previous year question paper with solutions for TCP/IP, OSI layers, Congestion Control, and Subnetting.',
      subject: 'Computer Networks',
      semester: '5th Sem',
      category: 'Previous Year Paper',
      fileName: 'CN_EndSem_Paper_2025_Solved.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Operating Systems - Lab Manual with UNIX Shell Scripts',
      description: 'Complete lab experiments: Process scheduling, semaphore synchronization, memory paging, and bash scripting.',
      subject: 'Operating Systems',
      semester: '4th Sem',
      category: 'Lab Manual',
      fileName: 'OS_Lab_Manual_Experiments.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: sampleDocxContent
    },
    {
      title: 'Database Management Systems - Normalization & SQL Cheatsheet',
      description: 'Quick reference guide for 1NF, 2NF, 3NF, BCNF, ACID properties, indexing, and complex JOIN queries.',
      subject: 'Database Systems',
      semester: '4th Sem',
      category: 'Reference Material',
      fileName: 'DBMS_SQL_Normalization_Guide.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Design & Analysis of Algorithms - Solved 5-Year PYQs',
      description: 'Master theorem, divide and conquer, dynamic programming solutions from past 5 years university exams.',
      subject: 'Design & Analysis of Algorithms',
      semester: '5th Sem',
      category: 'Previous Year Paper',
      fileName: 'DAA_5Year_Solved_PYQ.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Software Engineering - Agile & UML Design Models',
      description: 'Scrum framework, user stories, Sprint planning, Class diagrams, Sequence diagrams, and testing methodologies.',
      subject: 'Software Engineering',
      semester: '6th Sem',
      category: 'Notes',
      fileName: 'Software_Engineering_UML_Notes.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Compiler Design - Parsing Algorithms & Syntax Trees',
      description: 'LL(1), LR(0), SLR(1), LALR parsing tables, syntax directed translation, and intermediate code generation.',
      subject: 'Compiler Design',
      semester: '6th Sem',
      category: 'Notes',
      fileName: 'Compiler_Design_Syntax_Trees.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Machine Learning - Mathematics & Model Derivations',
      description: 'Linear regression, logistic regression, SVMs, backpropagation derivations, and evaluation metrics.',
      subject: 'Machine Learning',
      semester: '7th Sem',
      category: 'Reference Material',
      fileName: 'ML_Math_Derivations_Guide.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    },
    {
      title: 'Cloud Computing - AWS Architecture Reference Guide',
      description: 'Well-Architected framework, high availability patterns, serverless microservices, and cost optimization.',
      subject: 'Cloud Computing',
      semester: '7th Sem',
      category: 'Reference Material',
      fileName: 'AWS_Cloud_Architecture_Handbook.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: sampleDocxContent
    },
    {
      title: 'Web Technologies - Full Stack Lab Exercises with Solutions',
      description: 'HTML5, CSS3, ES6+, Express routes, REST APIs, and React component state management lab practicals.',
      subject: 'Web Technologies',
      semester: '6th Sem',
      category: 'Lab Manual',
      fileName: 'FullStack_Web_Lab_Solutions.pdf',
      mimeType: 'application/pdf',
      content: samplePdfContent
    }
  ];

  const insertResource = db.prepare(`
    INSERT INTO resources (
      title, description, subject, semester, category,
      file_name, original_name, file_path, file_size, file_type, uploaded_by, download_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const res of sampleResources) {
    const physicalFileName = `sample-${Date.now()}-${res.fileName}`;
    const physicalFilePath = path.join(uploadDir, physicalFileName);

    fs.writeFileSync(physicalFilePath, res.content);

    insertResource.run(
      res.title,
      res.description,
      res.subject,
      res.semester,
      res.category,
      physicalFileName,
      res.fileName,
      physicalFilePath,
      res.content.length,
      res.mimeType,
      adminId,
      Math.floor(Math.random() * 45) + 5
    );
  }

  console.log(`✓ Resources created: ${sampleResources.length} files saved and seeded`);
  console.log('--- Seeding Completed Successfully ---');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
