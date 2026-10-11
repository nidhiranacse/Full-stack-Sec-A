const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const initSockets = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', credentials: true }
});

initSockets(io);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
