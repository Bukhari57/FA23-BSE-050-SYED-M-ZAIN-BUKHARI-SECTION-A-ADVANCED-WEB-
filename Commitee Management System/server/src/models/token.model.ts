import { Schema, Types, model } from 'mongoose';

export interface IToken {
  user: Types.ObjectId;
  tokenHash: string;
  type: 'email_verify' | 'password_reset';
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
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
  },
  { timestamps: true },
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = model<IToken>('Token', tokenSchema);
