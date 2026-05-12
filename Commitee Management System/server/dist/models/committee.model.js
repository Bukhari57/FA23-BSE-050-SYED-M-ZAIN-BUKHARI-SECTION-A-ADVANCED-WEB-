import { Schema, model } from 'mongoose';
import { committeeStatuses } from '../utils/constants.js';
const committeeSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 140, index: true },
    description: { type: String, maxlength: 1000 },
    monthlyAmount: { type: Number, required: true, min: 1 },
    durationMonths: { type: Number, required: true, min: 1, max: 120 },
    memberLimit: { type: Number, required: true, min: 2, max: 500 },
    status: { type: String, enum: committeeStatuses, default: 'draft', index: true },
    startDate: { type: Date, required: true },
    payoutDayOfMonth: { type: Number, min: 1, max: 28, default: 5 },
    autoRotationEnabled: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    currentRotationIndex: { type: Number, default: 0 },
    nextPayoutDate: Date,
    tags: { type: [String], default: [] },
}, { timestamps: true });
committeeSchema.index({ status: 1, createdAt: -1 });
export const Committee = model('Committee', committeeSchema);
