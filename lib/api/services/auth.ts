/**
 * Auth API 
 */

import { ApiClient } from '../client';
import type {
  ApiResponse,
  LoginRequest,
  LoginData,
  RefreshTokenRequest,
  RefreshTokenData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User
} from '../types';

const client = new ApiClient();

export class AuthService {
  // login
  static async login(data: LoginRequest): Promise<ApiResponse<LoginData>> {
    return client.post<LoginData>('/v1/auth/login', data);
  }

  // logout
  static async logout(): Promise<ApiResponse<void>> {
    return client.post<void>('/v1/auth/logout');
  }

  // refresh token
  static async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenData>> {
    return client.post<RefreshTokenData>('/v1/auth/refresh', data);
  }

  // get current user info
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return client.get<User>('/v1/auth/me');
  }

  // change password
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return client.post<void>('/v1/auth/change-password', data);
  }

  // forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return client.post<void>('/v1/auth/forgot-password', data);
  }

  // reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return client.post<void>('/v1/auth/reset-password', data);
  }

  // verify token
  static async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return client.get<{ valid: boolean }>('/v1/auth/verify');
  }
}
