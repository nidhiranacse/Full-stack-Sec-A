const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
});

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis connected");
        }
    } catch (error) {
        console.log("Redis unavailable - continuing without Redis");
    }
};

module.exports = {
    redisClient,
    connectRedis
};