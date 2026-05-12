import { Error as MongooseError } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
export const notFoundHandler = (_req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
    });
};
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
        });
    }
    if (err instanceof MongooseError.ValidationError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            details: err.errors,
        });
    }
    if ('code' in err && err.code === 11000) {
        return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: 'Duplicate value already exists',
            details: err,
        });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        details: env.isProduction ? undefined : err.message,
    });
};
