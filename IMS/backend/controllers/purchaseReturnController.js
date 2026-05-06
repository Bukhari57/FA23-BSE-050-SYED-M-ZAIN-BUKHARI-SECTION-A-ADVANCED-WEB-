const pool = require('../config/db');

async function generateRequestNumber() {
  const prefix = 'PR';
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
}

async function listRequests(req, res, next) {
  try {
    const { page = 1, limit = 20, status, supplier_name } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT pr.*, p.name as product_name FROM purchase_requests pr LEFT JOIN products p ON pr.product_id = p.id WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND pr.status = ?';
      params.push(status);
    }
    if (supplier_name) {
      query += ' AND pr.supplier_name LIKE ?';
      params.push(`%${supplier_name}%`);
    }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM purchase_requests WHERE 1=1 ${status ? 'AND status = ?' : ''} ${supplier_name ? 'AND supplier_name LIKE ?' : ''}`, params);
    const total = countResult[0][0].total;

    query += ' ORDER BY request_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [requests] = await pool.query(query, params);

    res.json({
      success: true,
      requests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
}

async function createRequest(req, res, next) {
  try {
    const { supplier_name, supplier_email, product_id, quantity, unit_price, expected_delivery_date, notes } = req.body;
    const user_id = req.user.id;

    if (!supplier_name || !product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const requestNumber = await generateRequestNumber();
    const total_amount = quantity * (unit_price || 0);

    const [result] = await pool.query(
      'INSERT INTO purchase_requests (request_number, supplier_name, supplier_email, product_id, quantity, unit_price, total_amount, expected_delivery_date, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [requestNumber, supplier_name, supplier_email, product_id, quantity, unit_price, total_amount, expected_delivery_date || null, 'submitted', notes || null, user_id]
    );

    res.status(201).json({ success: true, message: 'Purchase request created', id: result.insertId, requestNumber });
  } catch (error) {
    next(error);
  }
}

async function receivePurchase(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity_received } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [requests] = await connection.query('SELECT * FROM purchase_requests WHERE id = ?', [id]);
      if (!requests.length) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      const request = requests[0];
      if (!['submitted', 'approved'].includes(request.status)) {
        return res.status(400).json({ success: false, message: 'Only submitted or approved requests can be received' });
      }

      // Update product quantity
      await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [quantity_received || request.quantity, request.product_id]);

      // Create stock movement
      await connection.query(
        'INSERT INTO stock_movements (product_id, type, quantity, reference_type, reference_id, created_by) VALUES (?, "inbound", ?, "purchase_request", ?, ?)',
        [request.product_id, quantity_received || request.quantity, id, req.user.id]
      );

      // Update request status
      await connection.query('UPDATE purchase_requests SET status = "received" WHERE id = ?', [id]);

      await connection.commit();
      res.json({ success: true, message: 'Purchase received' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

async function listReturns(req, res, next) {
  try {
    const { page = 1, limit = 20, return_type, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT pr.*, p.name as product_name FROM product_returns pr LEFT JOIN products p ON pr.product_id = p.id WHERE 1=1';
    const params = [];

    if (return_type) {
      query += ' AND pr.return_type = ?';
      params.push(return_type);
    }
    if (status) {
      query += ' AND pr.status = ?';
      params.push(status);
    }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM product_returns WHERE 1=1 ${return_type ? 'AND return_type = ?' : ''} ${status ? 'AND status = ?' : ''}`, params);
    const total = countResult[0][0].total;

    query += ' ORDER BY return_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [returns] = await pool.query(query, params);

    res.json({
      success: true,
      returns,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
}

async function createReturn(req, res, next) {
  try {
    const { return_type, product_id, quantity, reason, notes } = req.body;
    const user_id = req.user.id;

    if (!return_type || !product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const returnNumber = `RET${Date.now()}`;
    const [result] = await pool.query(
      'INSERT INTO product_returns (return_number, return_type, product_id, quantity, reason, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [returnNumber, return_type, product_id, quantity, reason || null, notes || null, user_id]
    );

    res.status(201).json({ success: true, message: 'Return created', id: result.insertId, returnNumber });
  } catch (error) {
    next(error);
  }
}

async function approveReturn(req, res, next) {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [returns] = await connection.query('SELECT * FROM product_returns WHERE id = ?', [id]);
      if (!returns.length) {
        return res.status(404).json({ success: false, message: 'Return not found' });
      }

      const returnItem = returns[0];

      // Update status
      await connection.query('UPDATE product_returns SET status = "approved" WHERE id = ?', [id]);

      // Update stock based on return type
      if (returnItem.return_type === 'customer') {
        // Customer return - add back to stock
        await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [returnItem.quantity, returnItem.product_id]);

        await connection.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reference_type, reference_id, created_by) VALUES (?, "return", ?, "customer_return", ?, ?)',
          [returnItem.product_id, returnItem.quantity, id, req.user.id]
        );
      }

      await connection.commit();
      res.json({ success: true, message: 'Return approved' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { listRequests, createRequest, receivePurchase, listReturns, createReturn, approveReturn };
