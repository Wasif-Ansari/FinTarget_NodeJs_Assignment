const Redis = require('ioredis');
const moment = require('moment');
const redisClient = new Redis({ url: "redis://localhost:6379" }); // connect to redis on local server

const rateLimit = 60; // time window is 60 seconds (1 minute)
const reqAllowed = 20; // allow 20 requests in 1 minute

module.exports = {
    rateLimiterForMinute: async (req, res, next) => {
        const userId = req.headers["user_id"]; // get user id from request headers
        // handeling the case where userId is not present in headers
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "user id is required in headers"
            });
        }

        const currentTime = moment().unix(); // get the current time in unix format (seconds)

        try {
            // fetch stored data for user (created time and request count)
            const result = await redisClient.hgetall(`${userId}_minute`);

            if (Object.keys(result).length === 0) {
                // if it's the first request in this time window, set the initial count and timestamp
                await redisClient.hmset(`${userId}_minute`, { "createdAt": currentTime, "count": 1 });
                return next(); // move to next middleware or route handler
            }

            const createdAt = parseInt(result["createdAt"], 10); // get time of first request in this window
            let count = parseInt(result["count"], 10); // get current request count

            // calculate time difference from when first request was made
            const diff = currentTime - createdAt;

            if (diff > rateLimit) {
                // if the time window has passed, reset the count and time
                await redisClient.hmset(`${userId}_minute`, { "createdAt": currentTime, "count": 1 });
                return next(); // allow the request
            }

            if (count >= reqAllowed) {
                // if user has exceeded the allowed number of requests, return an error
                return res.status(429).json({
                    success: false,
                    message: "user rate-limited for exceeding 20 requests per minute"
                });
            }

            // if still within the time window and limit, increase the count
            await redisClient.hincrby(`${userId}_minute`, "count", 1);
            return next(); // allow the request

        } catch (err) {
            console.error("redis error:", err); // log any redis error
            return res.status(500).json({
                success: false,
                message: "internal server error"
            });
        }
    }
};
