import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import xss from 'xss-clean';
import { env } from '../config/env.js';
export const applySecurityMiddleware = (app) => {
    app.use(helmet());
    app.use(cors({
        origin: env.clientUrl,
        credentials: true,
    }));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compression());
    app.use(hpp());
    app.use(xss());
    app.use(mongoSanitize());
    app.use('/api', rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
    }));
    if (!env.isProduction) {
        app.use(morgan('dev'));
    }
};
