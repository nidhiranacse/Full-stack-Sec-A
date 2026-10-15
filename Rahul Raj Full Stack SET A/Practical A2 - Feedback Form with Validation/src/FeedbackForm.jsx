import React, { useState } from 'react';
import './FeedbackForm.css';

/**
 * Practical A2: Feedback Form with Validation (React)
 * Default export as required: src/FeedbackForm.jsx
 * 
 * Required Elements (exact `data-testid` values):
 * - Name input: name-input
 * - Email input: email-input
 * - Rating dropdown: rating-select, with an empty default option followed by the options 1 to 5
 * - Comment textarea: comment-input
 * - Comment counter: comment-count, always in the form {n}/200, where n is current comment length
 * - Submit button: submit-btn
 * - Error messages: name-error, email-error, rating-error. Each is rendered only while its field is invalid.
 * - Success message: success-msg, with the text Thank you, {name}! Feedback submitted.
 */
export default function FeedbackForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    rating: false
  });

  const [successName, setSuccessName] = useState('');
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  // Validation Rules
  const isNameValid = typeof name === 'string' && name.trim().length > 0;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = typeof email === 'string' && email.trim().length > 0 && emailRegex.test(email.trim());
  
  const isRatingValid = rating !== '' && ['1', '2', '3', '4', '5'].includes(String(rating));

  // Determine whether to display field-specific error messages
  const showNameError = (submitted || touched.name) && !isNameValid;
  const showEmailError = (submitted || touched.email) && !isEmailValid;
  const showRatingError = (submitted || touched.rating) && !isRatingValid;

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (!touched.name) {
      setTouched((prev) => ({ ...prev, name: true }));
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!touched.email) {
      setTouched((prev) => ({ ...prev, email: true }));
    }
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
    if (!touched.rating) {
      setTouched((prev) => ({ ...prev, rating: true }));
    }
  };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setComment(val);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ name: true, email: true, rating: true });

    if (isNameValid && isEmailValid && isRatingValid) {
      setSuccessName(name.trim());
      setIsSubmittedSuccessfully(true);

      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess({
          name: name.trim(),
          email: email.trim(),
          rating: Number(rating),
          comment: comment.trim()
        });
      }
    } else {
      setIsSubmittedSuccessfully(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setRating('');
    setComment('');
    setSubmitted(false);
    setTouched({ name: false, email: false, rating: false });
    setIsSubmittedSuccessfully(false);
    setSuccessName('');
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <div className="badge-pill">SET A • Practical A2</div>
          <h2>Course Feedback Form</h2>
          <p className="subtitle">
            We value your honest feedback. Please complete the fields below.
          </p>
        </div>

        {isSubmittedSuccessfully && (
          <div data-testid="success-msg" className="success-banner">
            <span className="success-icon">✓</span>
            <span>Thank you, {successName}! Feedback submitted.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="feedback-form">
          {/* Name Field */}
          <div className={`form-group ${showNameError ? 'has-error' : ''}`}>
            <label htmlFor="name-input" className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              id="name-input"
              data-testid="name-input"
              type="text"
              placeholder="e.g. Rahul Raj"
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur('name')}
              className="form-input"
              autoComplete="name"
            />
            {showNameError && (
              <span data-testid="name-error" className="error-message">
                Please enter your full name.
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className={`form-group ${showEmailError ? 'has-error' : ''}`}>
            <label htmlFor="email-input" className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              id="email-input"
              data-testid="email-input"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              className="form-input"
              autoComplete="email"
            />
            {showEmailError && (
              <span data-testid="email-error" className="error-message">
                Please provide a valid email address.
              </span>
            )}
          </div>

          {/* Rating Dropdown */}
          <div className={`form-group ${showRatingError ? 'has-error' : ''}`}>
            <label htmlFor="rating-select" className="form-label">
              Course Rating (1 to 5) <span className="req">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="rating-select"
                data-testid="rating-select"
                value={rating}
                onChange={handleRatingChange}
                onBlur={() => handleBlur('rating')}
                className="form-select"
              >
                <option value="">Select a rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            {showRatingError && (
              <span data-testid="rating-error" className="error-message">
                Please select a rating between 1 and 5.
              </span>
            )}
          </div>

          {/* Comment Textarea & Counter */}
          <div className="form-group">
            <div className="label-with-counter">
              <label htmlFor="comment-input" className="form-label">
                Comments (Optional)
              </label>
              <span data-testid="comment-count" className="comment-counter">
                {comment.length}/200
              </span>
            </div>
            <textarea
              id="comment-input"
              data-testid="comment-input"
              rows={4}
              maxLength={200}
              placeholder="Share your thoughts about course content, pacing, and delivery..."
              value={comment}
              onChange={handleCommentChange}
              className="form-textarea"
            />
          </div>

          {/* Submit & Reset Buttons */}
          <div className="button-group">
            <button
              type="submit"
              data-testid="submit-btn"
              className="btn btn-primary"
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
