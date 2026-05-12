import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { Committee } from '../models/committee.model.js';
import { Member } from '../models/member.model.js';
import { Notification } from '../models/notification.model.js';
import { Payment } from '../models/payment.model.js';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const now = dayjs();
  const monthStart = now.startOf('month').toDate();
  const nextTwoWeeks = now.add(14, 'day').toDate();

  const [totalCommittees, activeMembers, monthlyCollections, upcomingPayouts, recentTransactions, notifications] =
    await Promise.all([
      Committee.countDocuments(),
      Member.countDocuments({ isActive: true }),
      Payment.aggregate([
        {
          $match: {
            paidAt: { $gte: monthStart },
            status: { $in: ['paid', 'partial'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Payment.countDocuments({ status: 'pending', dueDate: { $lte: nextTwoWeeks } }),
      Transaction.find()
        .sort({ processedAt: -1 })
        .limit(8)
        .populate('committee', 'name')
        .populate('member', 'fullName'),
      req.user
        ? Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(8)
        : Promise.resolve([]),
    ]);

  const chart = await Payment.aggregate([
    {
      $match: {
        dueDate: { $gte: now.subtract(5, 'month').startOf('month').toDate() },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' } },
        collected: { $sum: '$paidAmount' },
        due: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalCommittees,
        activeMembers,
        monthlyCollections: monthlyCollections[0]?.total ?? 0,
        upcomingPayouts,
      },
      chart,
      recentTransactions,
      notifications,
    },
  });
});
