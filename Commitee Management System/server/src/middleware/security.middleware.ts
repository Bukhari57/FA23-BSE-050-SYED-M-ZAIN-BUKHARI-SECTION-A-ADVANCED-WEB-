import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from '../config/env.js';

const mongoSanitizeRequest: RequestHandler = (req, _res, next) => {
  // express-mongo-sanitize middleware reassigns req.query, which breaks on Express 5.
  // Sanitize in-place to keep compatibility.
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    mongoSanitize.sanitize(req.query as Record<string, unknown>);
  }
  if (req.headers && typeof req.headers === 'object') {
    mongoSanitize.sanitize(req.headers as Record<string, unknown>);
  }

  next();
};

export const applySecurityMiddleware = (app: Express): void => {
  const configuredOrigins = env.clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (configuredOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        // In development, allow localhost on any port (Angular/Vite often shifts ports).
        if (!env.isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());
  app.use(hpp());
  app.use(mongoSanitizeRequest);
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  if (!env.isProduction) {
    app.use(morgan('dev'));
  }
};
