/**
 * Request validation middlewares
 * Validates inputs and returns HTTP 400 Bad Request with descriptive errors
 */

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (role && !['student', 'admin'].includes(role)) {
    errors.push("Role must be either 'student' or 'admin'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

function validateEvent(req, res, next) {
  const { title, description, category, date, time, venue, total_seats } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Event description must be at least 10 characters.');
  }

  const allowedCategories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Tech Fest'];
  if (!category || !allowedCategories.includes(category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(', ')}.`);
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('Event date must be in YYYY-MM-DD format.');
  }

  if (!time || typeof time !== 'string' || time.trim().length < 2) {
    errors.push('Valid event time is required (e.g. 10:00 AM).');
  }

  if (!venue || typeof venue !== 'string' || venue.trim().length < 2) {
    errors.push('Event venue is required.');
  }

  const seatsNum = Number(total_seats);
  if (!total_seats || isNaN(seatsNum) || seatsNum < 1) {
    errors.push('Total seats must be a positive integer greater than 0.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

function validateResource(req, res, next) {
  const { title, subject, semester, category } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Resource title must be at least 3 characters.');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
    errors.push('Subject name is required.');
  }

  if (!semester || typeof semester !== 'string') {
    errors.push('Semester is required (e.g., Sem 1 to Sem 8).');
  }

  const allowedCategories = ['Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Material'];
  if (!category || !allowedCategories.includes(category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateEvent,
  validateResource
};
