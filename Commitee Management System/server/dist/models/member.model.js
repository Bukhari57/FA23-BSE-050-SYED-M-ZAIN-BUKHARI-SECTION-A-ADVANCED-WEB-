import { Schema, model } from 'mongoose';
const memberSchema = new Schema({
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
}, { timestamps: true });
memberSchema.index({ committee: 1, position: 1 }, { unique: true });
memberSchema.index({ committee: 1, cnic: 1 }, { unique: true });
export const Member = model('Member', memberSchema);
