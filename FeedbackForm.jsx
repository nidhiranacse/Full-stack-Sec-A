
import { useState } from 'react';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!rating) {
      newErrors.rating = 'Please select a rating';
    }

    setErrors(newErrors);
    setSubmitted(Object.keys(newErrors).length === 0);
  }

  return (
    <div>
      <h2>Course Feedback Form</h2>

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          data-testid="name-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {errors.name && (
          <p data-testid="name-error">{errors.name}</p>
        )}

        <label>Email:</label>
        <input
          data-testid="email-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && (
          <p data-testid="email-error">{errors.email}</p>
        )}

        <label>Rating:</label>
        <select
          data-testid="rating-select"
          value={rating}
          onChange={e => setRating(e.target.value)}
        >
          <option value="">Select rating</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {errors.rating && (
          <p data-testid="rating-error">{errors.rating}</p>
        )}

        <label>Comment:</label>
        <textarea
          data-testid="comment-input"
          maxLength={200}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <p data-testid="comment-count">
          {comment.length}/200
        </p>

        <button data-testid="submit-btn" type="submit">
          Submit Feedback
        </button>
      </form>

      {submitted && (
        <p data-testid="success-msg">
          Thank you, {name}! Feedback submitted.
        </p>
      )}
    </div>
  );
}
