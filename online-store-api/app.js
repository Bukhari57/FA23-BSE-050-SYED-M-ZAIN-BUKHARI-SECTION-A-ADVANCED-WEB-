// app.js
const express = require('express');
const app = express();

// Import Middleware
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');

// Import Routers
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

app.use(express.json());
app.use(logger);

// ------------------------------
// Homepage with full test buttons
// ------------------------------
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mini Online Store API</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                button { margin: 5px; padding: 10px; }
                pre { background: #f3f3f3; padding: 10px; }
            </style>
        </head>
        <body>
            <h1>🛒 Mini Online Store API Dashboard</h1>
            <p>Click buttons to test API endpoints:</p>
            
            <h2>Products</h2>
            <button onclick="fetchProducts()">GET /products</button>
            <pre id="products"></pre>

            <h2>Users</h2>
            <button onclick="fetchUser()">GET /users/1</button>
            <pre id="user"></pre>

            <button onclick="createUser()">POST /users</button>
            <pre id="createUser"></pre>

            <button onclick="updateUser()">PUT /users/1</button>
            <pre id="updateUser"></pre>

            <button onclick="deleteUser()">DELETE /users/1</button>
            <pre id="deleteUser"></pre>

            <script>
                const authToken = 'Bearer validtoken';

                // Products
                function fetchProducts() {
                    fetch('/products')
                    .then(res => res.json())
                    .then(data => document.getElementById('products').textContent = JSON.stringify(data, null, 2));
                }

                // Users GET
                function fetchUser() {
                    fetch('/users/1', { headers: { 'Authorization': authToken } })
                    .then(res => res.json())
                    .then(data => document.getElementById('user').textContent = JSON.stringify(data, null, 2));
                }

                // Users POST
                function createUser() {
                    fetch('/users', {
                        method: 'POST',
                        headers: { 
                            'Authorization': authToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: 'Shary', email: 'shary@example.com' })
                    })
                    .then(res => res.json())
                    .then(data => document.getElementById('createUser').textContent = JSON.stringify(data, null, 2));
                }

                // Users PUT
                function updateUser() {
                    fetch('/users/1', {
                        method: 'PUT',
                        headers: { 
                            'Authorization': authToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: 'Shary Updated', email: 'shary2@example.com' })
                    })
                    .then(res => res.json())
                    .then(data => document.getElementById('updateUser').textContent = JSON.stringify(data, null, 2));
                }

                // Users DELETE
                function deleteUser() {
                    fetch('/users/1', {
                        method: 'DELETE',
                        headers: { 'Authorization': authToken }
                    })
                    .then(res => res.json())
                    .then(data => document.getElementById('deleteUser').textContent = JSON.stringify(data, null, 2));
                }
            </script>
        </body>
        </html>
    `);
});

// JSON menu
app.get('/api', (req, res) => {
    res.json({
        products: "/products",
        getUser: "/users/:id",
        createUser: "/users (POST)",
        updateUser: "/users/:id (PUT)",
        deleteUser: "/users/:id (DELETE)"
    });
});

// Mount routers
app.use('/products', productRoutes);
app.use('/users', auth, userRoutes);

// 404 handling
app.use((req, res) => {
    res.status(404).json({ message: "404 Not Found" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000`);
});