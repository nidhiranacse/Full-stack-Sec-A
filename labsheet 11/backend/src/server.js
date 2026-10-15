// Author: Radha Pandey, CSE - CampusConnect
const app = require('./app');
const config = require('./config');
const { sequelize } = require('./db');

(async () => {
  try {
    await sequelize.sync();
    app.listen(config.port, () => console.log(`CampusConnect API running on http://localhost:${config.port}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
