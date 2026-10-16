'use strict';
const items = require('./controllers/itemController');
const orders = require('./controllers/orderController');

module.exports = function registerRoutes(app) {
  // Menu items
  app.get('/api/items', items.list);
  app.post('/api/items', items.create);
  app.put('/api/items/:id', items.update);
  app.delete('/api/items/:id', items.remove);

  // Orders
  app.post('/api/orders', orders.create);
  app.get('/api/orders', orders.list);
  app.patch('/api/orders/:id/status', orders.updateStatus);

  // Anything else under /api -> JSON 404
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
  });
};
