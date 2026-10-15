import { useState } from "react";
import "./FeedbackForm.css";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameInvalid = name.trim() === "";
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ratingInvalid = rating === "";

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="feedback-page">
      <section className="feedback-card">
        <header className="feedback-header">
          <div className="feedback-icon">✦</div>
          <div>
            <h1>Course <span>Feedback Form</span></h1>
            <p>Your feedback helps us create a better learning experience.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">♙ &nbsp; Name <span>*</span></label>
            <input
              id="name"
              type="text"
              data-testid="name-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={submitted && nameInvalid ? "invalid" : ""}
            />
            {submitted && nameInvalid && (
              <p className="error" data-testid="name-error">
                ⚠ Name is required.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">✉ &nbsp; Email <span>*</span></label>
            <input
              id="email"
              type="email"
              data-testid="email-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={submitted && emailInvalid ? "invalid" : ""}
            />
            {submitted && emailInvalid && (
              <p className="error" data-testid="email-error">
                ⚠ Please enter a valid email.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rating">☆ &nbsp; Rating <span>*</span></label>
            <select
              id="rating"
              data-testid="rating-select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={submitted && ratingInvalid ? "invalid" : ""}
            >
              <option value="">Select rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            {submitted && ratingInvalid && (
              <p className="error" data-testid="rating-error">
                ⚠ Please select a rating.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="comment">▱ &nbsp; Comment <span>*</span></label>
            <textarea
              id="comment"
              data-testid="comment-input"
              placeholder="Write your feedback..."
              value={comment}
              maxLength={200}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="counter" data-testid="comment-count">
              {comment.length}/200
            </div>
          </div>

          <button type="submit" data-testid="submit-btn">
            <span>➤</span> Submit Feedback
          </button>

          {submitted && !nameInvalid && !emailInvalid && !ratingInvalid && (
            <div className="success" data-testid="success-msg">
              ✓ &nbsp; Thank you, {name.trim()}! Feedback submitted.
            </div>
          )}
        </form>

        <footer className="feedback-footer">
          Your feedback matters · Thank you for sharing
        </footer>
      </section>
    </main>
  );
}