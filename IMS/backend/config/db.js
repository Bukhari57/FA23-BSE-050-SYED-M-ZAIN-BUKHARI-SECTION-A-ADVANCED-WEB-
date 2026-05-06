const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ims_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function ensureColumn(tableName, columnName, definition) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  if (!rows.length) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureIndex(tableName, indexName, sql) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );

  if (!rows.length) {
    await pool.query(sql);
  }
}

async function bootstrapSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      category_id INT,
      price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      quantity INT NOT NULL DEFAULT 0,
      warehouse VARCHAR(120) NOT NULL DEFAULT 'Main',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      type ENUM('inbound','outbound','adjustment','damage','return') NOT NULL,
      quantity INT NOT NULL,
      warehouse_id INT,
      reference_type VARCHAR(50),
      reference_id INT,
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      customer_name VARCHAR(180) NOT NULL,
      customer_email VARCHAR(180),
      customer_phone VARCHAR(20),
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      delivery_date DATE,
      status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
      subtotal DECIMAL(15, 2) DEFAULT 0.00,
      tax_amount DECIMAL(15, 2) DEFAULT 0.00,
      discount DECIMAL(15, 2) DEFAULT 0.00,
      total DECIMAL(15, 2) DEFAULT 0.00,
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sales_order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(12, 2) NOT NULL,
      line_total DECIMAL(15, 2) NOT NULL,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      sales_order_id INT,
      customer_name VARCHAR(180) NOT NULL,
      invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATE,
      subtotal DECIMAL(15, 2) DEFAULT 0.00,
      tax_rate DECIMAL(5, 2) DEFAULT 0.00,
      tax_amount DECIMAL(15, 2) DEFAULT 0.00,
      discount DECIMAL(15, 2) DEFAULT 0.00,
      total DECIMAL(15, 2) DEFAULT 0.00,
      amount_paid DECIMAL(15, 2) DEFAULT 0.00,
      payment_status ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
      payment_method VARCHAR(50),
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS warehouse_transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transfer_number VARCHAR(50) NOT NULL UNIQUE,
      from_warehouse_id INT NOT NULL,
      to_warehouse_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      received_date DATETIME,
      status ENUM('pending','in_transit','received','cancelled') DEFAULT 'pending',
      notes TEXT,
      created_by INT,
      received_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
      FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_number VARCHAR(50) NOT NULL UNIQUE,
      supplier_name VARCHAR(180) NOT NULL,
      supplier_email VARCHAR(180),
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(12, 2),
      total_amount DECIMAL(15, 2),
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expected_delivery_date DATE,
      status ENUM('draft','submitted','approved','received','cancelled') DEFAULT 'draft',
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_returns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      return_number VARCHAR(50) NOT NULL UNIQUE,
      return_type ENUM('customer','supplier') DEFAULT 'customer',
      reference_id INT,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      reason VARCHAR(255),
      return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending','approved','rejected','received') DEFAULT 'pending',
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('low_stock','expiry_warning','expired','order_pending') DEFAULT 'low_stock',
      product_id INT,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dashboard_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      widgets JSON,
      layout VARCHAR(50) DEFAULT 'grid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await ensureColumn('users', 'role', `ENUM('admin','user') NOT NULL DEFAULT 'user'`);
  await ensureColumn('products', 'expiry_date', 'DATE DEFAULT NULL');
  await ensureColumn('products', 'sku', 'VARCHAR(100) DEFAULT NULL');
  await ensureColumn('products', 'description', 'TEXT DEFAULT NULL');
  await ensureColumn('invoices', 'amount_paid', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');

  await ensureIndex('products', 'uniq_products_sku', 'CREATE UNIQUE INDEX uniq_products_sku ON products(sku)');
  await ensureIndex('stock_movements', 'idx_stock_movements_product', 'CREATE INDEX idx_stock_movements_product ON stock_movements(product_id)');
  await ensureIndex('stock_movements', 'idx_stock_movements_date', 'CREATE INDEX idx_stock_movements_date ON stock_movements(created_at)');
  await ensureIndex('sales_orders', 'idx_sales_orders_customer', 'CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_name)');
  await ensureIndex('sales_orders', 'idx_sales_orders_date', 'CREATE INDEX idx_sales_orders_date ON sales_orders(order_date)');
  await ensureIndex('invoices', 'idx_invoices_number', 'CREATE INDEX idx_invoices_number ON invoices(invoice_number)');
  await ensureIndex('alerts', 'idx_alerts_user', 'CREATE INDEX idx_alerts_user ON alerts(user_id)');
  await ensureIndex('alerts', 'idx_alerts_read', 'CREATE INDEX idx_alerts_read ON alerts(is_read)');
}

const schemaReady = (async () => {
  try {
    await bootstrapSchema();
  } catch (error) {
    console.error('Schema bootstrap warning:', error.message);
  }
})();

pool.schemaReady = schemaReady;
module.exports = pool;
