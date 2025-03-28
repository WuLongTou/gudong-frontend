import { get, post, put } from '../request'
import type { ApiResponse } from '~/types/common'
import type {
  CreateRegisteredUserRequest,
  CreateTemporaryUserRequest,
  LoginUserRequest,
  UpdateUserRequest,
  UpdateNicknameRequest,
  UpdatePasswordRequest,
  UserInfo,
  LoginResponse,
  CreateUserResponse,
  RefreshTokenResponse,
} from '~/types/api/user';
import { USER_API } from '../paths';

// 删除重复的接口定义，使用types中统一的类型
type APIResponse<T> = Promise<ApiResponse<T>>;

/**
 * 用户登录
 */
export const loginUser = (params: LoginUserRequest): APIResponse<LoginResponse> =>
  post<LoginResponse, LoginUserRequest>(USER_API.LOGIN, params, { isPublic: true });

/**
 * 用户注册
 */
export const registerUser = (params: CreateRegisteredUserRequest): APIResponse<CreateUserResponse> =>
  post<CreateUserResponse, CreateRegisteredUserRequest>(USER_API.REGISTER, params, { isPublic: true });

/**
 * 刷新令牌
 */
export const refreshToken = (): APIResponse<RefreshTokenResponse> =>
  post<RefreshTokenResponse>(USER_API.REFRESH_TOKEN, undefined, { isPublic: true });

/**
 * 获取临时访客令牌（无需登录）
 */
export const createTemporaryUser = (params?: CreateTemporaryUserRequest): APIResponse<CreateUserResponse> =>
  post<CreateUserResponse, CreateTemporaryUserRequest>(USER_API.TEMPORARY, params, { isPublic: true });

/**
 * 更新用户昵称
 */
export const updateNickname = (data: UpdateNicknameRequest): APIResponse<UserInfo> =>
  put<UserInfo, UpdateNicknameRequest>(USER_API.UPDATE_NICKNAME, data);

/**
 * 更新用户密码
 */
export const updatePassword = (data: UpdatePasswordRequest): APIResponse<UserInfo> =>
  put<UserInfo, UpdatePasswordRequest>(USER_API.UPDATE_PASSWORD, data); 