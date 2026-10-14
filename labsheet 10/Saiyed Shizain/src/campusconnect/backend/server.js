// Lab Sheet 10 — CampusConnect entry point (Saiyed Shizain):
// HTTP server + Socket.io + Mongo connect (exits if Mongo is unreachable).
const http = require("http");
const connectDB = require("./src/config/db");
const createApp = require("./src/app");
const initSocket = require("./src/sockets");

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

connectDB()
  .then(() => {
    const app = createApp();
    const httpServer = http.createServer(app);
    const io = initSocket(httpServer, CORS_ORIGIN);
    app.set("io", io);
    httpServer.listen(PORT, () => {
      console.log(`[server] CampusConnect API + sockets listening on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] MongoDB unavailable, exiting:", err.message);
    process.exit(1);
  });
