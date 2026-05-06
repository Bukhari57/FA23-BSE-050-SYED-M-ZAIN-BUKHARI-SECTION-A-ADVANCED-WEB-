const pool = require('../config/db');

async function listProducts(req, res, next) {
  try {
    const { search = '', category = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT p.id, p.name, c.name AS category, p.price, p.quantity, p.warehouse,
        CASE WHEN p.quantity <= 5 THEN 'Low Stock' ELSE 'In Stock' END AS status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}`,
      params
    );

    res.json({ success: true, products: rows, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, category_id, price, quantity, warehouse = 'Main' } = req.body;
    await pool.query(
      'INSERT INTO products (name, category_id, price, quantity, warehouse) VALUES (?, ?, ?, ?, ?)',
      [name, category_id, price, quantity, warehouse]
    );
    res.status(201).json({ success: true, message: 'Product added' });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category_id, price, quantity, warehouse = 'Main' } = req.body;
    await pool.query(
      'UPDATE products SET name = ?, category_id = ?, price = ?, quantity = ?, warehouse = ? WHERE id = ?',
      [name, category_id, price, quantity, warehouse, id]
    );
    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    next(error);
  }
}

async function updateProductStock(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    await pool.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, id]);
    res.json({ success: true, message: 'Stock updated', quantity });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listProducts, createProduct, updateProduct, updateProductStock, deleteProduct };
