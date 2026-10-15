import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import './FeedbackForm.css';

export default function App() {
  const [submissions, setSubmissions] = useState([
    {
      name: 'Rahul Raj',
      email: 'rahulsri1208@gmail.com',
      rating: 5,
      comment: 'Excellent Full Stack curriculum with real-world practical assessments!',
      timestamp: 'Just now'
    }
  ]);

  const handleFeedbackSuccess = (newEntry) => {
    setSubmissions((prev) => [
      {
        ...newEntry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
  };

  return (
    <div className="app-layout">
      {/* Primary Feedback Form Component */}
      <FeedbackForm onSubmitSuccess={handleFeedbackSuccess} />

      {/* Submissions Live Feed */}
      {submissions.length > 0 && (
        <div className="submissions-sidebar">
          <div className="sidebar-header">
            <h3>Recent Submissions</h3>
            <span className="count-tag">{submissions.length} Recorded</span>
          </div>
          <div className="submissions-list">
            {submissions.map((sub, idx) => (
              <div key={idx} className="sub-item">
                <div className="sub-top">
                  <span className="sub-name">{sub.name}</span>
                  <span className="sub-rating">★ {sub.rating}/5</span>
                </div>
                <div className="sub-email">{sub.email}</div>
                {sub.comment && <div className="sub-comment">"{sub.comment}"</div>}
                <div className="sub-time">{sub.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
