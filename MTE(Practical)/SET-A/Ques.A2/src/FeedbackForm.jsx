
import { useState } from "react";
import "./FeedbackForm.css";

const courses = [
  "Full Stack Development",
  "Data Structures & Algorithms",
  "Computer Networks",
  "Database Management Systems",
  "Artificial Intelligence",
];

const aspects = ["Teaching", "Course content", "Practical work", "Resources"];

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [course, setCourse] = useState("");
  const [instructor, setInstructor] = useState("");
  const [semester, setSemester] = useState("5th Semester");
  const [liked, setLiked] = useState([]);
  const [recommend, setRecommend] = useState("");
  const [errors, setErrors] = useState({});
  const [submittedName, setSubmittedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    if (
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!rating) {
      newErrors.rating = "Please select a course rating.";
    }

    setErrors(newErrors);
    setSubmittedName("");

    if (Object.keys(newErrors).length > 0) return;

    // This practical demonstrates a client-side form submission.
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmittedName(name.trim());
    }, 500);
  }

  function updateField(setter, value, field) {
    setter(value);
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setSubmittedName("");
  }

  function toggleAspect(aspect) {
    setLiked((previous) =>
      previous.includes(aspect)
        ? previous.filter((item) => item !== aspect)
        : [...previous, aspect]
    );
    setSubmittedName("");
  }

  function resetForm() {
    setName("");
    setEmail("");
    setRating("");
    setComment("");
    setCourse("");
    setInstructor("");
    setSemester("5th Semester");
    setLiked([]);
    setRecommend("");
    setErrors({});
    setSubmittedName("");
    setSubmitting(false);
  }

  return (
    <main className="feedback-page">
      <div className="feedback-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-icon">✦</span>
            <span>Campus<span className="brand-light">Voice</span></span>
          </div>
          <span className="secure-label">● Student feedback portal</span>
        </header>

        <section className="hero">
          <span className="eyebrow">YOUR VOICE MATTERS</span>
          <h1>Help us make<br />learning <span>better.</span></h1>
          <p>
            Your honest feedback helps improve teaching, course
            content, and the student experience.
          </p>
          <div className="hero-points">
            <span>✓ Quick and simple</span>
            <span>✓ Student-focused</span>
          </div>
        </section>

        <section className="feedback-card">
          <div className="card-heading">
            <div>
              <span className="section-tag">COURSE EVALUATION</span>
              <h2>Share your feedback</h2>
              <p>Fields marked with * are required.</p>
            </div>
            <div className="heading-icon">✎</div>
          </div>

          {submittedName && (
            <div
              data-testid="success-msg"
              className="success-message"
              role="status"
            >
              <span className="success-icon">✓</span>
              <div>
                <strong>Feedback submitted successfully!</strong>
                <p>Thank you, {submittedName}! Feedback submitted.</p>
                <button type="button" className="reset-link" onClick={resetForm}>
                  Submit another response →
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3><span>01</span> About you</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="name">Full name *</label>
                  <input
                    id="name"
                    data-testid="name-input"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Aman Sharma"
                    value={name}
                    onChange={(e) =>
                      updateField(setName, e.target.value, "name")
                    }
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" data-testid="name-error" className="error-message">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      updateField(setEmail, e.target.value, "email")
                    }
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" data-testid="email-error" className="error-message">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(
                      (item) => (
                        <option key={item} value={`${item} Semester`}>
                          {item} Semester
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="course">Course</label>
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Choose a course</option>
                    {courses.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="instructor">Instructor name (optional)</label>
                  <input
                    id="instructor"
                    type="text"
                    placeholder="Enter instructor's name"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><span>02</span> Rate your experience</h3>
              <div className="form-field">
                <label htmlFor="rating">Overall course rating *</label>
                <select
                  id="rating"
                  data-testid="rating-select"
                  value={rating}
                  onChange={(e) =>
                    updateField(setRating, e.target.value, "rating")
                  }
                  aria-invalid={Boolean(errors.rating)}
                  aria-describedby={errors.rating ? "rating-error" : undefined}
                >
                  <option value="">Select your rating</option>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>

                <div className="star-rating" aria-label="Visual rating selector">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={Number(rating) >= value ? "star active" : "star"}
                      onClick={() => updateField(setRating, String(value), "rating")}
                      aria-label={`Rate ${value} out of 5`}
                      aria-pressed={Number(rating) === value}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-label">
                    {["", "Needs improvement", "Fair", "Good", "Very good", "Excellent"][
                      Number(rating)
                    ]}
                  </span>
                </div>

                {errors.rating && (
                  <p id="rating-error" data-testid="rating-error" className="error-message">
                    {errors.rating}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label>What did you like? <span className="optional">(select any)</span></label>
                <div className="choice-grid">
                  {aspects.map((aspect) => (
                    <button
                      key={aspect}
                      type="button"
                      className={liked.includes(aspect) ? "choice active" : "choice"}
                      aria-pressed={liked.includes(aspect)}
                      onClick={() => toggleAspect(aspect)}
                    >
                      <span>{liked.includes(aspect) ? "✓" : "+"}</span>
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="recommend">Would you recommend this course?</label>
                <div className="recommend-options">
                  {["Yes", "Maybe", "No"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={recommend === item ? "recommend active" : "recommend"}
                      aria-pressed={recommend === item}
                      onClick={() => {
                        setRecommend(item);
                        setSubmittedName("");
                      }}
                    >
                      {item === "Yes" ? "👍" : item === "Maybe" ? "🤔" : "👎"} {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="comment-heading">
                <h3><span>03</span> Additional comments</h3>
                <span data-testid="comment-count" className="character-count">
                  {comment.length}/200
                </span>
              </div>

              <div className="form-field">
                <label htmlFor="comment">
                  Suggestions or comments <span className="optional">(optional)</span>
                </label>
                <textarea
                  id="comment"
                  data-testid="comment-input"
                  placeholder="Tell us what worked well or what we could improve..."
                  value={comment}
                  maxLength={200}
                  rows={4}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setSubmittedName("");
                  }}
                />
                <div className="character-track">
                  <div style={{ width: `${(comment.length / 200) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <p><span>🔒</span> Your feedback is used to improve the learning experience.</p>
              <button
                data-testid="submit-btn"
                className="submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit feedback"}
                {!submitting && <span>→</span>}
              </button>
            </div>
          </form>
        </section>

        <footer className="page-footer">
          Built for a better learning experience <span>✦</span>
        </footer>
      </div>
    </main>
  );
}
