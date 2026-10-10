// ─── Server Entry Point ─────────────────────────────────────────────
// Starts the Express app on the configured port (default 3000).

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Secure Task Manager API running on http://localhost:${PORT}`);
});
