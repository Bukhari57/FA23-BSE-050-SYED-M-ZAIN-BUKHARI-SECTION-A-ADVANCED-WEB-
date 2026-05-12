import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Committee } from '../models/committee.model.js';
import { Member } from '../models/member.model.js';
import { Payment } from '../models/payment.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../services/audit.service.js';

export const createMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const data = req.body as {
    committee: string;
    fullName: string;
    email?: string;
    cnic: string;
    phone: string;
    position: number;
    iban?: string;
    accountTitle?: string;
    transactionId?: string;
    profileImageUrl?: string;
  };

  const committee = await Committee.findById(data.committee);
  if (!committee) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Committee not found');
  }

  const memberCount = await Member.countDocuments({ committee: committee._id, isActive: true });
  if (memberCount >= committee.memberLimit) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Committee member limit reached');
  }

  const member = await Member.create({
    ...data,
    profileImageUrl: req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : data.profileImageUrl,
    createdBy: req.user.userId,
  });

  await recordAuditLog(req, 'member.create', 'Member', member._id.toString());

  res.status(StatusCodes.CREATED).json({ success: true, data: member });
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sort } = getPagination(req.query);
  const { committee, search } = req.query as { committee?: string; search?: string };

  const filter: Record<string, unknown> = {};
  if (committee) {
    filter.committee = committee;
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { cnic: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Member.find(filter).sort(sort).skip(skip).limit(limit).populate('committee', 'name').lean(),
    Member.countDocuments(filter),
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

export const getMemberById = asyncHandler(async (req: Request, res: Response) => {
  const member = await Member.findById(req.params.id).populate('committee', 'name status monthlyAmount');
  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }

  const paymentHistory = await Payment.find({ member: member._id }).sort({ dueDate: -1 });

  res.json({ success: true, data: { member, paymentHistory } });
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const updatePayload = {
    ...req.body,
    profileImageUrl: req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : (req.body as { profileImageUrl?: string }).profileImageUrl,
  };

  const member = await Member.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }

  if (req.user) {
    await recordAuditLog(req, 'member.update', 'Member', member._id.toString(), req.body);
  }

  res.json({ success: true, data: member });
});

export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }

  if (req.user) {
    await recordAuditLog(req, 'member.delete', 'Member', member._id.toString());
  }

  res.json({ success: true, message: 'Member deleted successfully' });
});
