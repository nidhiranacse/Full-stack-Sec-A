import React, { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_COMMENT = 200;

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, rating: false });
  const [submittedName, setSubmittedName] = useState(null);

  // Validity is always derived from the current values.
  const nameInvalid = name.trim() === '';
  const emailInvalid = !EMAIL_RE.test(email.trim());
  const ratingInvalid = rating === '';

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));
  const clearSuccess = () => setSubmittedName(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, rating: true });
    if (nameInvalid || emailInvalid || ratingInvalid) {
      setSubmittedName(null);
      return;
    }
    setSubmittedName(name.trim());
    setName('');
    setEmail('');
    setRating('');
    setComment('');
    setTouched({ name: false, email: false, rating: false });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            data-testid="name-input"
            value={name}
            onChange={(e) => { setName(e.target.value); clearSuccess(); }}
            onBlur={() => touch('name')}
          />
          {touched.name && nameInvalid && (
            <span data-testid="name-error" role="alert">Name is required</span>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            data-testid="email-input"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearSuccess(); }}
            onBlur={() => touch('email')}
          />
          {touched.email && emailInvalid && (
            <span data-testid="email-error" role="alert">Enter a valid email address</span>
          )}
        </div>

        <div>
          <label htmlFor="rating">Rating</label>
          <select
            id="rating"
            data-testid="rating-select"
            value={rating}
            onChange={(e) => { setRating(e.target.value); clearSuccess(); }}
            onBlur={() => touch('rating')}
          >
            <option value=""></option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>{n}</option>
            ))}
          </select>
          {touched.rating && ratingInvalid && (
            <span data-testid="rating-error" role="alert">Please select a rating</span>
          )}
        </div>

        <div>
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            data-testid="comment-input"
            value={comment}
            maxLength={MAX_COMMENT}
            onChange={(e) => { setComment(e.target.value); clearSuccess(); }}
          />
          <span data-testid="comment-count">{`${comment.length}/${MAX_COMMENT}`}</span>
        </div>

        <button type="submit" data-testid="submit-btn">Submit</button>
      </form>

      {submittedName !== null && (
        <p data-testid="success-msg">{`Thank you, ${submittedName}! Feedback submitted.`}</p>
      )}
    </div>
  );
}
