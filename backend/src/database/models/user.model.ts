import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes } from '../base.schema';
import { UserRole } from '../../shared/constants/roles';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}

export interface IRefreshTokenEntry {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ip?: string;
}

/** @deprecated Use IRefreshTokenEntry */
export type IRefreshToken = IRefreshTokenEntry;

export interface ILoginHistoryEntry {
  ip: string;
  userAgent: string;
  loginAt: Date;
  success: boolean;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  profile: IUserProfile;
  schoolId: Types.ObjectId | null;
  refreshTokens: IRefreshTokenEntry[];
  loginHistory: ILoginHistoryEntry[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenEntry>(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    userAgent: String,
    ip: String,
  },
  { _id: false }
);

const loginHistorySchema = new Schema<ILoginHistoryEntry>(
  {
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    loginAt: { type: Date, default: Date.now },
    success: { type: Boolean, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    ...baseSchemaFields,
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    permissions: { type: [String], default: [] },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      avatar: String,
      phone: String,
    },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    loginHistory: { type: [loginHistorySchema], default: [] },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

userSchema.index(
  { schoolId: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
addBaseIndexes(userSchema);

export const User = model<IUser>('User', userSchema);
