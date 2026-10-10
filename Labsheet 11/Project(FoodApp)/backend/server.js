const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to QuickBite API");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "QuickBite API is running"
    });
});

app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`QuickBite server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();