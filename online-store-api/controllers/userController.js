// controllers/userController.js

// GET /users/:id
// Demonstrating req.params

exports.getUserById = (req, res) => {

    const userId = req.params.id;

    res.status(200).json({
        message: "User fetched successfully",
        userId: userId
    });
};


// POST /users
// Demonstrating req.body

exports.createUser = (req, res) => {

    const { name, email } = req.body;

    res.status(201).json({
        message: "User created successfully",
        user: {
            id: Date.now(),
            name,
            email
        }
    });
};