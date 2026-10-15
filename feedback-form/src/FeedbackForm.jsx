
import { useState } from "react";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailPattern.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!rating) {
      newErrors.rating = "Please select a rating";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="page">
      <div className="feedback-card">
        <h1>Course Feedback</h1>
        <p className="subtitle">
          Share your experience with us.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              data-testid="name-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmitted(false);
              }}
            />

            {errors.name && (
              <p data-testid="name-error" className="error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubmitted(false);
              }}
            />

            {errors.email && (
              <p data-testid="email-error" className="error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              data-testid="rating-select"
              value={rating}
              onChange={(event) => {
                setRating(event.target.value);
                setSubmitted(false);
              }}
            >
              <option value="">Select a rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            {errors.rating && (
              <p data-testid="rating-error" className="error">
                {errors.rating}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              data-testid="comment-input"
              placeholder="Write your feedback (optional)"
              value={comment}
              maxLength={200}
              rows={4}
              onChange={(event) => {
                setComment(event.target.value);
                setSubmitted(false);
              }}
            />

            <p data-testid="comment-count" className="counter">
              {comment.length}/200
            </p>
          </div>

          <button data-testid="submit-btn" type="submit">
            Submit Feedback
          </button>
        </form>

        {submitted && (
          <p data-testid="success-msg" className="success">
            Thank you, {name.trim()}! Feedback submitted.
          </p>
        )}
      </div>
    </div>
  );
}
