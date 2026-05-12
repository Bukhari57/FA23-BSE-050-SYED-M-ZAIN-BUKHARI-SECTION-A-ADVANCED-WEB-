import { Schema, Types, model } from 'mongoose';
import { notificationTypes } from '../utils/constants.js';

export interface INotification {
  user: Types.ObjectId;
  title: string;
  body: string;
  type: (typeof notificationTypes)[number];
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 400 },
    type: { type: String, enum: notificationTypes, default: 'info' },
    readAt: Date,
    actionUrl: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
