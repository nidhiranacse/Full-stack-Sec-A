/**
 * Server Entrypoint
 * Starts server on port 3000 (default) with `npm start`
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

let server = null;
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Secure Task Manager API listening on http://localhost:${PORT}`);
    console.log(`Student: Rahul Raj | BTCS303T Coding Assessment`);
    console.log(`====================================================`);
  });
}

// Export Express app so automated grading/tests can import it
module.exports = app;
module.exports.server = server;
