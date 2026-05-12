import { Schema, Types, model } from 'mongoose';

export interface ITransaction {
  committee: Types.ObjectId;
  member?: Types.ObjectId;
  payment?: Types.ObjectId;
  type: 'collection' | 'payout' | 'refund' | 'fine';
  amount: number;
  description?: string;
  reference?: string;
  processedAt: Date;
  processedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
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
  },
  { timestamps: true },
);

transactionSchema.index({ processedAt: -1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
