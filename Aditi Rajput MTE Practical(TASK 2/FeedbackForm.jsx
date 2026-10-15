import React, { useState } from "react";
import "./FeedbackForm.css";

const initialValues = {
  name: "",
  email: "",
  rating: "",
  comment: "",
};

function getErrors(values) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.rating) {
    errors.rating = "Please choose a rating.";
  }

  return errors;
}

export default function FeedbackForm() {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [successName, setSuccessName] = useState("");
  const errors = getErrors(values);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setSuccessName("");
  }

  function handleBlur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ name: true, email: true, rating: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSuccessName(values.name.trim());
  }

  const showNameError = (touched.name || submitted) && errors.name;
  const showEmailError = (touched.email || submitted) && errors.email;
  const showRatingError = (touched.rating || submitted) && errors.rating;

  return (
    <main className="feedback-page">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Course feedback home">
          <span className="wordmark-mark" aria-hidden="true">F</span>
          <span>FIELDNOTES<span className="wordmark-period">.</span></span>
        </a>
        <span className="masthead-label">STUDENT VOICE <span> / </span> COURSE 01</span>
      </header>

      <section className="feedback-layout" id="top" aria-labelledby="page-title">
        <aside className="intro-panel">
          <div className="intro-topline"><span className="status-dot" /> COURSE FEEDBACK</div>
          <h1 id="page-title">Tell us what <em>clicked.</em></h1>
          <p className="intro-copy">Your perspective makes the next class better. Share what worked and what could use another pass.</p>
          <div className="intro-index" aria-hidden="true">
            <span className="index-number">01</span>
            <span className="index-rule" />
            <span className="index-caption">THE LEARNING<br />EXPERIENCE</span>
          </div>
        </aside>

        <section className="form-panel" aria-labelledby="form-title">
          <div className="form-heading">
            <div>
              <p className="eyebrow">YOUR FEEDBACK</p>
              <h2 id="form-title">Course reflection</h2>
            </div>
            <span className="required-note"><span aria-hidden="true">*</span> Required fields</span>
          </div>

          {successName && (
            <p className="success-message" data-testid="success-msg" role="status">
              <span className="success-mark" aria-hidden="true">&#10003;</span>
              Thank you, {successName}! Feedback submitted.
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-grid">
              <div className={`field ${showNameError ? "field-invalid" : ""}`}>
                <label htmlFor="name-input">Your name <span aria-hidden="true">*</span></label>
                <input
                  id="name-input"
                  data-testid="name-input"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Jamie Lee"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(showNameError)}
                  aria-describedby={showNameError ? "name-error" : undefined}
                />
                {showNameError && <p className="field-error" id="name-error" data-testid="name-error">{errors.name}</p>}
              </div>

              <div className={`field ${showEmailError ? "field-invalid" : ""}`}>
                <label htmlFor="email-input">Email address <span aria-hidden="true">*</span></label>
                <input
                  id="email-input"
                  data-testid="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(showEmailError)}
                  aria-describedby={showEmailError ? "email-error" : undefined}
                />
                {showEmailError && <p className="field-error" id="email-error" data-testid="email-error">{errors.email}</p>}
              </div>

              <div className={`field field-full ${showRatingError ? "field-invalid" : ""}`}>
                <label htmlFor="rating-select">Course rating <span aria-hidden="true">*</span></label>
                <select
                  id="rating-select"
                  data-testid="rating-select"
                  name="rating"
                  value={values.rating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(showRatingError)}
                  aria-describedby={showRatingError ? "rating-error" : undefined}
                >
                  <option value="">Choose a rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option value={rating} key={rating}>{rating}</option>
                  ))}
                </select>
                {showRatingError && <p className="field-error" id="rating-error" data-testid="rating-error">{errors.rating}</p>}
              </div>

              <div className="field field-full comment-field">
                <div className="label-row">
                  <label htmlFor="comment-input">Your comments</label>
                  <span className="optional-label">OPTIONAL</span>
                </div>
                <textarea
                  id="comment-input"
                  data-testid="comment-input"
                  name="comment"
                  rows="4"
                  maxLength={200}
                  placeholder="What stood out? What would you change?"
                  value={values.comment}
                  onChange={handleChange}
                />
                <div className="comment-footer">
                  <span>Keep it kind and constructive.</span>
                  <span data-testid="comment-count" aria-live="polite">{values.comment.length}/200</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <p className="privacy-note">Your response helps improve the course.</p>
              <button type="submit" data-testid="submit-btn">Send feedback <span aria-hidden="true">&#8594;</span></button>
            </div>
          </form>
        </section>
      </section>

      <footer className="page-footer">
        <span>FIELDNOTES <span className="wordmark-period">.</span></span>
        <span>BETTER CLASSES, BUILT TOGETHER</span>
      </footer>
    </main>
  );
}
