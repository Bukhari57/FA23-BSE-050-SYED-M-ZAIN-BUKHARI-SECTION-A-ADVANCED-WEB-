const express = require('express');

const router = express.Router();

// Lightweight in-memory sample data used for dev/testing when no DB is available
const sample = {
  summary: { totalProducts: 12, totalWarehouses: 2, lowStock: 3 },
  products: [
    { id: 1, name: 'Sample Product A', quantity: 20, price: 9.99 },
    { id: 2, name: 'Sample Product B', quantity: 5, price: 19.99 }
  ],
  categories: [{ id: 1, name: 'General' }, { id: 2, name: 'Consumables' }],
  warehouses: [{ id: 1, name: 'Main' }, { id: 2, name: 'Secondary' }],
  stock_movements: [
    { id: 1, product_id: 1, type: 'inbound', quantity: 20, created_at: new Date() }
  ],
  sales_orders: [],
  invoices: [],
  alerts: [{ id: 1, type: 'low_stock', product_id: 2, message: 'Low stock for Product B' }],
  dashboard_preferences: { layout: 'grid', widgets: [] }
};

router.get('/summary', (req, res) => res.json(sample.summary));
router.get('/products', (req, res) => res.json(sample.products));
router.get('/products/:id', (req, res) => {
  const p = sample.products.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});
router.get('/categories', (req, res) => res.json(sample.categories));
router.get('/warehouses', (req, res) => res.json(sample.warehouses));
router.get('/warehouses/stats', (req, res) => res.json({ total: sample.warehouses.length }));
router.get('/stock-movements', (req, res) => res.json(sample.stock_movements));
router.get('/stock-history/:id', (req, res) => res.json(sample.stock_movements.filter(m => m.product_id === Number(req.params.id))));
router.get('/sales-orders', (req, res) => res.json(sample.sales_orders));
router.get('/invoices', (req, res) => res.json(sample.invoices));
router.get('/warehouse-transfers', (req, res) => res.json([]));
router.get('/purchase-requests', (req, res) => res.json([]));
router.get('/returns', (req, res) => res.json([]));
router.get('/alerts', (req, res) => res.json(sample.alerts));
router.get('/dashboard/preferences', (req, res) => res.json(sample.dashboard_preferences));
router.get('/reports/stock-valuation', (req, res) => res.json({ totalValue: 1234.56 }));
router.get('/reports/low-stock', (req, res) => res.json([{ product_id: 2, qty: 5 }]));

// auth routes (signup/login) return mock tokens
router.post('/auth/signup', (req, res) => res.json({ success: true, message: 'mock signup' }));
router.post('/auth/login', (req, res) => res.json({ token: 'mock-token', user: { id: 1, name: 'dev', role: 'admin' } }));

module.exports = router;
