const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const {
  listProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();
router.use(authenticate);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  listProducts
);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category_id').isInt().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a number'),
    body('warehouse').optional().trim().notEmpty().withMessage('Warehouse cannot be empty'),
  ],
  validateRequest,
  createProduct
);

router.put(
  '/:id',
  authorize('admin'),
  [
    param('id').isInt().withMessage('Product id is required'),
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category_id').isInt().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a number'),
    body('warehouse').optional().trim().notEmpty().withMessage('Warehouse cannot be empty'),
  ],
  validateRequest,
  updateProduct
);

router.patch(
  '/:id/stock',
  authorize('admin', 'user'),
  [
    param('id').isInt().withMessage('Product id is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a number'),
  ],
  validateRequest,
  updateProductStock
);

router.delete('/:id', authorize('admin'), [param('id').isInt().withMessage('Product id is required')], validateRequest, deleteProduct);

module.exports = router;
