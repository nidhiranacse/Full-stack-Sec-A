import { useState } from "react";

function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Simple email check
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim() || !isValidEmail(email)) newErrors.email = "Valid email is required";
    if (!rating) newErrors.rating = "Rating is required";

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  }

  // Show success message after submit
  if (submitted) {
    return (
      <div className="form-container">
        <p data-testid="success-msg" className="success-msg">
          Thank you, {name}! Feedback submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1>Course Feedback</h1>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="field">
          <label>Name</label>
          <input
            data-testid="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          {errors.name && <span data-testid="name-error" className="error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="field">
          <label>Email</label>
          <input
            data-testid="email-input"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {errors.email && <span data-testid="email-error" className="error">{errors.email}</span>}
        </div>

        {/* Rating */}
        <div className="field">
          <label>Rating</label>
          <select
            data-testid="rating-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">-- Select Rating --</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          {errors.rating && <span data-testid="rating-error" className="error">{errors.rating}</span>}
        </div>

        {/* Comment */}
        <div className="field">
          <label>Comment</label>
          <textarea
            data-testid="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 200))}
            placeholder="Write your feedback..."
            maxLength={200}
          />
          <span data-testid="comment-count" className="counter">
            {comment.length}/200
          </span>
        </div>

        {/* Submit */}
        <button data-testid="submit-btn" type="submit">
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;
