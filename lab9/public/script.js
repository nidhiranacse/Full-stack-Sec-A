const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const studentId = document.getElementById("studentId");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

let students = [];

async function loadStudents() {
    try {
        const response = await fetch("/students");
        if (!response.ok) throw new Error("Unable to load records");

        students = await response.json();
        displayStudents(students);
        updateStats(students);
    } catch (error) {
        studentTable.innerHTML = `
            <tr><td colspan="6" class="empty-state">
                Unable to load student records.
            </td></tr>`;
    }
}

function displayStudents(data) {
    if (data.length === 0) {
        studentTable.innerHTML = `
            <tr><td colspan="6" class="empty-state">
                No student records found.
            </td></tr>`;
        return;
    }

    studentTable.innerHTML = data.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.rollNo}</td>
            <td>${student.course}</td>
            <td><span class="marks">${student.marks}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editStudent('${student._id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        </tr>
    `).join("");
}

function updateStats(data) {
    document.getElementById("totalStudents").textContent = data.length;

    const courses = new Set(data.map(student => student.course));
    document.getElementById("totalCourses").textContent = courses.size;

    const average = data.length
        ? data.reduce((sum, student) => sum + student.marks, 0) / data.length
        : 0;

    document.getElementById("averageMarks").textContent = average.toFixed(1);
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const rollNo = document.getElementById("rollNo").value.trim();
    const course = document.getElementById("course").value;
    const marks = Number(document.getElementById("marks").value);

    if (!name || !rollNo || !course) {
        showMessage("Please fill all required fields.", "error");
        return;
    }

    if (marks < 0 || marks > 100 || document.getElementById("marks").value === "") {
        showMessage("Marks must be between 0 and 100.", "error");
        return;
    }

    const data = { name, rollNo, course, marks };
    const id = studentId.value;

    try {
        const response = await fetch(id ? `/students/${id}` : "/students", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Request failed");
        }

        showMessage(id ? "Student updated successfully!" : "Student added successfully!", "success");
        resetForm();
        loadStudents();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function editStudent(id) {
    try {
        const response = await fetch(`/students/${id}`);
        const student = await response.json();

        if (!response.ok) throw new Error(student.message);

        studentId.value = student._id;
        document.getElementById("name").value = student.name;
        document.getElementById("rollNo").value = student.rollNo;
        document.getElementById("course").value = student.course;
        document.getElementById("marks").value = student.marks;

        formTitle.textContent = "Update Student";
        submitBtn.innerHTML = "<span>✓</span> Update Student";
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`/students/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        showMessage("Student deleted successfully!", "success");
        loadStudents();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)
    );

    displayStudents(filtered);
});

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
    form.reset();
    studentId.value = "";
    formTitle.textContent = "Add New Student";
    submitBtn.innerHTML = "<span>＋</span> Add Student";
}

function showMessage(text, type) {
    message.textContent = text;
    message.style.color = type === "success" ? "#4ade80" : "#f87171";

    setTimeout(() => {
        message.textContent = "";
    }, 3000);
}

loadStudents();