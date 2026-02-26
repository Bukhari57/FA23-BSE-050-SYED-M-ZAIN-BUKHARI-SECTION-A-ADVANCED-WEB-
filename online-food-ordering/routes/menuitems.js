const express = require('express');
const router = express.Router();
const db = require('../models');
const MenuItem = db.MenuItem;

// List all menu items
router.get('/', async (req, res) => {
    const items = await MenuItem.findAll();
    res.render('menuitems/index', { items });
});

// Create form
router.get('/new', (req, res) => res.render('menuitems/create'));

// Create new menu item
router.post('/', async (req, res) => {
    await MenuItem.create(req.body);
    res.redirect('/menuitems');
});

// Show detail
router.get('/:id', async (req, res) => {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.redirect('/menuitems');
    res.render('menuitems/show', { item });
});

// Edit form
router.get('/:id/edit', async (req, res) => {
    const item = await MenuItem.findByPk(req.params.id);
    res.render('menuitems/edit', { item });
});

// Update menu item
router.put('/:id', async (req, res) => {
    await MenuItem.update(req.body, { where: { id: req.params.id } });
    res.redirect('/menuitems');
});

// Delete menu item
router.delete('/:id', async (req, res) => {
    await MenuItem.destroy({ where: { id: req.params.id } });
    res.redirect('/menuitems');
});

module.exports = router;