
import { useState } from 'react';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErrors(true);

    if (
      !name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !rating
    ) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div>
      <h2>Student Feedback Form</h2>

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          data-testid="name-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {errors && !name.trim() && (
          <p data-testid="name-error">Name is required</p>
        )}

        <label>Email:</label>
        <input
          data-testid="email-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p data-testid="email-error">Enter a valid email</p>
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
        {errors && !rating && (
          <p data-testid="rating-error">Select a rating</p>
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
