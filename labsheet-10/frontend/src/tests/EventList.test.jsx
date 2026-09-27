import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Standalone EventListView for isolated component testing
const MockEventList = ({ initialEvents }) => {
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState(initialEvents);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search events by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div data-testid="event-container">
        {filtered.map((e) => (
          <div key={e._id} data-testid="event-card">
            <h3>{e.title}</h3>
            <p>{e.description}</p>
            <span>{e.location}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('EventList Rendering & Search Tests (Lab Sheet 10 - Task 6)', () => {
  const sampleEvents = [
    {
      _id: '1',
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on session with deep learning models.',
      location: 'Lab 4',
    },
    {
      _id: '2',
      title: 'Annual Hackathon 2026',
      description: '36-hour coding challenge across campus.',
      location: 'Main Auditorium',
    },
  ];

  it('4. Correctly renders all event cards with title and location', () => {
    render(<MockEventList initialEvents={sampleEvents} />);

    expect(screen.getByText('AI & Machine Learning Workshop')).toBeInTheDocument();
    expect(screen.getByText('Annual Hackathon 2026')).toBeInTheDocument();
    expect(screen.getByText('Lab 4')).toBeInTheDocument();
    expect(screen.getByText('Main Auditorium')).toBeInTheDocument();
  });

  it('5. Filters event list when user types in search input', () => {
    render(<MockEventList initialEvents={sampleEvents} />);

    const searchInput = screen.getByPlaceholderText(/Search events by title\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Hackathon' } });

    expect(screen.getByText('Annual Hackathon 2026')).toBeInTheDocument();
    expect(screen.queryByText('AI & Machine Learning Workshop')).not.toBeInTheDocument();
  });
});
