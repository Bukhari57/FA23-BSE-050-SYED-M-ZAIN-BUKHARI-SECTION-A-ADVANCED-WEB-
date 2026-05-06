const pool = require('../config/db');

async function listMovements(req, res, next) {
  try {
    const { page = 1, limit = 20, product_id, type, warehouse_id } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT sm.*, p.name as product_name, w.name as warehouse_name FROM stock_movements sm LEFT JOIN products p ON sm.product_id = p.id LEFT JOIN warehouses w ON sm.warehouse_id = w.id WHERE 1=1';
    const params = [];

    if (product_id) {
      query += ' AND sm.product_id = ?';
      params.push(product_id);
    }
    if (type) {
      query += ' AND sm.type = ?';
      params.push(type);
    }
    if (warehouse_id) {
      query += ' AND sm.warehouse_id = ?';
      params.push(warehouse_id);
    }

    query += ' ORDER BY sm.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [movements] = await pool.query(query, params);

    const countQuery = 'SELECT COUNT(*) as total FROM stock_movements WHERE 1=1' + (product_id ? ' AND product_id = ?' : '') + (type ? ' AND type = ?' : '') + (warehouse_id ? ' AND warehouse_id = ?' : '');
    const countParams = [];
    if (product_id) countParams.push(product_id);
    if (type) countParams.push(type);
    if (warehouse_id) countParams.push(warehouse_id);
    
    const [count] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count[0].total,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createMovement(req, res, next) {
  try {
    const { product_id, type, quantity, warehouse_id, reference_id, notes } = req.body;
    const user_id = req.user.id;

    if (!product_id || !type || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create movement record
      const [result] = await connection.query(
        'INSERT INTO stock_movements (product_id, type, quantity, warehouse_id, reference_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product_id, type, quantity, warehouse_id, reference_id || null, notes, user_id]
      );

      // Update product quantity based on type
      let quantityChange = quantity;
      if (type === 'outbound' || type === 'damage') {
        quantityChange = -quantity;
      } else if (type === 'adjustment') {
        quantityChange = quantity; // Can be positive or negative
      }

      if (quantityChange < 0) {
        const [products] = await connection.query('SELECT quantity FROM products WHERE id = ?', [product_id]);
        if (!products.length) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (products[0].quantity < Math.abs(quantityChange)) {
          return res.status(400).json({ success: false, message: 'Insufficient stock for this movement' });
        }
      }

      await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [quantityChange, product_id]);

      await connection.commit();
      res.status(201).json({ success: true, message: 'Movement recorded', id: result.insertId });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

async function getStockHistory(req, res, next) {
  try {
    const product_id = req.params.product_id || req.query.product_id;
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [movements] = await pool.query(
      'SELECT sm.*, p.name as product_name FROM stock_movements sm LEFT JOIN products p ON sm.product_id = p.id WHERE sm.product_id = ? AND sm.created_at >= ? ORDER BY sm.created_at ASC',
      [product_id, startDate]
    );

    res.json({ success: true, movements });
  } catch (error) {
    next(error);
  }
}

module.exports = { listMovements, createMovement, getStockHistory };
