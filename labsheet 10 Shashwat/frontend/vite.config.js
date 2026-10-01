import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy REST API calls to Express backend
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy Socket.io WebSocket connections
      '/socket.io': {
        target:       'http://localhost:5000',
        ws:           true,
        changeOrigin: true,
      },
    },
  },
});
