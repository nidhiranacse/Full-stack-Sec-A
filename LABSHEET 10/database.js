import bcrypt from 'bcryptjs'

export function initializeDatabase(db, seed = true) {
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      starts_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      cover_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    );
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      file_name TEXT,
      file_path TEXT,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_resources_subject_semester ON resources(subject, semester);
  `)

  if (!seed || db.prepare('SELECT COUNT(*) AS count FROM users').get().count > 0) return

  const addUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
  addUser.run('Aarav Mehta', 'student@campus.edu', bcrypt.hashSync('Student123!', 10), 'student')
  addUser.run('Campus Admin', 'admin@campus.edu', bcrypt.hashSync('Admin123!', 10), 'admin')

  const addEvent = db.prepare(`
    INSERT INTO events (title, description, category, starts_at, starts_time, venue, capacity, cover_url)
    VALUES (@title, @description, @category, @starts_at, @starts_time, @venue, @capacity, @cover_url)
  `)
  const events = [
    {
      title: 'Build with AI: Prompt to Product',
      description: 'A hands-on studio for turning ideas into useful AI-powered prototypes. Bring a laptop and one problem worth solving.',
      category: 'Workshop', starts_at: '2026-10-08', starts_time: '10:00 AM', venue: 'Innovation Lab, Block C', capacity: 60,
      cover_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85',
    },
    {
      title: 'CodeSprint 24-Hour Hackathon',
      description: 'One day, mixed teams, and a campus-sized challenge. Design, build, and pitch a better student experience.',
      category: 'Hackathon', starts_at: '2026-10-12', starts_time: '09:00 AM', venue: 'Main Auditorium', capacity: 120,
      cover_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=85',
    },
    {
      title: 'Designing for a Greener Campus',
      description: 'Join the sustainability club for a practical design jam on low-waste, low-friction campus life.',
      category: 'Community', starts_at: '2026-10-16', starts_time: '02:30 PM', venue: 'The Commons', capacity: 45,
      cover_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=85',
    },
    {
      title: 'Careers in Product & Technology',
      description: 'Meet early-career product and engineering teams. Get practical advice on portfolios, interviews, and finding your first role.',
      category: 'Career', starts_at: '2026-10-21', starts_time: '11:00 AM', venue: 'Seminar Hall 2', capacity: 80,
      cover_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85',
    },
    {
      title: 'Open Source Contribution Hour',
      description: 'Pick a beginner-friendly issue, pair with a mentor, and make your first contribution to a real open-source project.',
      category: 'Workshop', starts_at: '2026-10-24', starts_time: '04:00 PM', venue: 'Computer Lab 04', capacity: 35,
      cover_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85',
    },
  ]
  db.transaction((rows) => rows.forEach((event) => addEvent.run(event)))(events)

  const addResource = db.prepare('INSERT INTO resources (title, subject, semester, description) VALUES (?, ?, ?, ?)')
  addResource.run('Data Structures · Previous Year Paper', 'Data Structures', 'Semester 3', 'End-semester examination paper with a balanced mix of theory and problems.')
  addResource.run('Database Systems · Revision Notes', 'Database Systems', 'Semester 5', 'A concise guide to relational models, SQL, normalization, and transactions.')
  addResource.run('Operating Systems · Previous Year Paper', 'Operating Systems', 'Semester 4', 'Practice paper covering process scheduling, memory, and file systems.')
  addResource.run('Computer Networks · Quick Reference', 'Computer Networks', 'Semester 5', 'Revision reference for the OSI model, routing, and transport protocols.')
}