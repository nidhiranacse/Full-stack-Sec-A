
import { useState } from "react";

export default function FeedbackForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

    const [errors, setErrors] = useState({});
    const [submittedName, setSubmittedName] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (
            !email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            newErrors.email = "Enter a valid email address";
        }

        if (!rating) {
            newErrors.rating = "Please select a rating";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setSubmittedName(name.trim());
            setName("");
            setEmail("");
            setRating("");
            setComment("");
        } else {
            setSubmittedName("");
        }
    }

    return (
        <div className="feedback-container">
            <h2>Course Feedback Form</h2>

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="name-input">Name</label>
                    <input
                        id="name-input"
                        data-testid="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrors(prev => ({
                                ...prev,
                                name: ""
                            }));
                            setSubmittedName("");
                        }}
                    />

                    {errors.name && (
                        <p data-testid="name-error" role="alert">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="email-input">Email</label>
                    <input
                        id="email-input"
                        data-testid="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors(prev => ({
                                ...prev,
                                email: ""
                            }));
                            setSubmittedName("");
                        }}
                    />

                    {errors.email && (
                        <p data-testid="email-error" role="alert">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="rating-select">Rating</label>
                    <select
                        id="rating-select"
                        data-testid="rating-select"
                        value={rating}
                        onChange={(e) => {
                            setRating(e.target.value);
                            setErrors(prev => ({
                                ...prev,
                                rating: ""
                            }));
                            setSubmittedName("");
                        }}
                    >
                        <option value="">Select rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    {errors.rating && (
                        <p data-testid="rating-error" role="alert">
                            {errors.rating}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="comment-input">Comment</label>
                    <textarea
                        id="comment-input"
                        data-testid="comment-input"
                        value={comment}
                        maxLength={200}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <p data-testid="comment-count">
                        {comment.length}/200
                    </p>
                </div>

                <button
                    type="submit"
                    data-testid="submit-btn"
                >
                    Submit Feedback
                </button>
            </form>

            {submittedName && (
                <p data-testid="success-msg" role="status">
                    Thank you, {submittedName}! Feedback submitted.
                </p>
            )}
        </div>
    );
}
