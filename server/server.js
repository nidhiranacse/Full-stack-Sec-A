
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in the .env file.");
}

app.listen(PORT, () => {
  console.log(`BookNest API running at http://localhost:${PORT}`);
});
