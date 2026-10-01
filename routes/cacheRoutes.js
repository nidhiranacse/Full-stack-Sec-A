const express = require("express");
const { redisClient } = require("../config/redis");

const router = express.Router();

router.get("/benchmark", async (req, res) => {
    const startTime = Date.now();

    const cacheKey = "campusconnect:benchmark";

    try {
        // Check Redis cache
        if (redisClient.isReady) {
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return res.json({
                    source: "Redis Cache",
                    responseTime: `${Date.now() - startTime} ms`,
                    data: JSON.parse(cachedData)
                });
            }
        }

        // Simulated database/data operation
        const data = {
            message: "CampusConnect cached data",
            timestamp: new Date().toISOString()
        };

        // Store data in Redis
        if (redisClient.isReady) {
            await redisClient.setEx(
                cacheKey,
                60,
                JSON.stringify(data)
            );
        }

        res.json({
            source: "Database",
            responseTime: `${Date.now() - startTime} ms`,
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Cache benchmark failed",
            error: error.message
        });
    }
});

module.exports = router;