const jwt = require("jsonwebtoken");

const setupSocket = (io) => {
    // Authenticate every Socket.io connection using JWT
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // Handle connected users
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.user.userId}`);

        // Put user into a private room
        socket.join(`user:${socket.user.userId}`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.user.userId}`);
        });
    });
};

module.exports = setupSocket;