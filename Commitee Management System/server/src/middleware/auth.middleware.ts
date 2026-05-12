import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: Express.UserPayload['role'];
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
  }

  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
    req.user = { userId: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
};
