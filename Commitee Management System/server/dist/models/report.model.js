import { Schema, model } from 'mongoose';
const reportSchema = new Schema({
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    committee: { type: Schema.Types.ObjectId, ref: 'Committee' },
    type: {
        type: String,
        enum: ['monthly', 'committee', 'financial', 'custom'],
        required: true,
        index: true,
    },
    format: { type: String, enum: ['pdf', 'xlsx'], required: true },
    period: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    fileUrl: String,
    summary: {
        collections: { type: Number, default: 0 },
        payouts: { type: Number, default: 0 },
        pendingPayments: { type: Number, default: 0 },
    },
}, { timestamps: true });
export const Report = model('Report', reportSchema);
