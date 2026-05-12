import { StatusCodes } from 'http-status-codes';
import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
export const listNotifications = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
        Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments({ user: req.user.userId }),
    ]);
    res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
export const markNotificationRead = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { readAt: new Date() }, { new: true });
    if (!notification) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
    }
    res.json({ success: true, data: notification });
});
