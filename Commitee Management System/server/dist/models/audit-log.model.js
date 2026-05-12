import { Schema, model } from 'mongoose';
const auditLogSchema = new Schema({
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: String,
    ipAddress: String,
    userAgent: String,
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });
export const AuditLog = model('AuditLog', auditLogSchema);
