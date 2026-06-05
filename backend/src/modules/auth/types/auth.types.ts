import { IUserProfile } from '../../../database/models';

export interface AuthUserResponse {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  profile: IUserProfile;
  schoolId: string | null;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LoginHistoryResponse {
  ip: string;
  userAgent: string;
  loginAt: Date;
  success: boolean;
}
