import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_COMMENT = 200;

function validate({ name, email, rating }) {
  return {
    name: name.trim() === "",
    email: !EMAIL_REGEX.test(email.trim()),
    rating: rating === "",
  };
}

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submittedName, setSubmittedName] = useState(null);

  // Errors are computed from current values, so they disappear
  // as soon as a field becomes valid.
  const errors = validate({ name, email, rating });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (errors.name || errors.email || errors.rating) {
      setSubmittedName(null);
      return;
    }

    setSubmittedName(name.trim());
    setName("");
    setEmail("");
    setRating("");
    setComment("");
    setSubmitAttempted(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <h2>Course Feedback</h2>

      <label style={styles.field}>
        Name
        <input
          data-testid="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      {submitAttempted && errors.name && (
        <p data-testid="name-error" style={styles.error}>
          Name is required
        </p>
      )}

      <label style={styles.field}>
        Email
        <input
          data-testid="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {submitAttempted && errors.email && (
        <p data-testid="email-error" style={styles.error}>
          Enter a valid email address
        </p>
      )}

      <label style={styles.field}>
        Rating
        <select
          data-testid="rating-select"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value=""></option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      {submitAttempted && errors.rating && (
        <p data-testid="rating-error" style={styles.error}>
          Please select a rating
        </p>
      )}

      <label style={styles.field}>
        Comment (optional)
        <textarea
          data-testid="comment-input"
          rows={4}
          maxLength={MAX_COMMENT}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      <span data-testid="comment-count">{`${comment.length}/${MAX_COMMENT}`}</span>

      <button data-testid="submit-btn" type="submit" style={styles.button}>
        Submit
      </button>

      {submittedName !== null && (
        <p data-testid="success-msg" style={styles.success}>
          {`Thank you, ${submittedName}! Feedback submitted.`}
        </p>
      )}
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 420,
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontFamily: "system-ui, sans-serif",
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  error: { color: "#b00020", margin: 0, fontSize: 14 },
  success: { color: "#0a7d2c", fontWeight: 600 },
  button: { marginTop: 8, padding: "8px 12px", cursor: "pointer" },
};
