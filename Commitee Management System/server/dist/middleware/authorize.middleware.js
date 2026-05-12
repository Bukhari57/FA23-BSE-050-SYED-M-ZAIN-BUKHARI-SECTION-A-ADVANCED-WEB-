import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/api-error.js';
export const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(StatusCodes.FORBIDDEN, 'Insufficient permission'));
        }
        return next();
    };
};
