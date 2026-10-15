
import FeedbackForm from "./FeedbackForm.jsx";
import "./App.css";

export default function App() {
  return (
    <main className="page">
      <header className="top-header">
        <div className="logo">CU</div>
        <div>
          <p className="eyebrow">B.TECH CSE · 3RD YEAR</p>
          <h1>SET B — Practical 2</h1>
          <p className="subtitle">Course Feedback Portal</p>
        </div>
      </header>

      <section className="student-card">
        <div className="student-heading">
          <div className="avatar">JT</div>
          <div>
            <h2>Student Details</h2>
            <p>Your academic information</p>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail">
            <span>Full Name</span>
            <strong>Janvee Tyagi</strong>
          </div>
          <div className="detail">
            <span>Course</span>
            <strong>B.Tech CSE</strong>
          </div>
          <div className="detail">
            <span>Academic Year</span>
            <strong>3rd Year</strong>
          </div>
          <div className="detail">
            <span>Section</span>
            <strong>A</strong>
          </div>
          <div className="detail">
            <span>CU ID</span>
            <strong>CU24250204</strong>
          </div>
          <div className="detail">
            <span>Roll Number</span>
            <strong>24</strong>
          </div>
        </div>
      </section>

      <FeedbackForm />

      <footer>Course Feedback Portal · SET B - Practical 2</footer>
    </main>
  );
}
