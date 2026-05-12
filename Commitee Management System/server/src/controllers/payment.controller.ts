import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Payment } from '../models/payment.model.js';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { getPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../services/audit.service.js';

const calculateFine = (dueDate: Date, amount: number, ratePerDay = 0.003): number => {
  const daysLate = dayjs().startOf('day').diff(dayjs(dueDate).startOf('day'), 'day');
  if (daysLate <= 0) {
    return 0;
  }
  return Math.round(amount * ratePerDay * daysLate);
};

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const dueDate = new Date((req.body as { dueDate: string }).dueDate);
  const amount = Number((req.body as { amount: number }).amount);

  const payment = await Payment.create({
    ...req.body,
    dueDate,
    amount,
    fineAmount: calculateFine(dueDate, amount),
    createdBy: req.user.userId,
  });

  await recordAuditLog(req, 'payment.create', 'Payment', payment._id.toString());

  res.status(StatusCodes.CREATED).json({ success: true, data: payment });
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sort } = getPagination(req.query);
  const { committee, member, status } = req.query as {
    committee?: string;
    member?: string;
    status?: string;
  };

  const filter: Record<string, unknown> = {};
  if (committee) {
    filter.committee = committee;
  }
  if (member) {
    filter.member = member;
  }
  if (status) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('committee', 'name')
      .populate('member', 'fullName')
      .lean(),
    Payment.countDocuments(filter),
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

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id)
    .populate('committee', 'name')
    .populate('member', 'fullName cnic phone');

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  if (payment.status !== 'paid') {
    const fineAmount = calculateFine(payment.dueDate, payment.amount);
    if (fineAmount !== payment.fineAmount) {
      payment.fineAmount = fineAmount;
      payment.status = fineAmount > 0 && payment.paidAmount === 0 ? 'late' : payment.status;
      await payment.save();
    }
  }

  res.json({ success: true, data: payment });
});

export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  Object.assign(payment, req.body);

  if (payment.paidAmount >= payment.amount + payment.fineAmount) {
    payment.status = 'paid';
    payment.paidAt = payment.paidAt ?? new Date();
  } else if (payment.paidAmount > 0) {
    payment.status = 'partial';
  } else {
    const fineAmount = calculateFine(payment.dueDate, payment.amount);
    payment.fineAmount = fineAmount;
    payment.status = fineAmount > 0 ? 'late' : 'pending';
  }

  await payment.save();

  if (payment.paidAmount > 0 && req.user) {
    await Transaction.create({
      committee: payment.committee,
      member: payment.member,
      payment: payment._id,
      type: 'collection',
      amount: payment.paidAmount,
      description: `Collection against installment due ${dayjs(payment.dueDate).format('YYYY-MM-DD')}`,
      processedBy: req.user.userId,
      reference: payment.transactionRef,
    });
  }

  if (req.user) {
    await recordAuditLog(req, 'payment.update', 'Payment', payment._id.toString(), req.body);
  }

  res.json({ success: true, data: payment });
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  if (req.user) {
    await recordAuditLog(req, 'payment.delete', 'Payment', payment._id.toString());
  }

  res.json({ success: true, message: 'Payment deleted successfully' });
});
