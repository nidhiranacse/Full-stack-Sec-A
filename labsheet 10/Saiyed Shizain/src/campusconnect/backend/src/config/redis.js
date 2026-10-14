const Redis = require("ioredis");

// Single shared client; cache middleware and benchmark use this instance.
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  lazyConnect: false,
  maxRetriesPerRequest: 2,
});

redisClient.on("connect", () => console.log("[redis] connected"));
redisClient.on("error", (err) => console.error("[redis] error:", err.message));

module.exports = redisClient;
