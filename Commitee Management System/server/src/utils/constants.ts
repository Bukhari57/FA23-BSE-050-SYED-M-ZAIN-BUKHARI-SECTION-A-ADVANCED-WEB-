export const roles = ['super_admin', 'admin', 'manager', 'member'] as const;
export type Role = (typeof roles)[number];

export const committeeStatuses = ['draft', 'active', 'paused', 'completed'] as const;
export const paymentStatuses = ['pending', 'paid', 'late', 'partial'] as const;
export const notificationTypes = ['info', 'warning', 'success', 'error'] as const;
