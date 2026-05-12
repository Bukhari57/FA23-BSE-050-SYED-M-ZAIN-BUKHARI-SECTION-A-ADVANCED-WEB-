import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const createAccessToken = (payload) => {
    return jwt.sign({ email: payload.email, role: payload.role }, env.jwtAccessSecret, {
        subject: payload.userId,
        expiresIn: env.jwtAccessExpires,
    });
};
export const createRefreshToken = (payload) => {
    return jwt.sign({ email: payload.email, role: payload.role }, env.jwtRefreshSecret, {
        subject: payload.userId,
        expiresIn: env.jwtRefreshExpires,
    });
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.jwtRefreshSecret);
};
