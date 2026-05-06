const pool = require('../config/db');

async function generateTransferNumber() {
  const prefix = 'TRF';
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
}

async function listTransfers(req, res, next) {
  try {
    const { page = 1, limit = 20, status, from_warehouse, to_warehouse } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT wt.*, fw.name as from_warehouse_name, tw.name as to_warehouse_name, p.name as product_name FROM warehouse_transfers wt LEFT JOIN warehouses fw ON wt.from_warehouse_id = fw.id LEFT JOIN warehouses tw ON wt.to_warehouse_id = tw.id LEFT JOIN products p ON wt.product_id = p.id WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND wt.status = ?';
      params.push(status);
    }
    if (from_warehouse) {
      query += ' AND wt.from_warehouse_id = ?';
      params.push(from_warehouse);
    }
    if (to_warehouse) {
      query += ' AND wt.to_warehouse_id = ?';
      params.push(to_warehouse);
    }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM warehouse_transfers WHERE 1=1 ${status ? 'AND status = ?' : ''} ${from_warehouse ? 'AND from_warehouse_id = ?' : ''} ${to_warehouse ? 'AND to_warehouse_id = ?' : ''}`, params);
    const total = countResult[0][0].total;

    query += ' ORDER BY transfer_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [transfers] = await pool.query(query, params);

    res.json({
      success: true,
      transfers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
}

async function createTransfer(req, res, next) {
  try {
    const { from_warehouse_id, to_warehouse_id, product_id, quantity, notes } = req.body;
    const user_id = req.user.id;

    if (!from_warehouse_id || !to_warehouse_id || !product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check stock in source warehouse
      const [products] = await connection.query('SELECT quantity FROM products WHERE id = ? AND warehouse = (SELECT name FROM warehouses WHERE id = ?)', [product_id, from_warehouse_id]);
      
      if (!products.length || products[0].quantity < quantity) {
        throw new Error('Insufficient stock in source warehouse');
      }

      const transferNumber = await generateTransferNumber();

      const [result] = await connection.query(
        'INSERT INTO warehouse_transfers (transfer_number, from_warehouse_id, to_warehouse_id, product_id, quantity, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transferNumber, from_warehouse_id, to_warehouse_id, product_id, quantity, 'in_transit', notes || null, user_id]
      );

      // Reduce from source
      await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);
      await connection.query(
        'INSERT INTO stock_movements (product_id, type, quantity, warehouse_id, reference_type, reference_id, created_by) VALUES (?, "outbound", ?, ?, "warehouse_transfer", ?, ?)',
        [product_id, quantity, from_warehouse_id, result.insertId, user_id]
      );

      await connection.commit();
      res.status(201).json({ success: true, message: 'Transfer created', id: result.insertId, transferNumber });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

async function receiveTransfer(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [transfers] = await connection.query('SELECT * FROM warehouse_transfers WHERE id = ?', [id]);
      if (!transfers.length) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
      }

      const transfer = transfers[0];
      if (!['pending', 'in_transit'].includes(transfer.status)) {
        return res.status(400).json({ success: false, message: 'Transfer is not ready to be received' });
      }

      // Move quantity into destination warehouse stock
      const [sourceProducts] = await connection.query('SELECT * FROM products WHERE id = ?', [transfer.product_id]);
      if (!sourceProducts.length) {
        return res.status(404).json({ success: false, message: 'Source product not found' });
      }

      const sourceProduct = sourceProducts[0];
      const [destWarehouses] = await connection.query('SELECT name FROM warehouses WHERE id = ?', [transfer.to_warehouse_id]);
      if (!destWarehouses.length) {
        return res.status(404).json({ success: false, message: 'Destination warehouse not found' });
      }
      const destinationWarehouseName = destWarehouses[0].name;

      const [destinationProducts] = await connection.query(
        'SELECT id FROM products WHERE name = ? AND category_id <=> ? AND price = ? AND warehouse = ? LIMIT 1',
        [sourceProduct.name, sourceProduct.category_id, sourceProduct.price, destinationWarehouseName]
      );

      if (destinationProducts.length) {
        await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [transfer.quantity, destinationProducts[0].id]);
        await connection.query(
          'INSERT INTO stock_movements (product_id, type, quantity, warehouse_id, reference_type, reference_id, created_by) VALUES (?, "inbound", ?, ?, "warehouse_transfer", ?, ?)',
          [destinationProducts[0].id, transfer.quantity, transfer.to_warehouse_id, id, user_id]
        );
      } else {
        const [productInsert] = await connection.query(
          'INSERT INTO products (name, category_id, price, quantity, warehouse, sku, description, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [sourceProduct.name, sourceProduct.category_id, sourceProduct.price, transfer.quantity, destinationWarehouseName, null, sourceProduct.description, sourceProduct.expiry_date]
        );
        await connection.query(
          'INSERT INTO stock_movements (product_id, type, quantity, warehouse_id, reference_type, reference_id, created_by) VALUES (?, "inbound", ?, ?, "warehouse_transfer", ?, ?)',
          [productInsert.insertId, transfer.quantity, transfer.to_warehouse_id, id, user_id]
        );
      }

      // Update transfer status
      await connection.query('UPDATE warehouse_transfers SET status = "received", received_date = NOW(), received_by = ? WHERE id = ?', [user_id, id]);

      await connection.commit();
      res.json({ success: true, message: 'Transfer received' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { listTransfers, createTransfer, receiveTransfer };
