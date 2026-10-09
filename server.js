require("dotenv").config();

const app = require("./app");
const db = require("./db/database");

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Create a server/.env file first.");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`BookNest API running at http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);