export interface CreateTemporaryUserRequest { }
export interface CreateRegisteredUserRequest {
    user_id: string;
    password: string;
    nickname: string;
}

export interface CreateUserResponse {
    user_id: string;
    nickname: string;
    token: string;
}

export interface User {
    user_id: string;
    nickname: string;
    is_temporary: boolean;
}

export interface RefreshTokenResponse {
    token: string;
}
