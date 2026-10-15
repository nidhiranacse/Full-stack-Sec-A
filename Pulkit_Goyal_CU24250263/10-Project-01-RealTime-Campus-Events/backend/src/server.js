require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket listeners
initSocket(io);

// Connect DB & start server
connectDB().finally(() => {
  server.listen(PORT, () => {
    console.log(`✓ Project 1 Server & WebSockets running on port ${PORT}`);
    console.log(`  Student: Pulkit Goyal (CU24250263 | Roll 40 | Sec A)`);
  });
});
