// token相关的常量和类型定义
import type { ApiResponse } from '~/types/common';
import type { LoginResponse, RefreshTokenResponse } from '~/types/api/user';

// 公共API路径列表，这些API不需要token验证
export const publicApiPaths = [
  '/users/register',
  '/users/login',
  '/users/temporary',
  '/users/refresh-token'
];

// 检查是否是公共API
export function isPublicApi(url: string): boolean {
  return publicApiPaths.some(path => url.includes(path));
}

// Token响应类型
export interface TokenResponse {
  token: string;
}

// Token管理配置
export const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15分钟
export const SESSION_TOKEN_KEY = 'session_token';
export const USER_ID_KEY = 'user_id';
export const NICKNAME_KEY = 'nickname';
export const EXPIRES_AT_KEY = 'expires_at'; 