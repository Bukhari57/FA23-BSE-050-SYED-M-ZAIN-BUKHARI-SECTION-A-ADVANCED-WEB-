import { body, param } from 'express-validator';

export const updateUserRoleValidator = [
  param('id').isMongoId(),
  body('role').optional().isIn(['super_admin', 'admin', 'manager', 'member']),
  body('isActive').optional().isBoolean(),
];

export const approveCommitteeValidator = [param('id').isMongoId()];
