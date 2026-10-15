require('dotenv').config();

const http = require('http');

const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/sockets');

const app = createApp();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const io = initSocket(server, FRONTEND_ORIGIN);

app.set('io', io);

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
}

startServer();