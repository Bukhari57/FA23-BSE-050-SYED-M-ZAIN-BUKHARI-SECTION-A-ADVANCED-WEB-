// middleware/auth.js

// Simulated Authentication Middleware
// Restaurant Analogy:
// This is SECURITY checking if customer has VIP pass 🎟️

const auth = (req, res, next) => {

    const token = req.headers.authorization;

    if (token === "Bearer validtoken") {
        next(); // Access granted
    } else {
        res.status(401).json({
            message: "Unauthorized - Invalid or Missing Token"
        });
    }
};

module.exports = auth;