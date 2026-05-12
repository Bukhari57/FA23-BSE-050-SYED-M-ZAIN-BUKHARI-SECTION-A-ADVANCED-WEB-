import { body } from 'express-validator';
export const updateProfileValidator = [
    body('fullName').optional().isString().trim().isLength({ min: 2, max: 120 }),
    body('phone').optional().isString().trim().isLength({ min: 7, max: 20 }),
    body('avatarUrl').optional().isString().trim(),
];
export const updateNotificationPreferencesValidator = [
    body('email').optional().isBoolean(),
    body('push').optional().isBoolean(),
    body('dueReminders').optional().isBoolean(),
];
export const changePasswordValidator = [
    body('currentPassword').isString().isLength({ min: 8 }),
    body('newPassword')
        .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    })
        .withMessage('Password must be 8+ chars and include uppercase, lowercase, and a number.'),
];
