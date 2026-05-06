const pool = require('../config/db');

async function getSalesReport(req, res, next) {
  try {
    const { start_date, end_date, product_id } = req.query;

    let query = 'SELECT soi.product_id, p.name, SUM(soi.quantity) as total_quantity, SUM(soi.line_total) as total_sales FROM sales_order_items soi LEFT JOIN sales_orders so ON soi.sales_order_id = so.id LEFT JOIN products p ON soi.product_id = p.id WHERE so.status IN ("confirmed", "shipped", "delivered")';
    const params = [];

    if (start_date && end_date) {
      query += ' AND DATE(so.order_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (product_id) {
      query += ' AND soi.product_id = ?';
      params.push(product_id);
    }

    query += ' GROUP BY soi.product_id ORDER BY total_sales DESC';

    const [report] = await pool.query(query, params);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function getPurchaseReport(req, res, next) {
  try {
    const { start_date, end_date, product_id } = req.query;

    let query = 'SELECT pr.product_id, p.name, SUM(pr.quantity) as total_quantity, SUM(pr.total_amount) as total_cost FROM purchase_requests pr LEFT JOIN products p ON pr.product_id = p.id WHERE pr.status IN ("approved", "received")';
    const params = [];

    if (start_date && end_date) {
      query += ' AND DATE(pr.request_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (product_id) {
      query += ' AND pr.product_id = ?';
      params.push(product_id);
    }

    query += ' GROUP BY pr.product_id ORDER BY total_cost DESC';

    const [report] = await pool.query(query, params);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function getStockValuationReport(req, res, next) {
  try {
    const [report] = await pool.query(
      'SELECT id, name, sku, category_id, quantity, price, (quantity * price) as total_value, warehouse FROM products WHERE quantity > 0 ORDER BY total_value DESC'
    );

    const totalValue = report.reduce((sum, item) => sum + Number(item.total_value || 0), 0);

    res.json({
      success: true,
      report,
      summary: {
        total_items: report.length,
        total_value: totalValue,
        average_value_per_item: report.length > 0 ? totalValue / report.length : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getExpiryReport(req, res, next) {
  try {
    const { days = 30 } = req.query;

    const [report] = await pool.query(
      'SELECT id, name, sku, expiry_date, quantity, warehouse FROM products WHERE expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) ORDER BY expiry_date ASC',
      [days]
    );

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function getWarehouseReport(req, res, next) {
  try {
    const [report] = await pool.query(
      `SELECT 
        w.id, 
        w.name,
        COUNT(DISTINCT p.id) as total_products, 
        SUM(p.quantity) as total_stock,
        SUM(p.quantity * p.price) as total_value
      FROM warehouses w
      LEFT JOIN products p ON p.warehouse = w.name
      GROUP BY w.id, w.name
      ORDER BY total_value DESC`
    );

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function getLowStockReport(req, res, next) {
  try {
    const { threshold = 10 } = req.query;

    const [report] = await pool.query(
      'SELECT id, name, sku, quantity, price, warehouse, category_id FROM products WHERE quantity < ? ORDER BY quantity ASC',
      [threshold]
    );

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function getCategoryReport(req, res, next) {
  try {
    const [report] = await pool.query(
      `SELECT 
        c.id, 
        c.name,
        COUNT(p.id) as total_products,
        SUM(p.quantity) as total_stock,
        SUM(p.quantity * p.price) as total_value,
        AVG(p.price) as average_price
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_value DESC`
    );

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getStockValuationReport,
  getExpiryReport,
  getWarehouseReport,
  getLowStockReport,
  getCategoryReport
};
