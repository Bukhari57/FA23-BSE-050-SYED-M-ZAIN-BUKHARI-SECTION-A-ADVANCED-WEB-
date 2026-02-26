// routes/products.js

const express = require('express');
const router = express.Router();

// Import Controller
const productController = require('../controllers/productController');

// Router handles only product-related endpoints
// Cleaner than putting everything in app.js

router.get('/', productController.getAllProducts);

module.exports = router;