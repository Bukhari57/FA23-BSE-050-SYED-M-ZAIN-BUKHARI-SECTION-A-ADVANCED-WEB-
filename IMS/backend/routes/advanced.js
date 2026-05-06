const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listMovements, createMovement, getStockHistory } = require('../controllers/stockMovementController');
const { listOrders, getOrderDetail, createOrder, confirmOrder, updateOrder, deleteOrder } = require('../controllers/salesOrderController');
const { listInvoices, getInvoiceDetail, createInvoice, updatePaymentStatus, generateInvoicePDF } = require('../controllers/invoiceController');
const { listTransfers, createTransfer, receiveTransfer } = require('../controllers/warehouseTransferController');
const { listRequests, createRequest, receivePurchase, listReturns, createReturn, approveReturn } = require('../controllers/purchaseReturnController');
const { listAlerts, markAsRead, generateAlerts, getDashboardPreferences, saveDashboardPreferences } = require('../controllers/alertsController');
const { getSalesReport, getPurchaseReport, getStockValuationReport, getExpiryReport, getWarehouseReport, getLowStockReport, getCategoryReport } = require('../controllers/reportsController');

const router = express.Router();
router.use(authenticate);

// Stock Movements
router.get('/stock-movements', listMovements);
router.post('/stock-movements', authorize('admin'), createMovement);
router.get('/stock-history/:product_id', getStockHistory);

// Sales Orders
router.get('/sales-orders', listOrders);
router.get('/sales-orders/:id', getOrderDetail);
router.post('/sales-orders', authorize('admin'), createOrder);
router.patch('/sales-orders/:id/confirm', authorize('admin'), confirmOrder);
router.put('/sales-orders/:id', authorize('admin'), updateOrder);
router.delete('/sales-orders/:id', authorize('admin'), deleteOrder);

// Invoices
router.get('/invoices', listInvoices);
router.get('/invoices/:id', getInvoiceDetail);
router.post('/invoices', authorize('admin'), createInvoice);
router.patch('/invoices/:id/payment', authorize('admin'), updatePaymentStatus);
router.get('/invoices/:id/pdf', generateInvoicePDF);

// Warehouse Transfers
router.get('/warehouse-transfers', listTransfers);
router.post('/warehouse-transfers', authorize('admin'), createTransfer);
router.patch('/warehouse-transfers/:id/receive', authorize('admin'), receiveTransfer);

// Purchase Requests & Returns
router.get('/purchase-requests', listRequests);
router.post('/purchase-requests', authorize('admin'), createRequest);
router.patch('/purchase-requests/:id/receive', authorize('admin'), receivePurchase);

router.get('/returns', listReturns);
router.post('/returns', authorize('admin'), createReturn);
router.patch('/returns/:id/approve', authorize('admin'), approveReturn);

// Alerts
router.get('/alerts', listAlerts);
router.patch('/alerts/:id/read', markAsRead);
router.post('/alerts/generate', authorize('admin'), generateAlerts);

// Dashboard
router.get('/dashboard/preferences', getDashboardPreferences);
router.post('/dashboard/preferences', saveDashboardPreferences);

// Reports
router.get('/reports/sales', getSalesReport);
router.get('/reports/purchases', getPurchaseReport);
router.get('/reports/stock-valuation', getStockValuationReport);
router.get('/reports/expiry', getExpiryReport);
router.get('/reports/warehouse', getWarehouseReport);
router.get('/reports/low-stock', getLowStockReport);
router.get('/reports/category', getCategoryReport);

module.exports = router;
