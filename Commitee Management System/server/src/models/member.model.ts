import { Schema, Types, model } from 'mongoose';

export interface IMember {
  user?: Types.ObjectId;
  committee: Types.ObjectId;
  fullName: string;
  email?: string;
  cnic: string;
  phone: string;
  transactionId?: string;
  iban?: string;
  accountTitle?: string;
  profileImageUrl?: string;
  position: number;
  isActive: boolean;
  joinedAt: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    committee: { type: Schema.Types.ObjectId, ref: 'Committee', required: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true },
    cnic: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    transactionId: { type: String, trim: true },
    iban: { type: String, trim: true },
    accountTitle: { type: String, trim: true },
    profileImageUrl: { type: String },
    position: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

memberSchema.index({ committee: 1, position: 1 }, { unique: true });
memberSchema.index({ committee: 1, cnic: 1 }, { unique: true });

export const Member = model<IMember>('Member', memberSchema);
