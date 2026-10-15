import { io } from "socket.io-client";

export const connectSocket = (token) => {
  return io("http://localhost:5000", {
    auth: {
      token,
    },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};