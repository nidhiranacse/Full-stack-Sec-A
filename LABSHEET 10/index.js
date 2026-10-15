import 'dotenv/config'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { initializeDatabase } from './database.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(here, 'uploads')
const jwtSecret = process.env.JWT_SECRET || 'local-campus-connect-secret-change-me'
mkdirSync(uploadsDir, { recursive: true })

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function createPdf(title, description) {
  const clean = (value) => String(value).replace(/[^\x20-\x7E]/g, '').replace(/[()\\]/g, '\\$&').slice(0, 110)
  const lines = [clean(title), clean(description || 'Shared campus learning resource')]
  const stream = `BT /F1 18 Tf 48 740 Td (${lines[0]}) Tj 0 -32 Td /F1 11 Tf (${lines[1]}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xrefOffset = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf)
}

export function createApp(db) {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use('/uploads', express.static(uploadsDir))

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  })

  const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' })
    try {
      req.user = jwt.verify(token, jwtSecret)
      return next()
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
    }
  }
  const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Administrator access is required.' })
    return next()
  }
  const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
  const eventSelect = `
    SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registration_count
    FROM events e
  `

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

  app.post('/api/auth/signup', asyncRoute(async (req, res) => {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return res.status(409).json({ error: 'An account with that email already exists.' })
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, await bcrypt.hash(password, 10))
    const user = { id: result.lastInsertRowid, name, email, role: 'student' }
    return res.status(201).json({ token: jwt.sign(user, jwtSecret, { expiresIn: '8h' }), user })
  }))

  app.post('/api/auth/login', loginLimiter, asyncRoute(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' })
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    return res.json({ token: jwt.sign(safeUser, jwtSecret, { expiresIn: '8h' }), user: safeUser })
  }))

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id)
    if (!user) return res.status(401).json({ error: 'Account not found.' })
    return res.json({ user })
  })

  app.get('/api/events', (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10))
    const filters = []
    const params = {}
    if (req.query.search) {
      filters.push('(e.title LIKE @search OR e.description LIKE @search OR e.category LIKE @search)')
      params.search = `%${String(req.query.search).slice(0, 100)}%`
    }
    if (req.query.category && req.query.category !== 'All events') {
      filters.push('e.category = @category')
      params.category = String(req.query.category)
    }
    if (req.query.dateFrom) {
      filters.push('e.starts_at >= @dateFrom')
      params.dateFrom = String(req.query.dateFrom)
    }
    if (req.query.dateTo) {
      filters.push('e.starts_at <= @dateTo')
      params.dateTo = String(req.query.dateTo)
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const total = db.prepare(`SELECT COUNT(*) AS count FROM events e ${where}`).get(params).count
    const events = db.prepare(`${eventSelect} ${where} ORDER BY e.starts_at, e.id LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset: (page - 1) * limit })
    return res.json({ events, page, limit, total, pages: Math.ceil(total / limit) })
  })

  app.post('/api/events', requireAuth, requireAdmin, (req, res) => {
    const { title, description, category, startsAt, startsTime, venue } = req.body
    const capacity = Number(req.body.capacity)
    if (!title?.trim() || !description?.trim() || !category?.trim() || !startsAt || !startsTime || !venue?.trim()) {
      return res.status(400).json({ error: 'Complete all event fields.' })
    }
    if (!isValidDate(startsAt)) return res.status(400).json({ error: 'Choose a valid event date.' })
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 5000) return res.status(400).json({ error: 'Capacity must be between 1 and 5000.' })
    const result = db.prepare(`
      INSERT INTO events (title, description, category, starts_at, starts_time, venue, capacity, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title.trim(), description.trim(), category.trim(), startsAt, startsTime, venue.trim(), capacity, String(req.body.coverUrl || '').trim())
    return res.status(201).json({ event: db.prepare(`${eventSelect} WHERE e.id = ?`).get(result.lastInsertRowid) })
  })

  app.patch('/api/events/:id', requireAuth, requireAdmin, (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found.' })
    const fields = {
      title: req.body.title ?? event.title,
      description: req.body.description ?? event.description,
      category: req.body.category ?? event.category,
      starts_at: req.body.startsAt ?? event.starts_at,
      starts_time: req.body.startsTime ?? event.starts_time,
      venue: req.body.venue ?? event.venue,
      capacity: req.body.capacity ?? event.capacity,
      cover_url: req.body.coverUrl ?? event.cover_url,
    }
    const requiredText = [fields.title, fields.description, fields.category, fields.starts_time, fields.venue]
    if (!requiredText.every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ error: 'Complete all event fields.' })
    if (fields.title.length > 120 || fields.description.length > 2000) return res.status(400).json({ error: 'Event title or description is too long.' })
    if (!isValidDate(fields.starts_at)) return res.status(400).json({ error: 'Choose a valid event date.' })
    const capacity = Number(fields.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 5000) return res.status(400).json({ error: 'Capacity must be between 1 and 5000.' })
    const registered = db.prepare('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?').get(event.id).count
    if (capacity < registered) return res.status(409).json({ error: 'Capacity cannot be lower than the number of registrations.' })
    db.prepare(`UPDATE events SET title=@title, description=@description, category=@category, starts_at=@starts_at,
      starts_time=@starts_time, venue=@venue, capacity=@capacity, cover_url=@cover_url WHERE id=@id`)
      .run({ ...fields, capacity, id: event.id })
    return res.json({ event: db.prepare(`${eventSelect} WHERE e.id = ?`).get(event.id) })
  })

  app.delete('/api/events/:id', requireAuth, requireAdmin, (req, res) => {
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Event not found.' })
    return res.status(204).end()
  })

  app.post('/api/events/:id/register', requireAuth, (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found.' })
    const result = db.transaction(() => {
      const existing = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(req.user.id, event.id)
      if (existing) return { error: 'You are already registered for this event.', status: 409 }
      const count = db.prepare('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?').get(event.id).count
      if (count >= event.capacity) return { error: 'This event is fully booked.', status: 409 }
      db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(req.user.id, event.id)
      return { ok: true }
    })()
    if (result.error) return res.status(result.status).json({ error: result.error })
    return res.status(201).json({ message: 'You are registered. See you there!' })
  })

  app.delete('/api/events/:id/register', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM registrations WHERE user_id = ? AND event_id = ?').run(req.user.id, req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'You are not registered for this event.' })
    return res.status(204).end()
  })

  app.get('/api/registrations/mine', requireAuth, (req, res) => {
    const registrations = db.prepare(`
      SELECT e.*, r.created_at AS registered_at, (SELECT COUNT(*) FROM registrations all_regs WHERE all_regs.event_id = e.id) AS registration_count
      FROM registrations r JOIN events e ON e.id = r.event_id WHERE r.user_id = ? ORDER BY e.starts_at
    `).all(req.user.id)
    return res.json({ registrations })
  })

  app.get('/api/events/:id/registrations', requireAuth, requireAdmin, (req, res) => {
    const event = db.prepare('SELECT id, title FROM events WHERE id = ?').get(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found.' })
    const registrations = db.prepare(`
      SELECT u.id, u.name, u.email, r.created_at AS registered_at
      FROM registrations r JOIN users u ON u.id = r.user_id WHERE r.event_id = ? ORDER BY r.created_at DESC
    `).all(event.id)
    return res.json({ event, registrations })
  })

  app.get('/api/resources', (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10))
    const clauses = []
    const params = {}
    if (req.query.search) {
      clauses.push('(title LIKE @search OR subject LIKE @search OR description LIKE @search)')
      params.search = `%${String(req.query.search).slice(0, 100)}%`
    }
    if (req.query.subject) {
      clauses.push('subject = @subject')
      params.subject = String(req.query.subject)
    }
    if (req.query.semester) {
      clauses.push('semester = @semester')
      params.semester = String(req.query.semester)
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const total = db.prepare(`SELECT COUNT(*) AS count FROM resources ${where}`).get(params).count
    const resources = db.prepare(`SELECT id, title, subject, semester, description, file_name, created_at FROM resources ${where} ORDER BY created_at DESC, id DESC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset: (page - 1) * limit })
    return res.json({ resources, page, limit, total, pages: Math.ceil(total / limit) })
  })

  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
  })
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      const validExtension = /\.(pdf|docx)$/i.test(file.originalname)
      const validMime = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)
      callback(validExtension && validMime ? null : new Error('Upload a PDF or DOCX file.'), validExtension && validMime)
    },
  })

  app.post('/api/resources', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
    const { title, subject, semester, description = '' } = req.body
    if (!title?.trim() || !subject?.trim() || !semester?.trim()) {
      if (req.file) unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Title, subject, and semester are required.' })
    }
    if (!req.file) return res.status(400).json({ error: 'Choose a PDF or DOCX file to upload.' })
    const result = db.prepare(`INSERT INTO resources (title, subject, semester, description, file_name, file_path, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(title.trim(), subject.trim(), semester.trim(), description.trim(), req.file.originalname, req.file.filename, req.user.id)
    return res.status(201).json({ resource: db.prepare('SELECT id, title, subject, semester, description, file_name, created_at FROM resources WHERE id = ?').get(result.lastInsertRowid) })
  })

  app.get('/api/resources/:id/download', (req, res) => {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)
    if (!resource) return res.status(404).json({ error: 'Resource not found.' })
    if (resource.file_path && existsSync(path.join(uploadsDir, resource.file_path))) return res.download(path.join(uploadsDir, resource.file_path), resource.file_name)
    const filename = `${resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
    res.type('application/pdf').attachment(filename).send(createPdf(resource.title, resource.description))
  })

  app.delete('/api/resources/:id', requireAuth, requireAdmin, (req, res) => {
    const resource = db.prepare('SELECT file_path FROM resources WHERE id = ?').get(req.params.id)
    if (!resource) return res.status(404).json({ error: 'Resource not found.' })
    db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id)
    if (resource.file_path && existsSync(path.join(uploadsDir, resource.file_path))) unlinkSync(path.join(uploadsDir, resource.file_path))
    return res.status(204).end()
  })

  app.get('/api/admin/analytics', requireAuth, requireAdmin, (_req, res) => {
    const totalEvents = db.prepare('SELECT COUNT(*) AS count FROM events').get().count
    const totalRegistrations = db.prepare('SELECT COUNT(*) AS count FROM registrations').get().count
    const totalStudents = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student'").get().count
    const nextEvents = db.prepare(`${eventSelect} ORDER BY e.starts_at LIMIT 5`).all()
    return res.json({ totalEvents, totalRegistrations, totalStudents, nextEvents })
  })

  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Files must be smaller than 10 MB.' : err.message })
    if (err.message === 'Upload a PDF or DOCX file.') return res.status(400).json({ error: err.message })
    console.error(err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  })

  return app
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dataDir = path.join(here, 'data')
  mkdirSync(dataDir, { recursive: true })
  const db = new Database(path.join(dataDir, 'campusconnect.sqlite'))
  initializeDatabase(db)
  const port = Number(process.env.PORT) || 4000
  createServer(createApp(db)).listen(port, () => console.log(`CampusConnect API listening on http://localhost:${port}`))
}