// Author: Radha Pandey, CSE - CampusConnect
const CATEGORIES = ['workshop', 'hackathon', 'placement', 'seminar', 'other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function validateSignup(body = {}) {
  const errors = [];
  const name = str(body.name);
  if (name.length < 2 || name.length > 80) errors.push('name must be 2-80 characters');
  if (!EMAIL_RE.test(str(body.email))) errors.push('email is invalid');
  const pw = body.password;
  if (typeof pw !== 'string' || pw.length < 6 || pw.length > 72) errors.push('password must be 6-72 characters');
  return errors;
}

function validateLogin(body = {}) {
  const errors = [];
  if (!EMAIL_RE.test(str(body.email))) errors.push('email is invalid');
  if (typeof body.password !== 'string' || !body.password) errors.push('password is required');
  return errors;
}

// partial=true is used by PUT (only validate fields that were sent)
function validateEvent(body = {}, partial = false) {
  const errors = [];
  const values = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has('title')) {
    const t = str(body.title);
    if (t.length < 3 || t.length > 120) errors.push('title must be 3-120 characters');
    else values.title = t;
  }
  if (has('description')) {
    if (typeof body.description !== 'string' || body.description.length > 2000) {
      errors.push('description must be text up to 2000 characters');
    } else values.description = body.description.trim();
  }
  if (!partial || has('category')) {
    if (!CATEGORIES.includes(body.category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
    else values.category = body.category;
  }
  if (!partial || has('date')) {
    const d = new Date(body.date);
    if (!body.date || Number.isNaN(d.getTime())) errors.push('date must be a valid date/time');
    else values.date = d;
  }
  if (!partial || has('venue')) {
    const v = str(body.venue);
    if (v.length < 2 || v.length > 120) errors.push('venue must be 2-120 characters');
    else values.venue = v;
  }
  if (!partial || has('capacity')) {
    const c = Number(body.capacity);
    if (body.capacity === '' || body.capacity === null || !Number.isInteger(c) || c < 1 || c > 10000) {
      errors.push('capacity must be an integer between 1 and 10000');
    } else values.capacity = c;
  }
  if (partial && !errors.length && !Object.keys(values).length) errors.push('Provide at least one field to update');
  return { errors, values };
}

function validateResourceMeta(body = {}) {
  const errors = [];
  const title = str(body.title);
  const subject = str(body.subject);
  const semester = Number(body.semester);
  if (title.length < 3 || title.length > 120) errors.push('title must be 3-120 characters');
  if (subject.length < 2 || subject.length > 80) errors.push('subject must be 2-80 characters');
  if (!Number.isInteger(semester) || semester < 1 || semester > 8) errors.push('semester must be an integer 1-8');
  return { errors, values: { title, subject, semester } };
}

module.exports = { CATEGORIES, validateSignup, validateLogin, validateEvent, validateResourceMeta };
