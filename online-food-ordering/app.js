const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = 3000;

// Database
const db = require('./models');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
const menuitemRoutes = require('./routes/menuitems');
const orderRoutes = require('./routes/orders');

app.use('/menuitems', menuitemRoutes);
app.use('/orders', orderRoutes);

// Demo UI route
app.get('/demo', (req, res) => {
    res.render('demo');
});

app.get('/', (req, res) => {
    res.redirect('/menuitems');
});

// Sync DB, seed sample data, and start server
// use 'alter' to update schema in development when models change
db.sequelize.sync({ alter: true }).then(async () => {
    // seed only if empty
    const count = await db.MenuItem.count();
    if (count === 0) {
        await db.MenuItem.bulkCreate([
            { name: 'Margherita Pizza', description: 'Classic cheese & tomato', price: 8.99, imageUrl: 'https://via.placeholder.com/300x200?text=Pizza', category: 'Pizza', iconClass: 'fas fa-pizza-slice' },
            { name: 'Veggie Burger', description: 'Grilled patty with veggies', price: 6.49, imageUrl: 'https://via.placeholder.com/300x200?text=Burger', category: 'Burger', iconClass: 'fas fa-hamburger' },
            { name: 'Caesar Salad', description: 'Romaine lettuce with dressing', price: 5.99, imageUrl: 'https://via.placeholder.com/300x200?text=Salad', category: 'Salad', iconClass: 'fas fa-leaf' },
        ]);
        console.log('Seeded sample menu items');
    }

    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});