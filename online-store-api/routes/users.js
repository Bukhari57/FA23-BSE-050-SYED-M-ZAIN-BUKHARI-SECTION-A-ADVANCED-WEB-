// routes/users.js

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// GET /users/:id
// Demonstrates Route Parameters
router.get('/:id', userController.getUserById);

// POST /users
// Demonstrates req.body
router.post('/', userController.createUser);

module.exports = router;