import { body, param, query } from 'express-validator';

export const createCommitteeValidator = [
  body('name').isString().trim().isLength({ min: 3, max: 140 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('monthlyAmount').isFloat({ min: 1 }),
  body('durationMonths').isInt({ min: 1, max: 120 }),
  body('memberLimit').isInt({ min: 2, max: 500 }),
  body('startDate').isISO8601(),
  body('payoutDayOfMonth').optional().isInt({ min: 1, max: 28 }),
  body('tags').optional().isArray(),
];

export const updateCommitteeValidator = [
  param('id').isMongoId(),
  body('name').optional().isString().trim().isLength({ min: 3, max: 140 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('status').optional().isIn(['draft', 'active', 'paused', 'completed']),
  body('monthlyAmount').optional().isFloat({ min: 1 }),
  body('durationMonths').optional().isInt({ min: 1, max: 120 }),
  body('memberLimit').optional().isInt({ min: 2, max: 500 }),
  body('startDate').optional().isISO8601(),
  body('payoutDayOfMonth').optional().isInt({ min: 1, max: 28 }),
  body('autoRotationEnabled').optional().isBoolean(),
  body('tags').optional().isArray(),
];

export const listCommitteeValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'active', 'paused', 'completed']),
  query('search').optional().isString().trim(),
];

export const committeeIdValidator = [param('id').isMongoId()];
