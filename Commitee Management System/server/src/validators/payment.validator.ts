import { body, param, query } from 'express-validator';

export const createPaymentValidator = [
  body('committee').isMongoId(),
  body('member').isMongoId(),
  body('dueDate').isISO8601(),
  body('amount').isFloat({ min: 0 }),
];

export const updatePaymentValidator = [
  param('id').isMongoId(),
  body('status').optional().isIn(['pending', 'paid', 'late', 'partial']),
  body('paidAmount').optional().isFloat({ min: 0 }),
  body('fineAmount').optional().isFloat({ min: 0 }),
  body('paidAt').optional().isISO8601(),
  body('transactionRef').optional().isString().trim().isLength({ max: 60 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
];

export const listPaymentsValidator = [
  query('committee').optional().isMongoId(),
  query('member').optional().isMongoId(),
  query('status').optional().isIn(['pending', 'paid', 'late', 'partial']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const paymentIdValidator = [param('id').isMongoId()];
