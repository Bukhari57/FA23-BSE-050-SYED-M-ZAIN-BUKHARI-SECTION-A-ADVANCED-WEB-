import { Schema, model } from 'mongoose';
const transactionSchema = new Schema({
    committee: { type: Schema.Types.ObjectId, ref: 'Committee', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    type: {
        type: String,
        enum: ['collection', 'payout', 'refund', 'fine'],
        required: true,
        index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: String,
    reference: String,
    processedAt: { type: Date, default: Date.now },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
transactionSchema.index({ processedAt: -1 });
export const Transaction = model('Transaction', transactionSchema);
