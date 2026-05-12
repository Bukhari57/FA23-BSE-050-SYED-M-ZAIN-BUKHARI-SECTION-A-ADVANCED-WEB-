import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Request validation failed',
      errors: errors.array(),
    });
    return;
  }

  next();
};
