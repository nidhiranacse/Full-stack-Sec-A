const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const studentRoutes = require("./routes/studentRoutes");

app.use("/students", studentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });