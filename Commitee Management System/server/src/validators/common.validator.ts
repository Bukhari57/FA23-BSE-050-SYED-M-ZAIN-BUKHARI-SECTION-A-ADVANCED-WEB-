import { param, query } from 'express-validator';

export const mongoIdParamValidator = (field = 'id') => [param(field).isMongoId()];

export const paginatedQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isString(),
];
