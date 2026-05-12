import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
export const updateProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const { fullName, phone, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, { fullName, phone, avatarUrl }, { new: true, runValidators: true });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    res.json({ success: true, data: user });
});
export const updateNotificationPreferences = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const { email, push, dueReminders } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    user.notificationPreferences = {
        email: email ?? user.notificationPreferences.email,
        push: push ?? user.notificationPreferences.push,
        dueReminders: dueReminders ?? user.notificationPreferences.dueReminders,
    };
    await user.save();
    res.json({ success: true, data: user.notificationPreferences });
});
export const changePassword = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+password +refreshTokens');
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is incorrect');
    }
    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
});
