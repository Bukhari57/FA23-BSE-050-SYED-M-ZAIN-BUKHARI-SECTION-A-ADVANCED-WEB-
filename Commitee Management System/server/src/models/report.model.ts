import { Schema, Types, model } from 'mongoose';

export interface IReport {
  generatedBy: Types.ObjectId;
  committee?: Types.ObjectId;
  type: 'monthly' | 'committee' | 'financial' | 'custom';
  format: 'pdf' | 'xlsx';
  period: {
    start: Date;
    end: Date;
  };
  fileUrl?: string;
  summary: {
    collections: number;
    payouts: number;
    pendingPayments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
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
  },
  { timestamps: true },
);

export const Report = model<IReport>('Report', reportSchema);
