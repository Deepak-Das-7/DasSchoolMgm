import { Types } from 'mongoose';
import { User, IUser, IRefreshTokenEntry, ILoginHistoryEntry } from '../../../database/models';

const MAX_REFRESH_TOKENS = 10;
const MAX_LOGIN_HISTORY = 50;

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findOne({ _id: id, isDeleted: false });
  }

  async findByIdWithSensitiveFields(id: string): Promise<IUser | null> {
    return User.findOne({ _id: id, isDeleted: false }).select('+password +passwordResetToken +passwordResetExpires');
  }

  async findByResetToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isDeleted: false,
      isActive: true,
    }).select('+passwordResetToken +passwordResetExpires +password');
  }

  async addRefreshToken(userId: string, entry: IRefreshTokenEntry): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: {
        refreshTokens: {
          $each: [entry],
          $slice: -MAX_REFRESH_TOKENS,
        },
      },
    });
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token } },
    });
  }

  async hasRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
      'refreshTokens.token': token,
      'refreshTokens.expiresAt': { $gt: new Date() },
    });
    return !!user;
  }

  async addLoginHistory(userId: string, entry: ILoginHistoryEntry): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: {
        loginHistory: {
          $each: [entry],
          $slice: -MAX_LOGIN_HISTORY,
        },
      },
    });
  }

  async setPasswordResetToken(userId: string, hashedToken: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
    });
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedBy: new Types.ObjectId(userId),
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    });
  }

  async getLoginHistory(userId: string): Promise<ILoginHistoryEntry[]> {
    const user = await User.findOne({ _id: userId, isDeleted: false }).select('loginHistory');
    return user?.loginHistory ?? [];
  }

  async clearAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
  }
}

export const authRepository = new AuthRepository();
