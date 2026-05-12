import { body } from 'express-validator';

export const registerValidator = [
  body('fullName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Full name must be between 2 and 120 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage('Password must be 8+ chars and include uppercase, lowercase, and a number.'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
];

export const forgotPasswordValidator = [body('email').isEmail().normalizeEmail()];

export const resetPasswordValidator = [
  body('token').isString().isLength({ min: 20 }),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage('Password must be 8+ chars and include uppercase, lowercase, and a number.'),
];

export const verifyEmailValidator = [body('token').isString().isLength({ min: 20 })];
