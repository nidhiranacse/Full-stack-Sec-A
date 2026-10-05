import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Initialize Redis (with fallback)
    initRedis();

    // 3. Create HTTP Server
    const httpServer = http.createServer(app);

    // 4. Initialize Socket.io
    initSocket(httpServer);

    // 5. Start listening
    httpServer.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` CampusConnect API Server Running on port ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error);
    process.exit(1);
  }
};

startServer();
