const pool = require('../config/db');

async function listAlerts(req, res, next) {
  try {
    const user_id = req.user.id;
    const { read = false, type } = req.query;

    let query = 'SELECT a.*, p.name as product_name FROM alerts a LEFT JOIN products p ON a.product_id = p.id WHERE (a.user_id = ? OR a.user_id IS NULL)';
    const params = [user_id];

    if (read !== 'all') {
      query += ' AND a.is_read = ?';
      params.push(read === 'true' ? 1 : 0);
    }

    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 50';

    const [alerts] = await pool.query(query, params);
    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE alerts SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
}

async function generateAlerts(req, res, next) {
  try {
    // Check for low stock
    const [lowStock] = await pool.query('SELECT * FROM products WHERE quantity < 10');
    
    for (const product of lowStock) {
      // Check if alert already exists
      const [exists] = await pool.query(
        'SELECT id FROM alerts WHERE product_id = ? AND type = "low_stock" AND is_read = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)',
        [product.id]
      );

      if (!exists.length) {
        await pool.query(
          'INSERT INTO alerts (type, product_id, message) VALUES (?, ?, ?)',
          ['low_stock', product.id, `${product.name} is low on stock (${product.quantity} units remaining)`]
        );
      }
    }

    // Check for expiry
    const [expiring] = await pool.query(
      'SELECT * FROM products WHERE expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(NOW(), INTERVAL 7 DAY) AND expiry_date > NOW()'
    );

    for (const product of expiring) {
      const [exists] = await pool.query(
        'SELECT id FROM alerts WHERE product_id = ? AND type = "expiry_warning" AND is_read = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)',
        [product.id]
      );

      if (!exists.length) {
        await pool.query(
          'INSERT INTO alerts (type, product_id, message) VALUES (?, ?, ?)',
          ['expiry_warning', product.id, `${product.name} expires on ${product.expiry_date}`]
        );
      }
    }

    // Check for expired
    const [expired] = await pool.query('SELECT * FROM products WHERE expiry_date IS NOT NULL AND expiry_date < NOW()');

    for (const product of expired) {
      const [exists] = await pool.query(
        'SELECT id FROM alerts WHERE product_id = ? AND type = "expired" AND is_read = 0',
        [product.id]
      );

      if (!exists.length) {
        await pool.query(
          'INSERT INTO alerts (type, product_id, message) VALUES (?, ?, ?)',
          ['expired', product.id, `${product.name} has expired`]
        );
      }
    }

    res.json({ success: true, message: 'Alerts generated' });
  } catch (error) {
    next(error);
  }
}

async function getDashboardPreferences(req, res, next) {
  try {
    const user_id = req.user.id;
    const [prefs] = await pool.query('SELECT * FROM dashboard_preferences WHERE user_id = ?', [user_id]);

    if (!prefs.length) {
      return res.json({ success: true, preferences: { widgets: [], layout: 'grid' } });
    }

    res.json({ success: true, preferences: prefs[0] });
  } catch (error) {
    next(error);
  }
}

async function saveDashboardPreferences(req, res, next) {
  try {
    const user_id = req.user.id;
    const { widgets, layout } = req.body;

    const [existing] = await pool.query('SELECT id FROM dashboard_preferences WHERE user_id = ?', [user_id]);

    if (existing.length) {
      await pool.query('UPDATE dashboard_preferences SET widgets = ?, layout = ? WHERE user_id = ?', [JSON.stringify(widgets), layout, user_id]);
    } else {
      await pool.query('INSERT INTO dashboard_preferences (user_id, widgets, layout) VALUES (?, ?, ?)', [user_id, JSON.stringify(widgets), layout]);
    }

    res.json({ success: true, message: 'Preferences saved' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listAlerts, markAsRead, generateAlerts, getDashboardPreferences, saveDashboardPreferences };
