require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const issueRoutes = require("./routes/issues");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    error: {
      code: err.code || "SERVER_ERROR",
      message: err.message || "Internal server error"
    }
  });
});

module.exports = app;