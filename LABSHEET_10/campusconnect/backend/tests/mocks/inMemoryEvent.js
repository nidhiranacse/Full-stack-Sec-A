const events = [];

function createEvent(data) {
  const event = {
    _id: String(events.length + 1),
    ...data,
    rsvps: [],
  };

  events.push(event);
  return event;
}

function findEventById(id) {
  return events.find((event) => event._id === id);
}

function clearEvents() {
  events.length = 0;
}

module.exports = {
  events,
  createEvent,
  findEventById,
  clearEvents,
};