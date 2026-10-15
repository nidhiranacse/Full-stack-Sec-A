'use strict';
const path = require('path');
const express = require('express');
const registerRoutes = require('./routes');

function createApp() {
  const app = express();

  app.use(express.json());

  if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
      next();
    });
  }

  registerRoutes(app);

  // Serve the frontend (../frontend) from the same origin -> no CORS needed
  app.use(express.static(path.join(__dirname, '..', 'frontend')));

  // Central error handler (must have 4 arguments)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
