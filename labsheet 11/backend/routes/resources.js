// ============================================
// Resource Routes - Upload & Download Study Materials
// ============================================
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalname
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, TXT, and ZIP files are allowed.'));
        }
    }
});

// ---- GET /api/resources ----
// Get all resources with optional filtering
router.get('/', async (req, res) => {
    try {
        const { category, subject, search, page = 1, limit = 12 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `SELECT r.*, u.name as uploader_name FROM resources r 
                     LEFT JOIN users u ON r.uploaded_by = u.id WHERE 1=1`;
        let countQuery = 'SELECT COUNT(*) as total FROM resources WHERE 1=1';
        const params = [];
        const countParams = [];

        if (search) {
            query += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.subject LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ? OR subject LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (category && category !== 'all') {
            query += ' AND r.category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
            countParams.push(category);
        }

        if (subject) {
            query += ' AND r.subject LIKE ?';
            countQuery += ' AND subject LIKE ?';
            params.push(`%${subject}%`);
            countParams.push(`%${subject}%`);
        }

        query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [resources] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);

        const total = countResult[0].total;

        res.json({
            resources,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalResources: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- POST /api/resources ----
// Upload a new resource (Admin only)
router.post('/', authenticateToken, isAdmin, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, subject } = req.body;

        if (!title || !req.file) {
            return res.status(400).json({ message: 'Title and file are required.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        const [result] = await db.query(
            'INSERT INTO resources (title, description, category, subject, file_url, file_name, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', category || 'other', subject || '', fileUrl, req.file.originalname, req.user.id]
        );

        res.status(201).json({
            message: 'Resource uploaded successfully!',
            resourceId: result.insertId
        });
    } catch (error) {
        console.error('Upload resource error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- DELETE /api/resources/:id ----
// Delete a resource (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [resources] = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
        if (resources.length === 0) {
            return res.status(404).json({ message: 'Resource not found.' });
        }

        // Delete the file from disk
        const filePath = path.join(__dirname, '..', resources[0].file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
        res.json({ message: 'Resource deleted successfully!' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- GET /api/resources/download/:id ----
// Download a resource file
router.get('/download/:id', async (req, res) => {
    try {
        const [resources] = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
        if (resources.length === 0) {
            return res.status(404).json({ message: 'Resource not found.' });
        }

        const filePath = path.join(__dirname, '..', resources[0].file_url);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server.' });
        }

        res.download(filePath, resources[0].file_name);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
