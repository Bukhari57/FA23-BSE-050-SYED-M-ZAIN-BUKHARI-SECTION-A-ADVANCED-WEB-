const pool = require('../config/db');

async function listWarehouses(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, location, created_at FROM warehouses ORDER BY name ASC');
    res.json({ success: true, warehouses: rows });
  } catch (error) {
    next(error);
  }
}

async function createWarehouse(req, res, next) {
  try {
    const { name, location = '' } = req.body;
    const [result] = await pool.query(
      'INSERT INTO warehouses (name, location) VALUES (?, ?)',
      [name, location]
    );
    res.status(201).json({ success: true, message: 'Warehouse created', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Warehouse name already exists' });
    }
    next(error);
  }
}

async function updateWarehouse(req, res, next) {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    await pool.query(
      'UPDATE warehouses SET name = ?, location = ? WHERE id = ?',
      [name, location, id]
    );
    res.json({ success: true, message: 'Warehouse updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Warehouse name already exists' });
    }
    next(error);
  }
}

async function deleteWarehouse(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM warehouses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Warehouse deleted' });
  } catch (error) {
    next(error);
  }
}

async function getWarehouseStats(req, res, next) {
  try {
    const [warehouses] = await pool.query('SELECT id, name FROM warehouses');
    const stats = [];

    for (const warehouse of warehouses) {
      const [[{ total_products, total_value, total_stock, low_stock }]] = await pool.query(
        `SELECT 
          COUNT(*) as total_products,
          COALESCE(SUM(price * quantity), 0) as total_value,
          COALESCE(SUM(quantity), 0) as total_stock,
          COUNT(CASE WHEN quantity <= 5 THEN 1 END) as low_stock
        FROM products WHERE warehouse = ?`,
        [warehouse.name]
      );

      stats.push({
        id: warehouse.id,
        name: warehouse.name,
        totalProducts: total_products,
        totalValue: total_value,
        totalStock: total_stock,
        lowStock: low_stock,
      });
    }

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
}

module.exports = { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getWarehouseStats };
