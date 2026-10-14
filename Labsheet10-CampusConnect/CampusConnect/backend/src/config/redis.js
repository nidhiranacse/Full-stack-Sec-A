const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
        reconnectStrategy: false
    }
});

redisClient.on("error", (error) => {
    console.log("Redis unavailable:", error.message);
});

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis connected successfully");
        }
    } catch (error) {
        console.log("Redis is not running. Continuing without Redis.");
    }
};

module.exports = {
    redisClient,
    connectRedis
};