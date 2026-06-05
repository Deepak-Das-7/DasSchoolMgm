import crypto from 'crypto';
import { env } from '../../../config/env';
import { AppError } from '../../../middlewares/error.middleware';
import { ROLE_PERMISSIONS } from '../../../shared/constants/roles';
import { AuthUser } from '../../../shared/types/common';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../utils/jwt';
import { comparePassword, hashPassword } from '../../../utils/password';
import { IUser } from '../../../database/models';
import { authRepository } from '../repositories/auth.repository';
import {
  AuthUserResponse,
  LoginHistoryResponse,
  LoginResponse,
  RefreshTokenResponse,
} from '../types/auth.types';
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from '../validators/auth.validators';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function toAuthUser(user: IUser): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    schoolId: user.schoolId?.toString() ?? null,
    permissions: user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role],
  };
}

function toUserResponse(user: IUser): AuthUserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    permissions: user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role],
    profile: user.profile,
    schoolId: user.schoolId?.toString() ?? null,
    isActive: user.isActive,
  };
}

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshTokenExpiry(): Date {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}

export class AuthService {
  async login(input: LoginInput, ip: string, userAgent: string): Promise<LoginResponse> {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      await authRepository.addLoginHistory(user._id.toString(), {
        ip,
        userAgent,
        loginAt: new Date(),
        success: false,
      });
      throw new AppError('Account is deactivated', 403);
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      await authRepository.addLoginHistory(user._id.toString(), {
        ip,
        userAgent,
        loginAt: new Date(),
        success: false,
      });
      throw new AppError('Invalid email or password', 401);
    }

    const authUser = toAuthUser(user);
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user._id.toString());

    await authRepository.addRefreshToken(user._id.toString(), {
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
      createdAt: new Date(),
      userAgent,
      ip,
    });

    await authRepository.addLoginHistory(user._id.toString(), {
      ip,
      userAgent,
      loginAt: new Date(),
      success: true,
    });

    const userWithoutPassword = await authRepository.findById(user._id.toString());
    if (!userWithoutPassword) {
      throw new AppError('User not found', 404);
    }

    return {
      accessToken,
      refreshToken,
      user: toUserResponse(userWithoutPassword),
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await authRepository.removeRefreshToken(userId, refreshToken);
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    let payload: { id: string };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const hasToken = await authRepository.hasRefreshToken(payload.id, refreshToken);
    if (!hasToken) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    const user = await authRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const accessToken = generateAccessToken(toAuthUser(user));
    return { accessToken };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await authRepository.setPasswordResetToken(user._id.toString(), hashedToken, expiresAt);

    if (env.NODE_ENV === 'development') {
      console.info(`[Password Reset] User: ${user.email}, Token: ${resetToken}`);
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const hashedToken = hashResetToken(input.token);
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await authRepository.updatePassword(user._id.toString(), hashedPassword);
    await authRepository.clearAllRefreshTokens(user._id.toString());
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await authRepository.findByIdWithSensitiveFields(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentValid = await comparePassword(input.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    if (input.currentPassword === input.newPassword) {
      throw new AppError('New password must be different from current password', 400);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await authRepository.updatePassword(userId, hashedPassword);
  }

  async getProfile(userId: string): Promise<AuthUserResponse> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toUserResponse(user);
  }

  async getSessions(userId: string): Promise<LoginHistoryResponse[]> {
    const history = await authRepository.getLoginHistory(userId);
    return history
      .slice()
      .reverse()
      .map((entry) => ({
        ip: entry.ip,
        userAgent: entry.userAgent,
        loginAt: entry.loginAt,
        success: entry.success,
      }));
  }
}

export const authService = new AuthService();
