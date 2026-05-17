const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const warehouseRoutes = require('./routes/warehouses');
const summaryRoutes = require('./routes/summary');
const advancedRoutes = require('./routes/advanced');
const mockRoutes = require('./routes/mock');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api', advancedRoutes);

// If MOCK_MODE is enabled, mount mock routes before real routes so they respond rapidly
if (process.env.MOCK_MODE === 'true') {
	app.use('/api', mockRoutes);
}

app.use(errorHandler);

module.exports = app;
