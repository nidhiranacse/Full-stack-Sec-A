const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Get all resources with Search, Subject/Semester filtering, and Pagination
 */
function getAllResources(req, res) {
  try {
    const {
      search = '',
      subject = '',
      semester = '',
      category = '',
      page = 1,
      limit = 9
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 9));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.subject LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (subject.trim()) {
      conditions.push('r.subject = ?');
      params.push(subject.trim());
    }

    if (semester.trim()) {
      conditions.push('r.semester = ?');
      params.push(semester.trim());
    }

    if (category.trim()) {
      conditions.push('r.category = ?');
      params.push(category.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM resources r ${whereClause}`;
    const totalCount = db.prepare(countSql).get(...params).total;

    const querySql = `
      SELECT 
        r.*,
        u.name as uploader_name,
        u.role as uploader_role
      FROM resources r
      LEFT JOIN users u ON r.uploaded_by = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const resources = db.prepare(querySql).all(...params, limitNum, offset);

    // List of unique subjects and semesters for UI filter dropdowns
    const availableSubjects = db.prepare('SELECT DISTINCT subject FROM resources ORDER BY subject ASC').all().map(s => s.subject);
    const availableSemesters = db.prepare('SELECT DISTINCT semester FROM resources ORDER BY semester ASC').all().map(s => s.semester);

    res.status(200).json({
      success: true,
      data: {
        resources,
        meta: {
          subjects: availableSubjects,
          semesters: availableSemesters
        },
        pagination: {
          totalItems: totalCount,
          currentPage: pageNum,
          itemsPerPage: limitNum,
          totalPages: Math.ceil(totalCount / limitNum) || 1,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resources.',
      error: error.message
    });
  }
}

/**
 * Upload a resource file (Admin/Faculty or student)
 */
function uploadResource(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.'
      });
    }

    const { title, description = '', subject, semester, category } = req.body;
    const uploaded_by = req.user.id;

    const insertStmt = db.prepare(`
      INSERT INTO resources (
        title, description, subject, semester, category,
        file_name, original_name, file_path, file_size, file_type, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      title.trim(),
      description.trim(),
      subject.trim(),
      semester.trim(),
      category.trim(),
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      uploaded_by
    );

    const newResource = db.prepare(`
      SELECT r.*, u.name as uploader_name 
      FROM resources r 
      JOIN users u ON r.uploaded_by = u.id 
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      data: newResource
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource.',
      error: error.message
    });
  }
}

/**
 * Download a resource file by ID (increments download counter)
 */
function downloadResource(req, res) {
  try {
    const { id } = req.params;

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    const filePath = path.resolve(resource.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on server.'
      });
    }

    // Increment download counter
    db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').run(id);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.original_name)}"`);
    res.setHeader('Content-Type', resource.file_type);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resource.',
      error: error.message
    });
  }
}

/**
 * Delete a resource (Admin or uploader)
 */
function deleteResource(req, res) {
  try {
    const { id } = req.params;

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    // Only admin or the person who uploaded can delete
    if (req.user.role !== 'admin' && req.user.id !== resource.uploaded_by) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only an admin or the uploader can delete this resource.'
      });
    }

    // Delete file from disk
    const filePath = path.resolve(resource.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete physical file:', e.message);
      }
    }

    db.prepare('DELETE FROM resources WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource.',
      error: error.message
    });
  }
}

module.exports = {
  getAllResources,
  uploadResource,
  downloadResource,
  deleteResource
};
