const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();
router.use(authenticate);

router.get('/', listCategories);
router.post(
  '/',
  authorize('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validateRequest,
  createCategory
);
router.put(
  '/:id',
  authorize('admin'),
  [param('id').isInt(), body('name').trim().notEmpty().withMessage('Category name is required')],
  validateRequest,
  updateCategory
);
router.delete('/:id', authorize('admin'), [param('id').isInt()], validateRequest, deleteCategory);

module.exports = router;
