const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateResource } = require('../middleware/validate');

// Public: Get all resources with search/filters/pagination
router.get('/', resourceController.getAllResources);

// Authenticated (Faculty/Admin/Student): Upload study resource (PDF/DOCX)
router.post('/', verifyToken, upload.single('file'), validateResource, resourceController.uploadResource);

// Public / Authenticated: Download resource
router.get('/:id/download', resourceController.downloadResource);

// Authenticated: Delete resource
router.delete('/:id', verifyToken, resourceController.deleteResource);

module.exports = router;
