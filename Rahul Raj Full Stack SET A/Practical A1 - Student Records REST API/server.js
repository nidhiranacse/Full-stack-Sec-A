const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Student Records REST API server listening on http://localhost:${PORT}`);
});
