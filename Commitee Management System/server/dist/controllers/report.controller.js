import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { Committee } from '../models/committee.model.js';
import { Payment } from '../models/payment.model.js';
import { Report } from '../models/report.model.js';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
const buildFinancialSummary = async (start, end) => {
    const [collections, payouts, pendingPayments] = await Promise.all([
        Transaction.aggregate([
            { $match: { type: 'collection', processedAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
            { $match: { type: 'payout', processedAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Payment.countDocuments({ status: { $in: ['pending', 'late', 'partial'] }, dueDate: { $lte: end } }),
    ]);
    return {
        collections: collections[0]?.total ?? 0,
        payouts: payouts[0]?.total ?? 0,
        pendingPayments,
    };
};
export const listReports = asyncHandler(async (req, res) => {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50).populate('committee', 'name');
    res.json({ success: true, data: reports });
});
export const generateReport = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    const { type, format, startDate, endDate, committeeId } = req.body;
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();
    const summary = await buildFinancialSummary(start, end);
    const report = await Report.create({
        generatedBy: req.user.userId,
        committee: committeeId,
        type,
        format,
        period: { start, end },
        summary,
    });
    if (format === 'pdf') {
        const committee = committeeId ? await Committee.findById(committeeId) : null;
        const doc = new PDFDocument({ margin: 40 });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.fontSize(20).text('Committee Financial Report');
        doc.moveDown();
        doc.fontSize(12).text(`Type: ${type}`);
        doc.text(`Period: ${dayjs(start).format('YYYY-MM-DD')} to ${dayjs(end).format('YYYY-MM-DD')}`);
        if (committee)
            doc.text(`Committee: ${committee.name}`);
        doc.moveDown();
        doc.text(`Collections: ${summary.collections}`);
        doc.text(`Payouts: ${summary.payouts}`);
        doc.text(`Pending Payments: ${summary.pendingPayments}`);
        doc.end();
        await new Promise((resolve) => doc.on('end', () => resolve()));
        const buffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${report._id}.pdf`);
        res.send(buffer);
        return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Summary');
    sheet.addRow(['Report Type', type]);
    sheet.addRow(['Period', `${dayjs(start).format('YYYY-MM-DD')} to ${dayjs(end).format('YYYY-MM-DD')}`]);
    sheet.addRow(['Collections', summary.collections]);
    sheet.addRow(['Payouts', summary.payouts]);
    sheet.addRow(['Pending Payments', summary.pendingPayments]);
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report._id}.xlsx`);
    res.send(Buffer.from(buffer));
});
