import { StatusCodes } from 'http-status-codes';
import { AuditLog } from '../models/audit-log.model.js';
import { Committee } from '../models/committee.model.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
export const listUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const [users, total] = await Promise.all([
        User.find().sort(sort).skip(skip).limit(limit),
        User.countDocuments(),
    ]);
    res.json({
        success: true,
        data: users,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
        ...(role ? { role } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
    }, { new: true, runValidators: true });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    res.json({ success: true, data: user });
});
export const approveCommittee = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const committee = await Committee.findByIdAndUpdate(req.params.id, { status: 'active', approvedBy: req.user.userId }, { new: true });
    if (!committee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
    }
    res.json({ success: true, data: committee });
});
export const listAuditLogs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [logs, total] = await Promise.all([
        AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('actor', 'fullName email'),
        AuditLog.countDocuments(),
    ]);
    res.json({
        success: true,
        data: logs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
