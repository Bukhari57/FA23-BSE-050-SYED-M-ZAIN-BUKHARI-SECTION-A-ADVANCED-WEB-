import bcrypt from 'bcryptjs';
import { HydratedDocument, Model, Schema, model } from 'mongoose';
import { Role, roles } from '../utils/constants.js';

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    dueReminders: boolean;
  };
  refreshTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, UserMethods>;
export type UserDocument = HydratedDocument<IUser, UserMethods>;

const userSchema = new Schema<IUser, UserModel, UserMethods>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: roles,
      default: 'manager',
      index: true,
    },
    avatarUrl: String,
    phone: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dueReminders: { type: Boolean, default: true },
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
