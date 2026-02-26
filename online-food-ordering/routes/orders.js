const express = require('express');
const router = express.Router();
const db = require('../models');
const Order = db.Order;

// List all orders (summary)
router.get('/', async (req, res) => {
    const orders = await Order.findAll({ order: [['createdAt','DESC']] });
    res.render('orders/index', { orders });
});

// New order page; cart handled client-side
router.get('/new', (req, res) => {
    res.render('orders/create');
});

// Create order from cart data
router.post('/', async (req, res) => {
    try {
        const { customerName, cartItems, totalPrice } = req.body;
        const items = JSON.parse(cartItems || '[]');
        await Order.create({ customerName, items, totalPrice });
        res.redirect('/orders');
    } catch (err) {
        console.error(err);
        res.redirect('/orders/new');
    }
});

// Show order details
router.get('/:id', async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.redirect('/orders');
    res.render('orders/show', { order });
});

// Edit form (customer name and status only)
router.get('/:id/edit', async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.redirect('/orders');
    res.render('orders/edit', { order });
});

// Update order
router.put('/:id', async (req, res) => {
    const { customerName, status } = req.body;
    await Order.update({ customerName, status }, { where: { id: req.params.id } });
    res.redirect('/orders');
});

// Delete order
router.delete('/:id', async (req, res) => {
    await Order.destroy({ where: { id: req.params.id } });
    res.redirect('/orders');
});

module.exports = router;