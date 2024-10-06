const Redis = require('ioredis');
const moment = require('moment');
const redisClient = new Redis({ url: "redis://localhost:6379" }); // connect to redis on local server

const rateLimit = 1; // time window is 1 second
const reqAllowed = 1; // allow 1 request per second

module.exports = {
    rateLimiterForSecond: async (req, res, next) => {
        const userId = req.headers["user_id"]; // get user id from headers
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "user id is required in headers" // return error if no user id
            });
        }

        const currentTime = moment().unix(); // get current time in unix format (seconds)

        try {
            // fetch stored data for user (createdAt and count)
            const result = await redisClient.hgetall(`${userId}_second`);

            if (Object.keys(result).length === 0) {
                // if it's the first request in this time window, set initial count and time
                await redisClient.hmset(`${userId}_second`, { "createdAt": currentTime, "count": 1 });
                return next(); // move to next middleware or route handler
            }

            const createdAt = parseInt(result["createdAt"], 10); // get time of first request in this window
            let count = parseInt(result["count"], 10); // get current request count

            // calculate time difference from when first request was made
            const diff = currentTime - createdAt;

            if (diff > rateLimit) {
                // if 1 second has passed, reset the count and time
                await redisClient.hmset(`${userId}_second`, { "createdAt": currentTime, "count": 1 });
                return next(); // allow the request
            }

            if (count >= reqAllowed) {
                // if user has exceeded 1 request per second, return error
                return res.status(429).json({
                    success: false,
                    message: "user rate-limited for exceeding 1 request per second"
                });
            }

            // if still within the time window, increase the count
            await redisClient.hincrby(`${userId}_second`, "count", 1);
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
