-- Supabase / PostgreSQL schema converted from MySQL
-- Paste this into Supabase SQL editor (Table Editor -> SQL) or run as a migration.

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse VARCHAR(120) NOT NULL DEFAULT 'Main',
  created_at TIMESTAMPTZ DEFAULT now(),
  expiry_date DATE,
  sku VARCHAR(100),
  description TEXT
);

-- Unique index for sku only when provided
CREATE UNIQUE INDEX IF NOT EXISTS uniq_products_sku ON products (sku) WHERE sku IS NOT NULL;

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('inbound','outbound','adjustment','damage','return')),
  quantity INTEGER NOT NULL,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- Sales orders
CREATE TABLE IF NOT EXISTS sales_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(180) NOT NULL,
  customer_email VARCHAR(180),
  customer_phone VARCHAR(20),
  order_date TIMESTAMPTZ DEFAULT now(),
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal NUMERIC(15,2) DEFAULT 0.00,
  tax_amount NUMERIC(15,2) DEFAULT 0.00,
  discount NUMERIC(15,2) DEFAULT 0.00,
  total NUMERIC(15,2) DEFAULT 0.00,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);

-- Sales order items
CREATE TABLE IF NOT EXISTS sales_order_items (
  id SERIAL PRIMARY KEY,
  sales_order_id INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(15,2) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE SET NULL,
  customer_name VARCHAR(180) NOT NULL,
  invoice_date TIMESTAMPTZ DEFAULT now(),
  due_date DATE,
  subtotal NUMERIC(15,2) DEFAULT 0.00,
  tax_rate NUMERIC(5,2) DEFAULT 0.00,
  tax_amount NUMERIC(15,2) DEFAULT 0.00,
  discount NUMERIC(15,2) DEFAULT 0.00,
  total NUMERIC(15,2) DEFAULT 0.00,
  amount_paid NUMERIC(15,2) DEFAULT 0.00,
  payment_status VARCHAR(10) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partial','paid')),
  payment_method VARCHAR(50),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Warehouse transfers
CREATE TABLE IF NOT EXISTS warehouse_transfers (
  id SERIAL PRIMARY KEY,
  transfer_number VARCHAR(50) NOT NULL UNIQUE,
  from_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  to_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  transfer_date TIMESTAMPTZ DEFAULT now(),
  received_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_transit','received','cancelled')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  received_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase requests
CREATE TABLE IF NOT EXISTS purchase_requests (
  id SERIAL PRIMARY KEY,
  request_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_name VARCHAR(180) NOT NULL,
  supplier_email VARCHAR(180),
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2),
  total_amount NUMERIC(15,2),
  request_date TIMESTAMPTZ DEFAULT now(),
  expected_delivery_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','received','cancelled')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product returns
CREATE TABLE IF NOT EXISTS product_returns (
  id SERIAL PRIMARY KEY,
  return_number VARCHAR(50) NOT NULL UNIQUE,
  return_type VARCHAR(20) DEFAULT 'customer' CHECK (return_type IN ('customer','supplier')),
  reference_id INTEGER,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  return_date TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','received')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) DEFAULT 'low_stock' CHECK (type IN ('low_stock','expiry_warning','expired','order_pending')),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);

-- Dashboard preferences
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  widgets JSONB,
  layout VARCHAR(50) DEFAULT 'grid',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
