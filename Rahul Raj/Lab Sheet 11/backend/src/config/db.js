/**
 * CampusConnect Database Configuration & Schema Manager
 * Lab Sheet 11 - Full Stack Event & Resource Management Portal
 * Supports Node.js native SQLite (DatabaseSync) with persistent file storage and auto-seeding
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let db;
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.join(dbDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'campusconnect.sqlite');

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
} catch (err) {
  console.warn('Native node:sqlite not available, falling back to memory shim:', err.message);
  // Fallback memory database if node:sqlite is absent in an older runtime
}

function initDatabase() {
  if (!db) return;

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      department TEXT DEFAULT 'Computer Science & Engineering',
      semester TEXT DEFAULT 'Semester 6',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Workshop', 'Hackathon', 'Placement Drive', 'Seminar')),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      maxSeats INTEGER NOT NULL DEFAULT 50,
      createdBy INTEGER REFERENCES users(id),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Event Registrations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(eventId, userId)
    );
  `);

  // Academic Resources Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      fileType TEXT NOT NULL CHECK(fileType IN ('pdf', 'docx')),
      fileName TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      filePath TEXT,
      downloadCount INTEGER DEFAULT 0,
      uploadedBy INTEGER REFERENCES users(id),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for query performance optimization
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
    CREATE INDEX IF NOT EXISTS idx_resources_semester ON resources(semester);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(eventId);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(userId);
  `);

  // Seed sample files if missing
  seedSampleFiles();

  // Seed data if empty
  seedData();
}

function seedSampleFiles() {
  const samplePdfs = [
    {
      name: 'FullStack_Unit1_React_Architecture.pdf',
      content: '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF\nCampusConnect Resource: Full Stack Development - React Architecture & Hooks (Lab Sheet 11 Reference Notes)'
    },
    {
      name: 'CloudComputing_AWS_Docker_Notes.pdf',
      content: '%PDF-1.4\nCampusConnect Academic Notes: Cloud Computing, Virtualization, and Container Orchestration.'
    },
    {
      name: 'OS_Process_Synchronization_PyQ.pdf',
      content: '%PDF-1.4\nCampusConnect Academic Notes: Operating Systems Previous Year Questions & Semaphores Reference.'
    }
  ];

  samplePdfs.forEach(file => {
    const fPath = path.join(uploadsDir, file.name);
    if (!fs.existsSync(fPath)) {
      fs.writeFileSync(fPath, file.content, 'utf-8');
    }
  });

  const sampleDocx = [
    {
      name: 'Placement_Drive_Technical_Interview_Guide.docx',
      content: 'PK\x03\x04CampusConnect Document: Technical Interview Prep Guide & DSA Patterns (B.Tech CSE 3rd Year)'
    },
    {
      name: 'DBMS_Normalization_CheatSheet.docx',
      content: 'PK\x03\x04CampusConnect Document: Database Management Systems - 1NF, 2NF, 3NF, BCNF Normalization Formulas'
    }
  ];

  sampleDocx.forEach(file => {
    const fPath = path.join(uploadsDir, file.name);
    if (!fs.existsSync(fPath)) {
      fs.writeFileSync(fPath, file.content, 'utf-8');
    }
  });
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const hashAdmin = bcrypt.hashSync('Admin@123', 10);
    const hashStudent = bcrypt.hashSync('Student@123', 10);
    const hashRahul = bcrypt.hashSync('Rahul@123', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, department, semester)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('Dr. Ananya Sharma (Admin)', 'admin@campus.edu', hashAdmin, 'admin', 'Computer Science & Engineering', 'Faculty');
    insertUser.run('Rahul Raj', 'rahul.raj@cuchd.in', hashRahul, 'student', 'Computer Science & Engineering (Sec-A)', 'Semester 6');
    insertUser.run('Student Demo', 'student@campus.edu', hashStudent, 'student', 'Computer Science & Engineering', 'Semester 6');
    insertUser.run('Priya Nair', 'priya.nair@campus.edu', hashStudent, 'student', 'Information Technology', 'Semester 6');
    insertUser.run('Aarav Mehta', 'aarav.mehta@campus.edu', hashStudent, 'student', 'Computer Science & Engineering', 'Semester 5');
  }

  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  if (eventCount === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, description, category, date, time, venue, maxSeats, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    // Pre-seed 12+ events so pagination (>10 items per page) is demonstrable immediately!
    const seedEvents = [
      {
        title: 'Full Stack Web Development Workshop: MERN & Next.js',
        description: 'Hands-on intensive masterclass on modern full-stack architectures, server actions, REST APIs, and state management.',
        category: 'Workshop',
        date: '2026-10-05',
        time: '10:00 AM - 01:00 PM',
        venue: 'Seminar Hall 3, Block B',
        maxSeats: 60
      },
      {
        title: 'HackCampus 2026: 36-Hour National Hackathon',
        description: 'Annual flagship hackathon solving real-world challenges across FinTech, HealthTech, EdTech, and AI/Web3 with cash prizes.',
        category: 'Hackathon',
        date: '2026-10-12',
        time: '09:00 AM - 09:00 PM (Next Day)',
        venue: 'Auditorium Complex & Innovation Hub',
        maxSeats: 120
      },
      {
        title: 'Google & Microsoft Campus Placement Drive Orientation',
        description: 'Comprehensive roadmap for coding rounds, system design interviews, and behavioral rounds with alumni mentors.',
        category: 'Placement Drive',
        date: '2026-10-18',
        time: '02:00 PM - 05:00 PM',
        venue: 'Placement Cell Auditorium',
        maxSeats: 150
      },
      {
        title: 'Cloud & DevOps Masterclass: Docker, K8s & AWS Cloud',
        description: 'Deploy resilient containerized web applications using Docker, Kubernetes clusters, and automated CI/CD pipelines.',
        category: 'Workshop',
        date: '2026-10-22',
        time: '11:00 AM - 02:00 PM',
        venue: 'Advanced Computing Lab 502',
        maxSeats: 45
      },
      {
        title: 'AI & Generative Models Technical Seminar',
        description: 'Deep dive into Transformer architectures, prompt engineering, fine-tuning LLMs, and agentic workflows.',
        category: 'Seminar',
        date: '2026-10-26',
        time: '03:00 PM - 05:30 PM',
        venue: 'Main Audio-Visual Room 101',
        maxSeats: 80
      },
      {
        title: 'CyberSecurity & Ethical Hacking Bootcamp',
        description: 'Hands-on CTF challenges, web application penetration testing (OWASP Top 10), and vulnerability assessment.',
        category: 'Workshop',
        date: '2026-11-02',
        time: '10:00 AM - 01:30 PM',
        venue: 'Cyber Forensics Lab 404',
        maxSeats: 40
      },
      {
        title: 'Amazon & Oracle Mock Interview & Coding Contest',
        description: 'Timed live competitive programming contest followed by peer interviews and 1-on-1 resume feedback.',
        category: 'Placement Drive',
        date: '2026-11-08',
        time: '01:00 PM - 06:00 PM',
        venue: 'Central Placement Lab A & B',
        maxSeats: 100
      },
      {
        title: 'CodeSprint 2026: Algorithmic Showdown',
        description: 'Speed programming contest focused on graph algorithms, dynamic programming, and mathematical problem solving.',
        category: 'Hackathon',
        date: '2026-11-15',
        time: '10:00 AM - 04:00 PM',
        venue: 'Turing Hall, IT Wing',
        maxSeats: 75
      },
      {
        title: 'System Design for High Scale Web Platforms',
        description: 'Architecture patterns for caching (Redis), message queues (Kafka), load balancing, and database sharding.',
        category: 'Seminar',
        date: '2026-11-20',
        time: '02:30 PM - 05:00 PM',
        venue: 'Conference Hall A',
        maxSeats: 60
      },
      {
        title: 'UI/UX Design Sprint: Figma to Production Code',
        description: 'Translating design tokens, responsive typography, WCAG accessibility, and component libraries into clean React apps.',
        category: 'Workshop',
        date: '2026-11-25',
        time: '10:00 AM - 01:00 PM',
        venue: 'Design Studio 203',
        maxSeats: 35
      },
      {
        title: 'FinTech Innovation Challenge: Open Banking APIs',
        description: 'Create innovative payment routing, fraud detection, and micro-investment tools utilizing modern open banking protocols.',
        category: 'Hackathon',
        date: '2026-12-01',
        time: '09:00 AM - 06:00 PM',
        venue: 'FinTech Lab, Block C',
        maxSeats: 50
      },
      {
        title: 'TCS Digital & Infosys Power Programmer Drive Prep',
        description: 'Special technical session covering advanced problem solving, aptitude screenings, and managerial round preparation.',
        category: 'Placement Drive',
        date: '2026-12-07',
        time: '02:00 PM - 04:30 PM',
        venue: 'Auditorium 2',
        maxSeats: 120
      },
      {
        title: 'Quantum Computing Fundamentals & Qiskit',
        description: 'Exploring quantum gates, superposition, entanglement, and running algorithms on real quantum hardware simulators.',
        category: 'Seminar',
        date: '2026-12-14',
        time: '11:00 AM - 01:00 PM',
        venue: 'Physics & Computing Arena',
        maxSeats: 50
      }
    ];

    seedEvents.forEach(ev => {
      insertEvent.run(ev.title, ev.description, ev.category, ev.date, ev.time, ev.venue, ev.maxSeats);
    });

    // Seed registrations
    const insertReg = db.prepare('INSERT INTO registrations (eventId, userId) VALUES (?, ?)');
    insertReg.run(1, 2); // Rahul registered for Workshop 1
    insertReg.run(2, 2); // Rahul registered for Hackathon
    insertReg.run(3, 2); // Rahul registered for Placement Drive
    insertReg.run(1, 4); // Priya registered
    insertReg.run(2, 4); // Priya registered
    insertReg.run(1, 5); // Aarav registered
  }

  const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
  if (resourceCount === 0) {
    const insertResource = db.prepare(`
      INSERT INTO resources (title, description, subject, semester, fileType, fileName, fileSize, filePath, downloadCount, uploadedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    // Pre-seed 12+ resources across subjects and semesters with both PDF and DOCX formats
    const seedResources = [
      {
        title: 'Full Stack Web Development - Complete Lecture Notes & React State Lab',
        description: 'Comprehensive guide covering component lifecycle, custom hooks, React Router v6, and Axios interceptors.',
        subject: 'Full Stack Development',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'FullStack_Unit1_React_Architecture.pdf',
        fileSize: '3.4 MB',
        filePath: 'uploads/FullStack_Unit1_React_Architecture.pdf',
        downloadCount: 42
      },
      {
        title: 'Placement Technical Interview Guide & DSA Pattern CheatSheet',
        description: 'Two pointers, sliding window, binary tree traversals, and dynamic programming top 75 interview patterns.',
        subject: 'Placement Drive',
        semester: 'Semester 6',
        fileType: 'docx',
        fileName: 'Placement_Drive_Technical_Interview_Guide.docx',
        fileSize: '1.8 MB',
        filePath: 'uploads/Placement_Drive_Technical_Interview_Guide.docx',
        downloadCount: 88
      },
      {
        title: 'Operating Systems - Process Scheduling & Semaphores Notes + PyQ',
        description: 'Past 5 years solved university question papers on Banker\'s algorithm, mutex locks, and paging tables.',
        subject: 'Operating Systems',
        semester: 'Semester 5',
        fileType: 'pdf',
        fileName: 'OS_Process_Synchronization_PyQ.pdf',
        fileSize: '4.2 MB',
        filePath: 'uploads/OS_Process_Synchronization_PyQ.pdf',
        downloadCount: 65
      },
      {
        title: 'Cloud Computing & Virtualization - Docker, Kubernetes & AWS Architecture',
        description: 'Complete architecture blueprints for microservices deployment, VPC networking, and S3 IAM policies.',
        subject: 'Cloud Computing',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'CloudComputing_AWS_Docker_Notes.pdf',
        fileSize: '5.1 MB',
        filePath: 'uploads/CloudComputing_AWS_Docker_Notes.pdf',
        downloadCount: 39
      },
      {
        title: 'Database Management Systems - Relational Algebra & Normalization Formulae',
        description: 'Step-by-step mathematical decomposition for 1NF, 2NF, 3NF, and Boyce-Codd Normal Form with solved examples.',
        subject: 'Data Structures & DBMS',
        semester: 'Semester 5',
        fileType: 'docx',
        fileName: 'DBMS_Normalization_CheatSheet.docx',
        fileSize: '1.2 MB',
        filePath: 'uploads/DBMS_Normalization_CheatSheet.docx',
        downloadCount: 54
      },
      {
        title: 'Full Stack Lab Sheet 11 Practice Problem Reference Solution & Architecture',
        description: 'Complete architectural specification, ER diagram schemas, and API documentation for CampusConnect.',
        subject: 'Full Stack Development',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'FullStack_Unit1_React_Architecture.pdf',
        fileSize: '2.9 MB',
        filePath: 'uploads/FullStack_Unit1_React_Architecture.pdf',
        downloadCount: 97
      },
      {
        title: 'Artificial Intelligence - Search Algorithms & Neural Network Foundations',
        description: 'A* search, minimax with alpha-beta pruning, backpropagation derivations, and activation functions.',
        subject: 'Artificial Intelligence',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'FullStack_Unit1_React_Architecture.pdf',
        fileSize: '4.8 MB',
        filePath: 'uploads/FullStack_Unit1_React_Architecture.pdf',
        downloadCount: 31
      },
      {
        title: 'Data Structures - Graph Algorithms & Minimum Spanning Tree Implementation',
        description: 'Kruskal\'s, Prim\'s, Dijkstra\'s algorithm implementations and asymptotic space-time complexity analysis.',
        subject: 'Data Structures & DBMS',
        semester: 'Semester 5',
        fileType: 'docx',
        fileName: 'Placement_Drive_Technical_Interview_Guide.docx',
        fileSize: '2.1 MB',
        filePath: 'uploads/Placement_Drive_Technical_Interview_Guide.docx',
        downloadCount: 46
      },
      {
        title: 'Computer Networks - OSI Layer Protocols & TCP Handshake Deep Dive',
        description: 'Wireshark packet capture analysis, subnetting calculations (CIDR), and DNS query resolution flow.',
        subject: 'Computer Networks',
        semester: 'Semester 5',
        fileType: 'pdf',
        fileName: 'CloudComputing_AWS_Docker_Notes.pdf',
        fileSize: '3.7 MB',
        filePath: 'uploads/CloudComputing_AWS_Docker_Notes.pdf',
        downloadCount: 28
      },
      {
        title: 'Software Engineering - Agile Scrum Artifacts & UML Class Diagrams',
        description: 'Design patterns (Singleton, Factory, Observer), sequence diagrams, and SRS template documentation.',
        subject: 'Full Stack Development',
        semester: 'Semester 6',
        fileType: 'docx',
        fileName: 'DBMS_Normalization_CheatSheet.docx',
        fileSize: '1.5 MB',
        filePath: 'uploads/DBMS_Normalization_CheatSheet.docx',
        downloadCount: 22
      },
      {
        title: 'Compiler Design - Lexical Analysis & LL(1) / LR(0) Parsing Tables',
        description: 'Automata construction (DFA/NFA), grammar ambiguity resolution, and three-address code generation.',
        subject: 'Computer Science Core',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'OS_Process_Synchronization_PyQ.pdf',
        fileSize: '3.1 MB',
        filePath: 'uploads/OS_Process_Synchronization_PyQ.pdf',
        downloadCount: 19
      },
      {
        title: 'Cyber Security & Cryptography - RSA, AES & Digital Signatures',
        description: 'Public-key cryptography, Diffie-Hellman key exchange, SHA-256 hashing, and SSL/TLS handshakes.',
        subject: 'Information Security',
        semester: 'Semester 6',
        fileType: 'pdf',
        fileName: 'CloudComputing_AWS_Docker_Notes.pdf',
        fileSize: '4.0 MB',
        filePath: 'uploads/CloudComputing_AWS_Docker_Notes.pdf',
        downloadCount: 35
      }
    ];

    seedResources.forEach(res => {
      insertResource.run(
        res.title,
        res.description,
        res.subject,
        res.semester,
        res.fileType,
        res.fileName,
        res.fileSize,
        res.filePath,
        res.downloadCount
      );
    });
  }
}

initDatabase();

module.exports = {
  db,
  uploadsDir,
  initDatabase
};
