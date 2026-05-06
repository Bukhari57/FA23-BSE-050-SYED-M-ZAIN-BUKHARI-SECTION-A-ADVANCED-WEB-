const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStats,
} = require('../controllers/warehouseController');

const router = express.Router();
router.use(authenticate);

router.get('/', listWarehouses);
router.get('/stats', getWarehouseStats);

router.post(
  '/',
  authorize('admin'),
  [body('name').trim().notEmpty().withMessage('Warehouse name is required')],
  validateRequest,
  createWarehouse
);

router.put(
  '/:id',
  authorize('admin'),
  [param('id').isInt(), body('name').trim().notEmpty().withMessage('Warehouse name is required')],
  validateRequest,
  updateWarehouse
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validateRequest, deleteWarehouse);

module.exports = router;
