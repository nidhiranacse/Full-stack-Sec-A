
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const itemsRouter = require("./routes/items");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/orders", ordersRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to QuickBite API!",
  });
});

// Menu APIs
app.use("/api/items", itemsRouter);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`QuickBite server running at http://localhost:${PORT}`);
});
