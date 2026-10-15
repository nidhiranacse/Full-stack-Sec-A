import { useState } from "react";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    rating: false
  });

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      name: name.trim().length === 0,
      email: !validEmail,
      rating: rating === ""
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.rating) {
      setSubmittedName("");
      return;
    }

    setSubmittedName(name.trim());
  }

  return (
    <main className="page">
      <section className="form-card">
        <h1>Course Feedback</h1>
        <p className="subtitle">Share your experience with this course.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name-input">Name</label>
          <input
            id="name-input"
            data-testid="name-input"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((old) => ({ ...old, name: false }));
              setSubmittedName("");
            }}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="error" data-testid="name-error">Name is required.</p>
          )}

          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((old) => ({ ...old, email: false }));
              setSubmittedName("");
            }}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="error" data-testid="email-error">Enter a valid email address.</p>
          )}

          <label htmlFor="rating-select">Rating</label>
          <select
            id="rating-select"
            data-testid="rating-select"
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
              setErrors((old) => ({ ...old, rating: false }));
              setSubmittedName("");
            }}
          >
            <option value="">Select a rating</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={String(value)}>{value}</option>
            ))}
          </select>
          {errors.rating && (
            <p className="error" data-testid="rating-error">Please select a rating.</p>
          )}

          <label htmlFor="comment-input">Comment (optional)</label>
          <textarea
            id="comment-input"
            data-testid="comment-input"
            value={comment}
            maxLength={200}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write your feedback (up to 200 characters)"
            rows={4}
          />
          <p className="counter" data-testid="comment-count">{comment.length}/200</p>

          <button type="submit" data-testid="submit-btn">Submit Feedback</button>
        </form>

        {submittedName && (
          <p className="success" data-testid="success-msg">
            Thank you, {submittedName}! Feedback submitted.
          </p>
        )}
      </section>
    </main>
  );
}
