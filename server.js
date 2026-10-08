const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const itemRoutes = require("./routes/items");
const orderRoutes = require("./routes/orders");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/quickbite")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

app.get("/", (req, res) => {
    res.send("QuickBite API is running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});