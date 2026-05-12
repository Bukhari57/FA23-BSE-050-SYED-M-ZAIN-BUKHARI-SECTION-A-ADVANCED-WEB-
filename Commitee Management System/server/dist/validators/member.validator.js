import { body, param, query } from 'express-validator';
export const createMemberValidator = [
    body('committee').isMongoId(),
    body('fullName').isString().trim().isLength({ min: 2, max: 120 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('cnic').isString().trim().isLength({ min: 5, max: 25 }),
    body('phone').isString().trim().isLength({ min: 7, max: 20 }),
    body('position').isInt({ min: 1 }),
    body('iban').optional().isString().trim().isLength({ max: 40 }),
    body('transactionId').optional().isString().trim().isLength({ max: 60 }),
    body('profileImageUrl').optional().isURL(),
];
export const updateMemberValidator = [
    param('id').isMongoId(),
    body('fullName').optional().isString().trim().isLength({ min: 2, max: 120 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('cnic').optional().isString().trim().isLength({ min: 5, max: 25 }),
    body('phone').optional().isString().trim().isLength({ min: 7, max: 20 }),
    body('position').optional().isInt({ min: 1 }),
    body('isActive').optional().isBoolean(),
    body('iban').optional().isString().trim().isLength({ max: 40 }),
    body('transactionId').optional().isString().trim().isLength({ max: 60 }),
    body('profileImageUrl').optional().isURL(),
];
export const memberIdValidator = [param('id').isMongoId()];
export const listMembersValidator = [
    query('committee').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim(),
];
