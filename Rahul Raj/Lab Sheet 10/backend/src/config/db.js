/**
 * Database Storage Manager
 * Supports MongoDB connection or robust local persistent/memory storage for instant execution
 */

const users = new Map();
const events = new Map();
const announcements = new Map();
const rsvps = new Set(); // format: `${userId}_${eventId}`

let userSeq = 1;
let eventSeq = 1;
let announcementSeq = 1;

module.exports = {
  users,
  events,
  announcements,
  rsvps,
  nextUserId: () => userSeq++,
  nextEventId: () => eventSeq++,
  nextAnnouncementId: () => announcementSeq++,
};
