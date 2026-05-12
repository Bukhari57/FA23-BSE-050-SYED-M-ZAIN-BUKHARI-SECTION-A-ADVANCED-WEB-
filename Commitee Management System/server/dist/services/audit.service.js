import { AuditLog } from '../models/audit-log.model.js';
export const recordAuditLog = async (req, action, resourceType, resourceId, metadata) => {
    if (!req.user) {
        return;
    }
    await AuditLog.create({
        actor: req.user.userId,
        action,
        resourceType,
        resourceId,
        metadata,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });
};
