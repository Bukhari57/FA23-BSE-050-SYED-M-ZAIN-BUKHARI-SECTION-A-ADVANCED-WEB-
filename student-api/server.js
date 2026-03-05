const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const studentRoutes = require("./routes/studentRoutes");
const rateLimiter = require("./middleware/rateLimiter");
const authenticateToken = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

const SECRET_KEY = "mysecretkey"; // secret for JWT

// Login route - generates JWT token
app.post("/login", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username required" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
        message: "Login successful",
        token
    });
});

// Protected route
app.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Protected profile",
        user: req.user
    });
});

// Student routes
app.use("/students", studentRoutes);

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});