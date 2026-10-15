const express = require('express');
const router = express.Router();

let events = [
  {
    _id: 'e101',
    title: 'AI & Full Stack Developer Summit 2026',
    department: 'CSE',
    category: 'Hackathon',
    date: '2026-11-20',
    capacity: 150,
    venue: 'Convention Hall A',
    registeredCount: 92
  },
  {
    _id: 'e102',
    title: 'Advanced Database Systems & Index Optimization',
    department: 'CSE',
    category: 'Workshop',
    date: '2026-11-25',
    capacity: 80,
    venue: 'Virtual Seminar Room 2',
    registeredCount: 65
  }
];

router.get('/', (req, res) => {
  const { department, category } = req.query;
  let results = events;
  if (department) results = results.filter((e) => e.department === department);
  if (category) results = results.filter((e) => e.category === category);
  res.json({ success: true, count: results.length, data: results });
});

router.post('/', (req, res) => {
  const newEvent = { _id: `e${Date.now()}`, ...req.body, registeredCount: 0 };
  events.push(newEvent);
  res.status(201).json({ success: true, data: newEvent });
});

router.post('/:id/rsvp', (req, res) => {
  const event = events.find((e) => e._id === req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  event.registeredCount += 1;
  res.json({ success: true, message: 'RSVP confirmed', data: event });
});

module.exports = router;
