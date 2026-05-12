import { Schema, model } from 'mongoose';
import { paymentStatuses } from '../utils/constants.js';
const paymentSchema = new Schema({
    committee: { type: Schema.Types.ObjectId, ref: 'Committee', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: paymentStatuses, default: 'pending', index: true },
    fineAmount: { type: Number, default: 0, min: 0 },
    paidAt: Date,
    transactionRef: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
paymentSchema.index({ committee: 1, member: 1, dueDate: 1 }, { unique: true });
export const Payment = model('Payment', paymentSchema);
