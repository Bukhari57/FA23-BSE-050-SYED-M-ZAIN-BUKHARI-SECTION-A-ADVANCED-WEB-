import { Router } from 'express';
import {
  createCommittee,
  deleteCommittee,
  getCommitteeById,
  listCommittees,
  rotatePayout,
  updateCommittee,
} from '../controllers/committee.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  committeeIdValidator,
  createCommitteeValidator,
  listCommitteeValidator,
  updateCommitteeValidator,
} from '../validators/committee.validator.js';

export const committeeRouter = Router();

committeeRouter.get('/', authenticate, listCommitteeValidator, validateRequest, listCommittees);
committeeRouter.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin', 'manager'),
  createCommitteeValidator,
  validateRequest,
  createCommittee,
);
committeeRouter.get('/:id', authenticate, committeeIdValidator, validateRequest, getCommitteeById);
committeeRouter.patch(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin', 'manager'),
  updateCommitteeValidator,
  validateRequest,
  updateCommittee,
);
committeeRouter.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  committeeIdValidator,
  validateRequest,
  deleteCommittee,
);
committeeRouter.post(
  '/:id/rotate-payout',
  authenticate,
  authorize('super_admin', 'admin', 'manager'),
  committeeIdValidator,
  validateRequest,
  rotatePayout,
);
