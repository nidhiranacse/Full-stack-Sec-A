import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    course: "",
    marks: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add / Update student
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.rollNo || !form.course || form.marks === "") {
      setMessage("Please fill all fields.");
      return;
    }

    if (Number(form.marks) < 0 || Number(form.marks) > 100) {
      setMessage("Marks must be between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          marks: Number(form.marks),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Operation failed");
      }

      setMessage(
        editingId
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      resetForm();
      fetchStudents();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (student) => {
    setEditingId(student._id);

    setForm({
      name: student.name,
      rollNo: student.rollNo,
      course: student.course,
      marks: student.marks,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      setMessage("Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Reset
  const resetForm = () => {
    setForm({
      name: "",
      rollNo: "",
      course: "",
      marks: "",
    });

    setEditingId(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <div className="logo">🎓 StudentHub</div>
          <p>Student Record Management System</p>
        </div>

        <div className="header-badge">
          Full Stack CRUD
        </div>
      </header>

      <main className="container">
        {/* Hero */}
        <section className="hero">
          <div>
            <span className="eyebrow">ACADEMIC MANAGEMENT</span>
            <h1>
              Manage Student
              <span> Records Easily.</span>
            </h1>

            <p>
              Add, update, view and delete student records
              through a simple full-stack management dashboard.
            </p>
          </div>

          <div className="hero-icon">🎓</div>
        </section>

        {/* Message */}
        {message && (
          <div className="message">
            <span>✓</span>
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {/* Form */}
        <section className="card form-card">
          <div className="section-title">
            <div>
              <span className="small-label">
                {editingId ? "EDIT RECORD" : "NEW RECORD"}
              </span>

              <h2>
                {editingId
                  ? "Update Student"
                  : "Add New Student"}
              </h2>
            </div>

            <div className="number-icon">01</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  placeholder="e.g. COER001"
                  value={form.rollNo}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Course</label>
                <input
                  type="text"
                  name="course"
                  placeholder="e.g. B.Tech CSE"
                  value={form.course}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Marks</label>
                <input
                  type="number"
                  name="marks"
                  placeholder="0 - 100"
                  min="0"
                  max="100"
                  value={form.marks}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "✓ Update Student"
                    : "+ Add Student"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Records */}
        <section className="card records-card">
          <div className="records-header">
            <div>
              <span className="small-label">
                DATABASE
              </span>
              <h2>Student Records</h2>
            </div>

            <div className="count-badge">
              {students.length} Students
            </div>
          </div>

          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No student records yet</h3>
              <p>
                Add your first student using the form above.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll No.</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id}>
                      <td className="index">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="student-name">
                          <div className="avatar">
                            {student.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{student.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="roll">
                          {student.rollNo}
                        </span>
                      </td>

                      <td>{student.course}</td>

                      <td>
                        <span
                          className={`marks ${student.marks >= 75
                              ? "excellent"
                              : student.marks >= 50
                                ? "good"
                                : "low"
                            }`}
                        >
                          {student.marks}/100
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(student)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(student._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>
          StudentHub • Full Stack Development Lab •
          React + Express + MongoDB
        </p>
      </footer>
    </div>
  );
}

export default App;