function validateInput(req, res, next) {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent basic XSS
    const pattern = /<|>|script/;
    if (pattern.test(name) || pattern.test(email) || pattern.test(department)) {
        return res.status(400).json({ message: "Invalid characters detected" });
    }

    next();
}

module.exports = validateInput;