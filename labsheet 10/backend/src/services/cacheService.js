const { redisClient } = require("../config/redis");

const EVENTS_CACHE_KEY = "events:all";

const getCachedEvents = async () => {
  try {
    const data = await redisClient.get(EVENTS_CACHE_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

const setCachedEvents = async (events) => {
  try {
    await redisClient.setEx(
      EVENTS_CACHE_KEY,
      60,
      JSON.stringify(events)
    );
  } catch (error) {
    console.error("Redis SET error:", error.message);
  }
};

const invalidateEventsCache = async () => {
  try {
    await redisClient.del(EVENTS_CACHE_KEY);
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
  }
};

module.exports = {
  getCachedEvents,
  setCachedEvents,
  invalidateEventsCache,
};