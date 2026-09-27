// Rate Limiter middleware for authentication endpoints (Bonus Challenge)
const ipRequestCounts = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} maxRequests - Max requests allowed in the window (default 10)
 */
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 10) => {
    return (req, res, next) => {
        const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const currentTime = Date.now();

        if (!ipRequestCounts.has(clientIp)) {
            ipRequestCounts.set(clientIp, {
                count: 1,
                resetTime: currentTime + windowMs
            });
            return next();
        }

        const clientData = ipRequestCounts.get(clientIp);

        // Reset if window has passed
        if (currentTime > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = currentTime + windowMs;
            return next();
        }

        clientData.count += 1;

        if (clientData.count > maxRequests) {
            const retryAfterSec = Math.ceil((clientData.resetTime - currentTime) / 1000);
            return res.status(429).json({
                success: false,
                message: `Too many login attempts. Please try again after ${retryAfterSec} seconds.`,
                retryAfter: retryAfterSec
            });
        }

        next();
    };
};

module.exports = { rateLimiter };
