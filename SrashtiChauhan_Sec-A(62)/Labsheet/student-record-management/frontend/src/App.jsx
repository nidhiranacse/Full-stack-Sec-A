import { useEffect, useState } from "react";
import {
  getStudents,
  addStudent,
  deleteStudent,
} from "./services/studentService";

function App() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    course: "",
    marks: "",
  });

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch students when component loads
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add a new student
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addStudent({
        ...formData,
        marks: Number(formData.marks),
      });

      setFormData({
        name: "",
        rollNo: "",
        course: "",
        marks: "",
      });

      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  // Delete a student
  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <div>
      <h1>Student Record Management</h1>

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
          min="0"
          max="100"
          value={formData.marks}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Student</button>
      </form>

      <br />

      <table border="1">
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
                <button onClick={() => handleDelete(student._id)}>
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
