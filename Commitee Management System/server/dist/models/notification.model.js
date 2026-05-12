import { Schema, model } from 'mongoose';
import { notificationTypes } from '../utils/constants.js';
const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 400 },
    type: { type: String, enum: notificationTypes, default: 'info' },
    readAt: Date,
    actionUrl: String,
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);
