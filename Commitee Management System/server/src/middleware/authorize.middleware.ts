import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Role } from '../utils/constants.js';
import { ApiError } from '../utils/api-error.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'Insufficient permission'));
    }

    return next();
  };
};
