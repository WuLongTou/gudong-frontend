import { get, post, put } from '../request'
import type { Result } from '~/types/common'
import type {
  CreateRegisteredUserRequest,
  CreateUserResponse,
  CreateTemporaryUserRequest,
  User,
} from '~/types/user_type';

export interface LoginParams {
  user_id: string
  password: string
}

export interface RegisterParams {
  user_id: string
  password: string
  nickname: string
}

export interface UpdateUserParams {
  nickname?: string
}

export interface UserInfo {
  user_id: string
  nickname: string
  avatar?: string
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  token: string
  user_id: string
  nickname: string
}

// 统一响应类型
type APIResponse<T> = Promise<Result<T>>;

/**
 * 用户登录
 */
export const loginUser = (params: LoginParams): Promise<Result<TokenResponse>> => {
  return post('/users/login', params, { isPublic: true });
}

/**
 * 用户注册
 */
export const registerUser = (params: RegisterParams): Promise<Result<TokenResponse>> => {
  return post('/users/register', params, { isPublic: true });
}

/**
 * 刷新令牌
 */
export const refreshToken = (): Promise<Result<TokenResponse>> => {
  return post('/users/refresh-token', undefined, { isPublic: true });
}

/**
 * 获取临时访客令牌（无需登录）
 */
export const createTemporaryUser = (): Promise<Result<TokenResponse>> => {
  return post('/users/temporary', undefined, { isPublic: true });
}

/**
 * 更新用户昵称
 */
export const updateNickname = (data: { nickname: string }): Promise<Result<UserInfo>> => {
  return put('/users/update-nickname', data);
}

/**
 * 更新用户密码
 */
export const updatePassword = (data: { password: string }): Promise<Result<UserInfo>> => {
  return put('/users/update-password', data);
} 