import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import { Token } from '../models/token.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { createRandomToken, hashToken } from '../utils/crypto.js';
import { sendEmail } from '../services/email.service.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../services/token.service.js';

const buildAuthPayload = (user: { _id: string; email: string; role: Express.UserPayload['role'] }) => {
  const base = { userId: user._id.toString(), email: user.email, role: user.role };
  return {
    accessToken: createAccessToken(base),
    refreshToken: createRefreshToken(base),
  };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body as {
    fullName: string;
    email: string;
    password: string;
  };

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'manager',
  });

  const verifyToken = createRandomToken();
  await Token.create({
    user: user._id,
    tokenHash: hashToken(verifyToken),
    type: 'email_verify',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  await sendEmail(
    user.email,
    'Verify your email',
    `<p>Hello ${user.fullName}, verify your account token: <strong>${verifyToken}</strong></p>`,
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as { token: string };
  const tokenHash = hashToken(token);

  const tokenDoc = await Token.findOne({
    tokenHash,
    type: 'email_verify',
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired verification token');
  }

  await User.findByIdAndUpdate(tokenDoc.user, { isEmailVerified: true });
  tokenDoc.consumedAt = new Date();
  await tokenDoc.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email, isActive: true }).select('+password +refreshTokens');
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = buildAuthPayload({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  user.refreshTokens.push(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select('+refreshTokens');

  if (!user || !user.refreshTokens.includes(refreshToken) || !user.isActive) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const nextAccessToken = createAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.json({ success: true, data: { accessToken: nextAccessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const user = await User.findById(req.user.userId).select('+refreshTokens');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
  await user.save();

  res.json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      notificationPreferences: user.notificationPreferences,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  if (!user) {
    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    return;
  }

  const resetToken = createRandomToken();
  await Token.create({
    user: user._id,
    tokenHash: hashToken(resetToken),
    type: 'password_reset',
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });

  await sendEmail(
    user.email,
    'Reset your password',
    `<p>Hello ${user.fullName}, use this password reset token: <strong>${resetToken}</strong></p>`,
  );

  res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  const tokenHash = hashToken(token);

  const tokenDoc = await Token.findOne({
    tokenHash,
    type: 'password_reset',
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token');
  }

  const user = await User.findById(tokenDoc.user).select('+refreshTokens');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  user.password = password;
  user.refreshTokens = [];
  await user.save();

  tokenDoc.consumedAt = new Date();
  await tokenDoc.save();

  res.json({ success: true, message: 'Password reset successful' });
});
