import React, { useState } from "react";
import "./index.css";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};

    if (!name.trim()) next.name = "Name is required";

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email";
    }

    if (!rating) next.rating = "Please select a rating";

    setErrors(next);
    setSuccess("");

    if (Object.keys(next).length === 0) {
      setSuccess(name.trim());
    }
  }

  return (
    <main className="container">
      <h1>Course Feedback Form</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          data-testid="name-input"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setErrors(p => ({ ...p, name: "" }));
            setSuccess("");
          }}
        />
        {errors.name && <p data-testid="name-error">{errors.name}</p>}

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          data-testid="email-input"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setErrors(p => ({ ...p, email: "" }));
            setSuccess("");
          }}
        />
        {errors.email && <p data-testid="email-error">{errors.email}</p>}

        <label htmlFor="rating">Rating:</label>
        <select
          id="rating"
          data-testid="rating-select"
          value={rating}
          onChange={e => {
            setRating(e.target.value);
            setErrors(p => ({ ...p, rating: "" }));
            setSuccess("");
          }}
        >
          <option value="">Select Rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        {errors.rating && <p data-testid="rating-error">{errors.rating}</p>}

        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          data-testid="comment-input"
          maxLength={200}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <p data-testid="comment-count">{comment.length}/200</p>

        <button type="submit" data-testid="submit-btn">
          Submit Feedback
        </button>
      </form>

      {success && (
        <p data-testid="success-msg">
          Thank you, {success}! Feedback submitted
        </p>
      )}
    </main>
  );
}
