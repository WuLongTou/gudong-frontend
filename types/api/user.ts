// ------------------------
// API 请求参数类型 (前端 -> 后端)
// ------------------------

/**
 * 登录请求
 */
export interface LoginUserRequest {
    user_id: string
    password: string
}

/**
 * 创建已注册用户请求
 */
export interface CreateRegisteredUserRequest {
    user_id: string
    password: string
    nickname: string
}

/**
 * 创建临时用户请求
 */
export interface CreateTemporaryUserRequest {
    nickname?: string
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
    nickname?: string
    password?: string
    avatar_url?: string
}

/**
 * 更新昵称请求
 */
export interface UpdateNicknameRequest {
    nickname: string
}

/**
 * 更新密码请求
 */
export interface UpdatePasswordRequest {
    password: string
}

// ------------------------
// API 响应数据类型 (后端 -> 前端)
// ------------------------

/**
 * 用户信息响应
 */
export interface UserInfo {
    user_id: string
    nickname: string
    is_temporary: boolean
    created_at?: string
    updated_at?: string
    avatar_url?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
    token: string
    user_id: string
    nickname: string
    expires_at?: number
}

/**
 * 创建用户响应
 */
export interface CreateUserResponse {
    user_id: string
    nickname: string
    token: string
    expires_at?: number
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
    token: string
}

/**
 * 检查令牌响应
 */
export interface CheckTokenResponse {
    user_id: string
    is_temporary: boolean
}
