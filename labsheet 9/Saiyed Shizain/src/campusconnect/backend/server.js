// Lab Sheet 9 — CampusConnect API entry point (Saiyed Shizain).
// Connects to MongoDB, then serves the Express app.
const connectDB = require("./src/config/db");
const createApp = require("./src/app");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    createApp().listen(PORT, () => {
      console.log(`[server] CampusConnect API listening on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] MongoDB unavailable, exiting:", err.message);
    process.exit(1);
  });
