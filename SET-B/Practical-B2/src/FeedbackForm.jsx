
import { useState } from "react";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!rating) {
      newErrors.rating = "Please select a rating";
    }

    setErrors(newErrors);
    setSubmitted(false);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  }

  return (
    <section className="form-card">
      <div className="form-heading">
        <div className="form-icon">✦</div>
        <div>
          <h2>Course Feedback Form</h2>
          <p>We value your learning experience!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="student-name">Full Name *</label>
          <input
            id="student-name"
            data-testid="name-input"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
              setSubmitted(false);
            }}
          />
          {errors.name && (
            <p className="error" data-testid="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="student-email">Email Address *</label>
          <input
            id="student-email"
            data-testid="email-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
              setSubmitted(false);
            }}
          />
          {errors.email && (
            <p className="error" data-testid="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="course-rating">Overall Rating *</label>
          <select
            id="course-rating"
            data-testid="rating-select"
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setErrors((prev) => ({ ...prev, rating: "" }));
              setSubmitted(false);
            }}
          >
            <option value="">Select rating</option>
            <option value="1">1 - Needs Improvement</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          {errors.rating && (
            <p className="error" data-testid="rating-error">
              {errors.rating}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="course-comment">Comments</label>
          <textarea
            id="course-comment"
            data-testid="comment-input"
            placeholder="Share your thoughts about the course..."
            rows={4}
            maxLength={200}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setSubmitted(false);
            }}
          />
          <div className="comment-footer">
            <span>Your feedback helps us improve.</span>
            <span data-testid="comment-count">
              {comment.length}/200
            </span>
          </div>
        </div>

        <button
          className="submit-button"
          data-testid="submit-btn"
          type="submit"
        >
          Submit Feedback <span>→</span>
        </button>

        {submitted && (
          <p className="success-message" role="status">
            ✓ Thank you, {name.trim()}! Feedback submitted.
          </p>
        )}
      </form>
    </section>
  );
}
