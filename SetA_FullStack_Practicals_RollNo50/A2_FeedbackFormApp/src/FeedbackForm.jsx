import { useState } from "react";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submittedName, setSubmittedName] = useState(null);

  const nameInvalid = !name.trim();
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ratingInvalid = rating === "";

  function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    if (nameInvalid || emailInvalid || ratingInvalid) {
      setSubmittedName(null);
      return;
    }
    setSubmittedName(name.trim());
  }

  return (
    <main className="card">
      <h1>Course Feedback Form</h1>
      <p className="subtitle">Share your feedback about the course.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Name</label>
        <input id="name" data-testid="name-input" value={name}
          onChange={e => { setName(e.target.value); setSubmittedName(null); }} />
        {attempted && nameInvalid && <p className="error" data-testid="name-error">Name is required.</p>}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" data-testid="email-input" value={email}
          onChange={e => { setEmail(e.target.value); setSubmittedName(null); }} />
        {attempted && emailInvalid && <p className="error" data-testid="email-error">Enter a valid email address.</p>}

        <label htmlFor="rating">Rating</label>
        <select id="rating" data-testid="rating-select" value={rating}
          onChange={e => { setRating(e.target.value); setSubmittedName(null); }}>
          <option value="">Select rating</option>
          {[1, 2, 3, 4, 5].map(value => <option key={value} value={String(value)}>{value}</option>)}
        </select>
        {attempted && ratingInvalid && <p className="error" data-testid="rating-error">Please select a rating.</p>}

        <label htmlFor="comment">Comment</label>
        <textarea id="comment" data-testid="comment-input" maxLength={200} rows={4}
          value={comment} onChange={e => { setComment(e.target.value); setSubmittedName(null); }} />
        <p className="counter" data-testid="comment-count">{comment.length}/200</p>

        <button type="submit" data-testid="submit-btn">Submit Feedback</button>
      </form>
      {submittedName !== null && <p className="success" data-testid="success-msg">Thank you, {submittedName}! Feedback submitted.</p>}
    </main>
  );
}
