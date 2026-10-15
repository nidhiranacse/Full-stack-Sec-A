const {
  createEvent,
  findEventById,
  clearEvents,
} = require('./mocks/inMemoryEvent');

describe('Event tests', () => {
  beforeEach(() => {
    clearEvents();
  });

  test('should create an event', () => {
    const event = createEvent({
      title: 'Tech Fest',
      description: 'College technical event',
      date: new Date('2026-10-10'),
      location: 'COER University',
      createdBy: 'user1',
    });

    expect(event.title).toBe('Tech Fest');
    expect(event.location).toBe('COER University');
    expect(event.rsvps).toEqual([]);
  });

  test('should find event by id', () => {
    const event = createEvent({
      title: 'Coding Competition',
      description: 'Coding contest',
      date: new Date('2026-10-15'),
      location: 'Computer Lab',
      createdBy: 'user1',
    });

    const foundEvent = findEventById(event._id);

    expect(foundEvent).toBeDefined();
    expect(foundEvent.title).toBe('Coding Competition');
  });

  test('should return undefined for unknown event', () => {
    const event = findEventById('999');

    expect(event).toBeUndefined();
  });
});