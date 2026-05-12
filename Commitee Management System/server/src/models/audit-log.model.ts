import { Schema, Types, model } from 'mongoose';

export interface IAuditLog {
  actor: Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: String,
    ipAddress: String,
    userAgent: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
