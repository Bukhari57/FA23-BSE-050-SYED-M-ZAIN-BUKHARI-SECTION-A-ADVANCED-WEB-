import { Schema, model } from 'mongoose';
const tokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    type: {
        type: String,
        enum: ['email_verify', 'password_reset'],
        required: true,
        index: true,
    },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
}, { timestamps: true });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Token = model('Token', tokenSchema);
