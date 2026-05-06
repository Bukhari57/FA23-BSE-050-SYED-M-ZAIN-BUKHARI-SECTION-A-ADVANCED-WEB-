const pool = require('../config/db');

// Generate unique order number
async function generateOrderNumber() {
  const prefix = 'SO';
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
}

async function listOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status, customer_name } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT so.*,
      (SELECT COUNT(*) FROM sales_order_items soi WHERE soi.sales_order_id = so.id) AS item_count
      FROM sales_orders so WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND so.status = ?';
      params.push(status);
    }
    if (customer_name) {
      query += ' AND so.customer_name LIKE ?';
      params.push(`%${customer_name}%`);
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM sales_orders WHERE 1=1 ${status ? 'AND status = ?' : ''} ${customer_name ? 'AND customer_name LIKE ?' : ''}`, params);
    const total = countResult[0][0].total;

    query += ' ORDER BY so.order_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await pool.query(query, params);

    res.json({
      success: true,
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderDetail(req, res, next) {
  try {
    const { id } = req.params;
    const [orders] = await pool.query('SELECT * FROM sales_orders WHERE id = ?', [id]);
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await pool.query(
      'SELECT soi.*, p.name, p.sku FROM sales_order_items soi LEFT JOIN products p ON soi.product_id = p.id WHERE soi.sales_order_id = ?',
      [id]
    );

    res.json({ success: true, order: orders[0], items });
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const { customer_name, customer_email, customer_phone, delivery_date, items, tax_rate, discount, notes } = req.body;
    const user_id = req.user.id;

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const orderNumber = await generateOrderNumber();

      // Calculate totals
      let subtotal = 0;
      items.forEach(item => {
        subtotal += item.quantity * item.unit_price;
      });
      const taxAmount = (subtotal * (tax_rate || 0)) / 100;
      const total = subtotal + taxAmount - (discount || 0);

      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO sales_orders (order_number, customer_name, customer_email, customer_phone, delivery_date, subtotal, tax_amount, discount, total, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNumber, customer_name, customer_email, customer_phone, delivery_date, subtotal, taxAmount, discount || 0, total, notes, user_id]
      );

      // Create order items
      for (const item of items) {
        const line_total = item.quantity * item.unit_price;
        await connection.query(
          'INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
          [orderResult.insertId, item.product_id, item.quantity, item.unit_price, line_total]
        );
      }

      await connection.commit();
      res.status(201).json({ success: true, message: 'Order created', id: orderResult.insertId, orderNumber });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

async function confirmOrder(req, res, next) {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update order status
      await connection.query('UPDATE sales_orders SET status = "confirmed" WHERE id = ?', [id]);

      // Get order items
      const [items] = await connection.query('SELECT * FROM sales_order_items WHERE sales_order_id = ?', [id]);

      // Reduce stock for each item
      for (const item of items) {
        await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.product_id]);

        // Create stock movement record
        await connection.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reference_type, reference_id, created_by) VALUES (?, "outbound", ?, "sales_order", ?, ?)',
          [item.product_id, item.quantity, id, req.user.id]
        );
      }

      await connection.commit();
      res.json({ success: true, message: 'Order confirmed and stock updated' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { status, delivery_date, notes } = req.body;

    await pool.query('UPDATE sales_orders SET status = ?, delivery_date = ?, notes = ? WHERE id = ?', [status, delivery_date, notes, id]);
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const [order] = await pool.query('SELECT status FROM sales_orders WHERE id = ?', [id]);

    if (order.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order[0].status === 'confirmed' || order[0].status === 'shipped') {
      return res.status(400).json({ success: false, message: 'Cannot delete confirmed or shipped orders' });
    }

    await pool.query('DELETE FROM sales_order_items WHERE sales_order_id = ?', [id]);
    await pool.query('DELETE FROM sales_orders WHERE id = ?', [id]);

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listOrders, getOrderDetail, createOrder, confirmOrder, updateOrder, deleteOrder };
