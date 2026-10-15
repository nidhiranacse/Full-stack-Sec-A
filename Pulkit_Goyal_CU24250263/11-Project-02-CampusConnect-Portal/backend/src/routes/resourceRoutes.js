const express = require('express');
const router = express.Router();

let resources = [
  {
    _id: 'r1',
    title: 'Full Stack Web Development Lab Manual & Viva Guide',
    subject: 'CS301',
    department: 'CSE',
    fileUrl: '/uploads/sample-resource.pdf',
    fileType: 'pdf',
    fileSizeMb: 3.4
  },
  {
    _id: 'r2',
    title: 'Database Indexing & Query Tuning Reference Handbook',
    subject: 'CS302',
    department: 'CSE',
    fileUrl: '/uploads/sample-resource.pdf',
    fileType: 'pdf',
    fileSizeMb: 1.8
  }
];

router.get('/', (req, res) => {
  res.json({ success: true, count: resources.length, data: resources });
});

router.post('/upload', (req, res) => {
  const newResource = {
    _id: `r${Date.now()}`,
    title: req.body.title || 'Untitled Resource',
    subject: req.body.subject || 'CS301',
    department: req.body.department || 'CSE',
    fileUrl: '/uploads/sample-resource.pdf',
    fileType: 'pdf',
    fileSizeMb: 2.1
  };
  resources.push(newResource);
  res.status(201).json({ success: true, message: 'Resource uploaded successfully', data: newResource });
});

module.exports = router;
