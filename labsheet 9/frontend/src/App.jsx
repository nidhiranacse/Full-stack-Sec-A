import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    course: "",
    marks: "",
  });

  const [editId, setEditId] = useState(null);

  const fetchStudents = async () => {
    const res = await axios.get("http://localhost:5000/students");
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rollNo) {
      alert("Roll Number is required");
      return;
    }

    if (formData.marks < 0 || formData.marks > 100) {
      alert("Marks must be between 0 and 100");
      return;
    }

    if (editId) {
      await axios.put(
        `http://localhost:5000/students/${editId}`,
        formData
      );

      setMessage("Student Updated Successfully");
    } else {
      await axios.post(
        "http://localhost:5000/students",
        formData
      );

      setMessage("Student Added Successfully");
    }

    setFormData({
      name: "",
      rollNo: "",
      course: "",
      marks: "",
    });

    setEditId(null);
    fetchStudents();
  };

  const handleEdit = (student) => {
    setEditId(student._id);

    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      course: student.course,
      marks: student.marks,
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/students/${id}`
    );

    setMessage("Student Deleted Successfully");

    fetchStudents();
  };

  return (
    <div className="container">
      <h1>Student Record Management System</h1>
      {message && (
          <div className="message">
            {message}
          </div>
      )}
      <div className="dashboard">

          <div className="card">
              <h2>{students.length}</h2>
              <p>Total Students</p>
          </div>

          <div className="card">
              <h2>
                {
                  students.length
                  ?
                  Math.round(
                  students.reduce(
                  (sum,s)=>sum+Number(s.marks),0
                  ) / students.length
                  )
                  :
                  0
                }
              </h2>
              <p>Average Marks</p>
          </div>

      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="rollNo"
          placeholder="Roll Number"
          value={formData.rollNo}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="course"
          placeholder="Course"
          value={formData.course}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="marks"
          placeholder="Marks"
          value={formData.marks}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="submit-btn"
        >
          {editId ? "Update Student" : "Add Student"}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Course</th>
            <th>Marks</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.rollNo}</td>
              <td>{student.course}</td>
              <td>{student.marks}</td>

              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(student)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(student._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;