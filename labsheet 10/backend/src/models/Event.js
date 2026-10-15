const { events } = require('./mockDb');

const Event = {
  find: async (query) => await events.find(query),
  findById: async (id) => await events.findById(id),
  create: async (obj) => await events.create(obj),
  countDocuments: async (query) => await events.countDocuments(query)
};

module.exports = Event;