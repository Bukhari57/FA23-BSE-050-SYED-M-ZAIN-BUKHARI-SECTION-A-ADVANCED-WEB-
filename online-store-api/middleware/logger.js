// middleware/logger.js

// This middleware logs every request
// Restaurant Analogy:
// This is the WAITER noting down what customer ordered

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Pass control to next middleware or route
};

module.exports = logger;