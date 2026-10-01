const express = require("express");
const cors = require("cors");
const sequelize = require("./database");
const Student = require("./models/Student");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
app.use(cors());

const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Student Record Management API is running!");
});

// Student CRUD routes
app.use("/students", studentRoutes);

sequelize
    .sync()
    .then(() => {
        console.log("Database connected and table created successfully.");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });