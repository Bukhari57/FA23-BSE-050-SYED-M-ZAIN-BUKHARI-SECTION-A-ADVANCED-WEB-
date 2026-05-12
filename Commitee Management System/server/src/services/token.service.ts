import jwt from 'jsonwebtoken';
import ms from 'ms';
import { env } from '../config/env.js';

interface AuthUser {
  userId: string;
  email: string;
  role: Express.UserPayload['role'];
}

export const createAccessToken = (payload: AuthUser) => {
  return jwt.sign({ email: payload.email, role: payload.role }, env.jwtAccessSecret, {
    subject: payload.userId,
    expiresIn: env.jwtAccessExpires as ms.StringValue,
  });
};

export const createRefreshToken = (payload: AuthUser) => {
  return jwt.sign({ email: payload.email, role: payload.role }, env.jwtRefreshSecret, {
    subject: payload.userId,
    expiresIn: env.jwtRefreshExpires as ms.StringValue,
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.jwtRefreshSecret) as {
    sub: string;
    email: string;
    role: Express.UserPayload['role'];
  };
};
