const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // max 20 requests per minute
    message: { message: "Too many requests, please try again later." }
});

module.exports = limiter;