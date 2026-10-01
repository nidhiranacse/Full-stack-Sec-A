-- ============================================
-- CampusConnect Database Setup
-- Student Event & Resource Management Portal
-- ============================================

CREATE DATABASE IF NOT EXISTS campus_connect;
USE campus_connect;

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('workshop', 'hackathon', 'seminar', 'placement', 'cultural', 'sports', 'other') DEFAULT 'other',
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    total_seats INT NOT NULL DEFAULT 50,
    available_seats INT NOT NULL DEFAULT 50,
    image_url VARCHAR(500) DEFAULT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 3. Event Registrations Table
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (user_id, event_id)
);

-- ============================================
-- 4. Resources Table
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('notes', 'pyq', 'assignment', 'reference', 'other') DEFAULT 'other',
    subject VARCHAR(100),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Sample Data
-- ============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@campus.com', '$2b$10$dJOPgd9KThedFUlR0Nwvn.pGW5B7sxFesaXpm7ir0ZcBkMpA.5OY.', 'admin');

-- Student users (password: student123)
INSERT INTO users (name, email, password, role) VALUES
('Aarav Sharma', 'aarav@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student'),
('Priya Patel', 'priya@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student'),
('Rohan Gupta', 'rohan@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student'),
('Sneha Reddy', 'sneha@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student');

-- Sample Events
INSERT INTO events (title, description, category, event_date, event_time, venue, total_seats, available_seats, created_by) VALUES
('Web Development Bootcamp', 'A 3-day intensive workshop on modern web development with React, Node.js, and databases. Learn to build full-stack applications from scratch.', 'workshop', '2026-10-15', '09:00:00', 'Computer Lab 3, Block A', 60, 58, 1),
('HackFusion 2026', 'Annual 24-hour hackathon. Build innovative solutions for real-world problems. Amazing prizes and networking opportunities await!', 'hackathon', '2026-10-20', '10:00:00', 'Auditorium Hall, Main Building', 200, 197, 1),
('AI & Machine Learning Seminar', 'Expert talk on the latest trends in AI/ML, career paths, and hands-on demo of building a simple neural network.', 'seminar', '2026-10-08', '14:00:00', 'Seminar Hall 2, Block B', 100, 98, 1),
('TCS Campus Placement Drive', 'TCS is visiting our campus for recruitment. Eligible branches: CSE, IT, ECE. Minimum 7.0 CGPA required.', 'placement', '2026-11-05', '08:30:00', 'Placement Cell, Admin Block', 150, 148, 1),
('Cultural Fest – Resonance 2026', 'Annual cultural festival featuring music, dance, drama, art exhibitions and food stalls. Open to all students.', 'cultural', '2026-11-12', '16:00:00', 'Open Air Theatre', 500, 498, 1),
('Data Structures Workshop', 'Master arrays, linked lists, trees, and graphs with hands-on coding exercises in C++ and Java.', 'workshop', '2026-10-25', '10:00:00', 'Computer Lab 1, Block A', 40, 40, 1),
('Infosys Placement Drive', 'Infosys hiring for SE and DSE roles. Online test followed by interview rounds. All branches eligible with 6.5+ CGPA.', 'placement', '2026-11-18', '09:00:00', 'Placement Cell, Admin Block', 120, 120, 1),
('Cybersecurity Awareness Seminar', 'Learn about ethical hacking, common vulnerabilities, and how to protect your digital identity. Live demo included.', 'seminar', '2026-10-30', '15:00:00', 'Seminar Hall 1, Block C', 80, 80, 1);

-- Sample Registrations
INSERT INTO event_registrations (user_id, event_id) VALUES
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2),
(4, 2), (4, 4),
(5, 3), (5, 4);

-- Update available seats to reflect registrations
UPDATE events SET available_seats = total_seats - (SELECT COUNT(*) FROM event_registrations WHERE event_id = events.id);

-- Sample Resources
INSERT INTO resources (title, description, category, subject, file_url, file_name, uploaded_by) VALUES
('DBMS Unit 1 Notes', 'Comprehensive notes covering ER diagrams, relational model, and normalization.', 'notes', 'Database Management Systems', '/uploads/dbms_unit1_notes.pdf', 'dbms_unit1_notes.pdf', 1),
('OS Previous Year Paper 2025', 'Operating Systems final exam paper from 2025 with solutions.', 'pyq', 'Operating Systems', '/uploads/os_pyq_2025.pdf', 'os_pyq_2025.pdf', 1),
('DSA Assignment 3', 'Assignment on Trees and Graphs – Binary Trees, BST, BFS, DFS.', 'assignment', 'Data Structures & Algorithms', '/uploads/dsa_assignment3.pdf', 'dsa_assignment3.pdf', 1),
('CN Unit 2 Notes', 'Notes on Data Link Layer, Error Detection, Flow Control, and Sliding Window Protocol.', 'notes', 'Computer Networks', '/uploads/cn_unit2_notes.pdf', 'cn_unit2_notes.pdf', 1),
('Web Tech Reference Guide', 'Quick reference for HTML5, CSS3, JavaScript ES6+, and DOM manipulation.', 'reference', 'Web Technologies', '/uploads/webtech_reference.pdf', 'webtech_reference.pdf', 1);
