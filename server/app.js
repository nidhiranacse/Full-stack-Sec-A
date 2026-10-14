
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const { router: issueRoutes } = require("./routes/issues");

const { authenticate } = require("./middleware/auth");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/books", authenticate, bookRoutes);
app.use("/api/issues", authenticate, issueRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found."
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);

  if (res.headersSent) return next(err);

  const status = err.status || (err.type === "entity.parse.failed" ? 400 : 500);

  res.status(status).json({
    error: {
      code: err.code || (status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR"),
      message: status === 500
        ? "An internal server error occurred."
        : status === 400
          ? "Invalid request body."
          : err.message
    }
  });
});

module.exports = app;
