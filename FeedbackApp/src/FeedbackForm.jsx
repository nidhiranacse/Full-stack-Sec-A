
import { useState } from 'react';
import './FeedbackForm.css';

export default function FeedbackForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();

        const newErrors = {};

        if (!name.trim()) newErrors.name = 'Name is required';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            newErrors.email = 'Enter a valid email';

        if (!rating) newErrors.rating = 'Please select a rating';

        setErrors(newErrors);
        setSubmitted(false);

        if (Object.keys(newErrors).length === 0) {
            setSubmitted(true);
        }
    }

    return (
        <main className="feedback-page">
            <div className="background-glow glow-one"></div>
            <div className="background-glow glow-two"></div>

            <section className="feedback-card">
                <div className="form-icon">✦</div>

                <p className="eyebrow">YOUR VOICE MATTERS</p>
                <h1>Course Feedback</h1>
                <p className="subtitle">
                    Help us make learning better. Share your experience with us.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <label htmlFor="student-name">Full Name</label>
                        <input
                            id="student-name"
                            data-testid="name-input"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        {errors.name && (
                            <p className="error" data-testid="name-error">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="student-email">Email Address</label>
                        <input
                            id="student-email"
                            data-testid="email-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <p className="error" data-testid="email-error">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="student-rating">Course Rating</label>
                        <select
                            id="student-rating"
                            data-testid="rating-select"
                            value={rating}
                            onChange={e => setRating(e.target.value)}
                        >
                            <option value="">Choose your rating</option>
                            {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>
                                    {n} {['', '★', '★★', '★★★', '★★★★', '★★★★★'][n]}
                                </option>
                            ))}
                        </select>
                        {errors.rating && (
                            <p className="error" data-testid="rating-error">
                                {errors.rating}
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <div className="comment-heading">
                            <label htmlFor="student-comment">Your Comments</label>
                            <span data-testid="comment-count">
                                {comment.length}/200
                            </span>
                        </div>
                        <textarea
                            id="student-comment"
                            data-testid="comment-input"
                            placeholder="What did you enjoy? What could be improved?"
                            maxLength={200}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>

                    <button data-testid="submit-btn" type="submit">
                        Submit Feedback <span>→</span>
                    </button>

                    {submitted && (
                        <p className="success" data-testid="success-msg" role="status">
                            ✓ Thank you, {name}! Feedback submitted.
                        </p>
                    )}
                </form>

                <p className="footer-note">Made for better learning experiences ✨</p>
            </section>
        </main>
    );
}
