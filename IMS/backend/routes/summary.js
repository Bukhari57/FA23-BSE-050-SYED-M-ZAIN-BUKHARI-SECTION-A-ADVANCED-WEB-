const express = require('express');
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ total_categories }]] = await pool.query('SELECT COUNT(*) AS total_categories FROM categories');
    const [[{ low_stock }]] = await pool.query('SELECT COUNT(*) AS low_stock FROM products WHERE quantity <= 5');
    const [topCategories] = await pool.query(
      `SELECT c.name AS category, COUNT(p.id) AS count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      summary: { total_products, total_categories, low_stock, topCategories },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
