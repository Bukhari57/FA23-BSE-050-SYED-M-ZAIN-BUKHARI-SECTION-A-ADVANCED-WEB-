import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { Committee } from '../models/committee.model.js';
import { Member } from '../models/member.model.js';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../services/audit.service.js';
export const createCommittee = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const data = req.body;
    const committee = await Committee.create({
        ...data,
        startDate: new Date(data.startDate),
        payoutDayOfMonth: data.payoutDayOfMonth ?? 5,
        autoRotationEnabled: data.autoRotationEnabled ?? true,
        createdBy: req.user.userId,
        nextPayoutDate: dayjs(data.startDate)
            .date(data.payoutDayOfMonth ?? 5)
            .add(1, 'month')
            .toDate(),
    });
    await recordAuditLog(req, 'committee.create', 'Committee', committee._id.toString());
    res.status(StatusCodes.CREATED).json({ success: true, data: committee });
});
export const listCommittees = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const { status, search } = req.query;
    const filter = {};
    if (status) {
        filter.status = status;
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }
    const [items, total] = await Promise.all([
        Committee.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'fullName email')
            .lean(),
        Committee.countDocuments(filter),
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
export const getCommitteeById = asyncHandler(async (req, res) => {
    const committee = await Committee.findById(req.params.id)
        .populate('createdBy', 'fullName email')
        .populate('approvedBy', 'fullName email');
    if (!committee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
    }
    const [members, history] = await Promise.all([
        Member.find({ committee: committee._id }).sort({ position: 1 }),
        Transaction.find({ committee: committee._id }).sort({ processedAt: -1 }).limit(20),
    ]);
    res.json({ success: true, data: { committee, members, history } });
});
export const updateCommittee = asyncHandler(async (req, res) => {
    const committee = await Committee.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!committee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
    }
    if (req.user) {
        await recordAuditLog(req, 'committee.update', 'Committee', committee._id.toString(), req.body);
    }
    res.json({ success: true, data: committee });
});
export const deleteCommittee = asyncHandler(async (req, res) => {
    const committee = await Committee.findByIdAndDelete(req.params.id);
    if (!committee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
    }
    if (req.user) {
        await recordAuditLog(req, 'committee.delete', 'Committee', committee._id.toString());
    }
    res.json({ success: true, message: 'Committee deleted successfully' });
});
export const rotatePayout = asyncHandler(async (req, res) => {
    const committee = await Committee.findById(req.params.id);
    if (!committee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
    }
    const members = await Member.find({ committee: committee._id, isActive: true }).sort({ position: 1 });
    if (!members.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No active members for payout rotation');
    }
    const index = committee.currentRotationIndex % members.length;
    const payoutMember = members[index];
    if (!payoutMember) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to resolve payout member for rotation');
    }
    await Transaction.create({
        committee: committee._id,
        member: payoutMember._id,
        type: 'payout',
        amount: committee.monthlyAmount * members.length,
        description: `Auto payout to ${payoutMember.fullName}`,
        processedBy: req.user?.userId,
    });
    committee.currentRotationIndex += 1;
    committee.nextPayoutDate = dayjs(committee.nextPayoutDate ?? new Date()).add(1, 'month').toDate();
    await committee.save();
    if (req.user) {
        await recordAuditLog(req, 'committee.rotate_payout', 'Committee', committee._id.toString(), {
            payoutMember: payoutMember._id.toString(),
        });
    }
    res.json({
        success: true,
        message: 'Payout rotated successfully',
        data: {
            payoutMember,
            committee,
        },
    });
});
