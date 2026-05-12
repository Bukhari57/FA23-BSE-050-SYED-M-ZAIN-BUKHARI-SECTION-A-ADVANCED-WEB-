import { Router } from 'express';
import { body } from 'express-validator';
import { createTransaction, listTransactions } from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

export const transactionRouter = Router();

transactionRouter.get('/', authenticate, listTransactions);
transactionRouter.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin', 'manager'),
  [
    body('committee').isMongoId(),
    body('type').isIn(['collection', 'payout', 'refund', 'fine']),
    body('amount').isFloat({ min: 0 }),
  ],
  validateRequest,
  createTransaction,
);
