/**
 * Academic Resources Routes (Upload/Download PDF/DOCX)
 * Lab Sheet 11 - Core Module: Resources & Subject/Semester Categorization
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { db, uploadsDir } = require('../config/db');
const { authenticateUser, optionalAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateResource } = require('../middleware/validator');

/**
 * @route   GET /api/resources
 * @desc    Get paginated resources with subject, semester & search filtering
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { q, subject, semester, fileType } = req.query;

    const whereClauses = [];
    const params = [];

    if (q && q.trim()) {
      whereClauses.push('(r.title LIKE ? OR r.description LIKE ? OR r.fileName LIKE ?)');
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (subject && subject !== 'All') {
      whereClauses.push('r.subject = ?');
      params.push(subject);
    }

    if (semester && semester !== 'All') {
      whereClauses.push('r.semester = ?');
      params.push(semester);
    }

    if (fileType && fileType !== 'All') {
      whereClauses.push('r.fileType = ?');
      params.push(fileType.toLowerCase());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total Count
    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM resources r ${whereSql}`).get(...params);
    const total = totalRow ? totalRow.total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Resources list
    const listSql = `
      SELECT 
        r.*,
        u.name as uploaderName
      FROM resources r
      LEFT JOIN users u ON r.uploadedBy = u.id
      ${whereSql}
      ORDER BY r.id DESC
      LIMIT ? OFFSET ?
    `;

    const resources = db.prepare(listSql).all(...params, limit, offset);

    return res.status(200).json({
      success: true,
      resources,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });
  } catch (err) {
    console.error('Fetch resources error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve resources', error: err.message });
  }
});

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource metadata
 * @access  Public
 */
router.get('/:id', (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }

  try {
    const resource = db.prepare(`
      SELECT r.*, u.name as uploaderName 
      FROM resources r
      LEFT JOIN users u ON r.uploadedBy = u.id
      WHERE r.id = ?
    `).get(resourceId);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    return res.status(200).json({ success: true, resource });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve resource', error: err.message });
  }
});

/**
 * @route   POST /api/resources
 * @desc    Upload academic resource (PDF/DOCX)
 * @access  Private (Admin Role Only)
 */
router.post('/', authenticateUser, requireRole('admin'), upload.single('file'), (req, res) => {
  const { title, description, subject, semester, fileType } = req.body;

  if (!title || !subject || !semester) {
    return res.status(400).json({
      success: false,
      message: 'Title, subject, and semester are mandatory fields'
    });
  }

  let finalFileName = '';
  let finalFilePath = '';
  let finalFileSize = '1.5 MB';
  let finalType = fileType ? fileType.toLowerCase() : 'pdf';

  if (req.file) {
    finalFileName = req.file.originalname;
    finalFilePath = path.relative(path.join(__dirname, '..', '..'), req.file.path);
    finalFileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    finalType = ext === 'docx' ? 'docx' : 'pdf';
  } else {
    // If uploaded without direct binary file (e.g. metadata entry), create mock content
    finalFileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${finalType}`;
    const generatedPath = path.join(uploadsDir, finalFileName);
    if (!fs.existsSync(generatedPath)) {
      fs.writeFileSync(generatedPath, `CampusConnect Resource Note\nTitle: ${title}\nSubject: ${subject}\nSemester: ${semester}\nUploaded by: ${req.user.name}`);
    }
    finalFilePath = path.relative(path.join(__dirname, '..', '..'), generatedPath);
  }

  try {
    const insertStmt = db.prepare(`
      INSERT INTO resources (title, description, subject, semester, fileType, fileName, fileSize, filePath, downloadCount, uploadedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    const result = insertStmt.run(
      title.trim(),
      description ? description.trim() : '',
      subject.trim(),
      semester.trim(),
      finalType,
      finalFileName,
      finalFileSize,
      finalFilePath,
      req.user.id
    );

    const resourceId = Number(result.lastInsertRowid);
    const newResource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);

    return res.status(201).json({
      success: true,
      message: 'Academic resource uploaded and categorized successfully',
      resource: newResource
    });
  } catch (err) {
    console.error('Resource upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resource', error: err.message });
  }
});

/**
 * @route   GET /api/resources/:id/download
 * @desc    Download academic resource file & increment download count
 * @access  Public
 */
router.get('/:id/download', (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }

  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Increment download counter
    db.prepare('UPDATE resources SET downloadCount = downloadCount + 1 WHERE id = ?').run(resourceId);

    // Resolve file on disk
    let fullFilePath = path.join(uploadsDir, resource.fileName);
    if (!fs.existsSync(fullFilePath)) {
      // Re-create sample file if missing
      fs.writeFileSync(fullFilePath, `CampusConnect Educational Document: ${resource.title}\nSubject: ${resource.subject}\nSemester: ${resource.semester}`);
    }

    const contentType = resource.fileType === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);

    return res.sendFile(path.resolve(fullFilePath));
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ success: false, message: 'Failed to download file', error: err.message });
  }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete academic resource
 * @access  Private (Admin Role Only)
 */
router.delete('/:id', authenticateUser, requireRole('admin'), (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }

  try {
    const existing = db.prepare('SELECT id, title FROM resources WHERE id = ?').get(resourceId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    db.prepare('DELETE FROM resources WHERE id = ?').run(resourceId);

    return res.status(200).json({
      success: true,
      message: `Resource "${existing.title}" deleted successfully`,
      deletedId: resourceId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete resource', error: err.message });
  }
});

module.exports = router;
