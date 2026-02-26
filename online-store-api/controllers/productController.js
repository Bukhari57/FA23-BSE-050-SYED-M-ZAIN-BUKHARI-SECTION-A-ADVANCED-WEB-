// controllers/productController.js

// Business Logic Layer
// Restaurant Analogy:
// This is the KITCHEN preparing food 🍳

exports.getAllProducts = (req, res) => {

    const products = [
        { id: 1, name: "Laptop", price: 1000 },
        { id: 2, name: "Phone", price: 500 },
        { id: 3, name: "Headphones", price: 100 }
    ];

    res.status(200).json(products);
};