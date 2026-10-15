/**
 * Input Validation Middleware
 * Lab Sheet 11 - Non-Functional Requirement: Input validation on client and server
 */

function validateSignup(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['student', 'admin'].includes(role)) {
    errors.push("Role must be either 'student' or 'admin'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateEvent(req, res, next) {
  const { title, description, category, date, time, venue, maxSeats } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters long');
  }

  if (!description || typeof description !== 'string') {
    errors.push('Event description is required');
  }

  const validCategories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  if (!date || typeof date !== 'string') {
    errors.push('Event date is required (YYYY-MM-DD)');
  }

  if (!time || typeof time !== 'string') {
    errors.push('Event time is required (e.g. 10:00 AM - 01:00 PM)');
  }

  if (!venue || typeof venue !== 'string') {
    errors.push('Event venue is required');
  }

  const seats = parseInt(maxSeats, 10);
  if (isNaN(seats) || seats <= 0) {
    errors.push('Max seats must be a positive integer greater than 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateResource(req, res, next) {
  const { title, subject, semester, fileType } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Resource title must be at least 3 characters long');
  }

  if (!subject || typeof subject !== 'string') {
    errors.push('Subject categorization is required');
  }

  if (!semester || typeof semester !== 'string') {
    errors.push('Semester categorization is required');
  }

  const validTypes = ['pdf', 'docx'];
  if (fileType && !validTypes.includes(fileType.toLowerCase())) {
    errors.push("File type must be 'pdf' or 'docx'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateEvent,
  validateResource
};
