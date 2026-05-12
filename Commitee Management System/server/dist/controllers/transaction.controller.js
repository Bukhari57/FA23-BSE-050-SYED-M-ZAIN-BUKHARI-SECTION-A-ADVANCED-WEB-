import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../services/audit.service.js';
export const createTransaction = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const transaction = await Transaction.create({
        ...req.body,
        processedBy: req.user.userId,
    });
    await recordAuditLog(req, 'transaction.create', 'Transaction', transaction._id.toString());
    res.status(StatusCodes.CREATED).json({ success: true, data: transaction });
});
export const listTransactions = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const [items, total] = await Promise.all([
        Transaction.find()
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('committee', 'name')
            .populate('member', 'fullName')
            .populate('processedBy', 'fullName')
            .lean(),
        Transaction.countDocuments(),
    ]);
    res.json({
        success: true,
        data: items,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});
