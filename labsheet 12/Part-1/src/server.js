// ──────────────────────────────────────────────────────────────
// Server Entry Point  –  npm start runs this file
// ──────────────────────────────────────────────────────────────

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀  Task Manager API running on http://localhost:${PORT}\n`);
  console.log('  Endpoints:');
  console.log('    POST   /auth/register   – Create a new account');
  console.log('    POST   /auth/login      – Get a JWT token');
  console.log('    GET    /tasks           – List your tasks (paginated, filterable)');
  console.log('    POST   /tasks           – Create a task');
  console.log('    GET    /tasks/:id       – Get a single task');
  console.log('    PUT    /tasks/:id       – Update a task');
  console.log('    DELETE /tasks/:id       – Delete a task\n');
});
