// Author: Radha Pandey, CSE - CampusConnect
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Sequelize, Op } = require('sequelize');
const config = require('../config');
const { Resource } = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const { authenticate, authorize } = require('../middleware/auth');
const { validateResourceMeta } = require('../utils/validators');
const { parsePaging, parseId } = require('../utils/events');

const router = express.Router();
router.use(authenticate);

// Only PDF and DOCX files, max 10 MB
const ALLOWED = {
  '.pdf': ['application/pdf'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(config.uploadDir, { recursive: true });
      cb(null, config.uploadDir);
    },
    filename: (req, file, cb) =>
      cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED[ext] || !ALLOWED[ext].includes(file.mimetype)) {
      return cb(new HttpError(400, 'Only PDF and DOCX files are allowed'));
    }
    return cb(null, true);
  },
});

const removeFile = (name) => fs.unlink(path.join(config.uploadDir, name), () => {});

// GET /api/resources?q=&subject=&semester=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePaging(req.query);
    const and = [];
    const lower = (col, val) =>
      Sequelize.where(Sequelize.fn('lower', Sequelize.col(col)), {
        [Op.like]: `%${String(val).toLowerCase().replace(/[%_]/g, (m) => '\\' + m)}%`,
      });
    if (req.query.q) and.push(lower('title', req.query.q));
    if (req.query.subject) and.push(lower('subject', req.query.subject));
    if (req.query.semester) {
      const s = Number(req.query.semester);
      if (!Number.isInteger(s) || s < 1 || s > 8) throw new HttpError(400, 'semester must be 1-8');
      and.push({ semester: s });
    }
    const where = and.length ? { [Op.and]: and } : {};
    const { count, rows } = await Resource.findAndCountAll({
      where,
      attributes: { exclude: ['filename'] },
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, page, limit, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) });
  })
);

router.post(
  '/',
  authorize('admin'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { errors, values } = validateResourceMeta(req.body);
    if (!req.file) errors.unshift('file is required (field name: file)');
    if (errors.length) {
      if (req.file) removeFile(req.file.filename);
      throw new HttpError(400, 'Validation failed', errors);
    }
    const r = await Resource.create({
      ...values,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
    });
    const json = r.toJSON();
    delete json.filename;
    res.status(201).json(json);
  })
);

router.get(
  '/:id/download',
  asyncHandler(async (req, res, next) => {
    const r = await Resource.findByPk(parseId(req.params.id));
    if (!r) throw new HttpError(404, 'Resource not found');
    const full = path.join(config.uploadDir, r.filename);
    if (!fs.existsSync(full)) throw new HttpError(404, 'File missing on server');
    res.download(full, r.originalName, (err) => err && !res.headersSent && next(err));
  })
);

router.delete(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const r = await Resource.findByPk(parseId(req.params.id));
    if (!r) throw new HttpError(404, 'Resource not found');
    removeFile(r.filename);
    await r.destroy();
    res.status(204).send();
  })
);

module.exports = router;
