
const db = require("./database");

const tables = db
  .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name IN ('menu_items', 'orders')
    ORDER BY name
  `)
  .all();

console.log("Tables created:", tables);

db.close();
