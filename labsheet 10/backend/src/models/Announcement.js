const { announcements } = require('./mockDb');

const Announcement = {
  create: async (obj) => await announcements.create(obj)
};

module.exports = Announcement;