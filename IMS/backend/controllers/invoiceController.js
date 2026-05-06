const pool = require('../config/db');

async function generateInvoiceNumber() {
  const prefix = 'INV';
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
}

async function listInvoices(req, res, next) {
  try {
    const { page = 1, limit = 20, payment_status, customer_name } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    if (customer_name) {
      query += ' AND customer_name LIKE ?';
      params.push(`%${customer_name}%`);
    }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM invoices WHERE 1=1 ${payment_status ? 'AND payment_status = ?' : ''} ${customer_name ? 'AND customer_name LIKE ?' : ''}`, params);
    const total = countResult[0][0].total;

    query += ' ORDER BY invoice_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [invoices] = await pool.query(query, params);

    res.json({
      success: true,
      invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
}

async function getInvoiceDetail(req, res, next) {
  try {
    const { id } = req.params;
    const [invoices] = await pool.query(
      'SELECT i.*, so.order_number AS sales_order_number FROM invoices i LEFT JOIN sales_orders so ON i.sales_order_id = so.id WHERE i.id = ?',
      [id]
    );
    
    if (!invoices.length) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const [items] = await pool.query(
      'SELECT soi.*, p.name FROM sales_order_items soi LEFT JOIN products p ON soi.product_id = p.id WHERE soi.sales_order_id = ?',
      [invoices[0].sales_order_id]
    );

    res.json({ success: true, invoice: invoices[0], items });
  } catch (error) {
    next(error);
  }
}

async function createInvoice(req, res, next) {
  try {
    const { sales_order_id, customer_name, due_date, subtotal: requestedSubtotal, tax_rate, discount, payment_method, notes } = req.body;
    const user_id = req.user.id;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let subtotal = Number(requestedSubtotal || 0);
      let finalCustomerName = customer_name || '';

      // If sales_order_id provided, use order data
      if (sales_order_id) {
        const [orders] = await connection.query('SELECT * FROM sales_orders WHERE id = ?', [sales_order_id]);
        if (orders.length === 0) {
          return res.status(404).json({ success: false, message: 'Sales order not found' });
        }
        subtotal = Number(orders[0].subtotal || 0);
        finalCustomerName = finalCustomerName || orders[0].customer_name;
      }

      if (!finalCustomerName) {
        return res.status(400).json({ success: false, message: 'Customer name is required' });
      }

      const invoiceNumber = await generateInvoiceNumber();
      const taxAmount = (subtotal * (tax_rate || 0)) / 100;
      const total = subtotal + taxAmount - (discount || 0);

      const [result] = await connection.query(
        'INSERT INTO invoices (invoice_number, sales_order_id, customer_name, due_date, subtotal, tax_rate, tax_amount, discount, total, amount_paid, payment_method, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [invoiceNumber, sales_order_id || null, finalCustomerName, due_date || null, subtotal, tax_rate || 0, taxAmount, discount || 0, total, 0, payment_method || null, notes || null, user_id]
      );

      await connection.commit();
      res.status(201).json({ success: true, message: 'Invoice created', id: result.insertId, invoiceNumber });
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

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { payment_method, amount_paid } = req.body;

    const [invoices] = await pool.query('SELECT total, amount_paid FROM invoices WHERE id = ?', [id]);
    if (!invoices.length) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoices[0];
    const nextAmountPaid = Number(invoice.amount_paid || 0) + Number(amount_paid || 0);
    let payment_status = 'unpaid';

    if (nextAmountPaid >= Number(invoice.total || 0)) {
      payment_status = 'paid';
    } else if (nextAmountPaid > 0) {
      payment_status = 'partial';
    }

    await pool.query(
      'UPDATE invoices SET payment_status = ?, payment_method = ?, amount_paid = ? WHERE id = ?',
      [payment_status, payment_method || null, nextAmountPaid, id]
    );

    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    next(error);
  }
}

async function generateInvoicePDF(req, res, next) {
  try {
    const { id } = req.params;
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    
    if (!invoices.length) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoices[0];
    const [items] = await pool.query(
      'SELECT soi.*, p.name FROM sales_order_items soi LEFT JOIN products p ON soi.product_id = p.id WHERE soi.sales_order_id = ?',
      [invoice.sales_order_id]
    );

    // PDF generation can be done using libraries like pdfkit or puppeteer
    // For now, return data that can be used to generate PDF client-side
    res.json({
      success: true,
      invoice: {
        ...invoice,
        items: items || []
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listInvoices, getInvoiceDetail, createInvoice, updatePaymentStatus, generateInvoicePDF };
