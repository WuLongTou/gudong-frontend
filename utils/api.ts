// 新增文件 - 群组相关API接口
import type { Result } from '@/types/common';
import type {
    NewGroupRequest,
    QueryGroupInfoByNameRequest,
    QueryGroupInfoByIdRequest,
    QueryGroupInfoByLocationRequest,
    GroupInfo,
    JoinGroupRequest,
    JoinGroupResponse,
    LeaveGroupRequest,
    LeaveGroupResponse,
    KeepAliveInGroupRequest,
    KeepAliveInGroupResponse,
} from '@/types/group_type';
import type {
    SendMessageToGroupRequest,
    SendMessageToGroupResponse,
    QueryMessageFromGroupRequest,
    GroupMessage,
} from '@/types/message_type';
import type {
    CreateRegisteredUserRequest,
    CreateUserResponse,
    CreateTemporaryUserRequest,
    User,
} from '@/types/user_type';
import { get, post, put } from './request';
import { error_codes } from './error_codes';

// 统一响应类型
type APIResponse<T> = Promise<Result<T>>;

// 处理API响应，如果是公共接口则不弹出认证错误提示
const handleApiResponse = async <T>(promise: Promise<Result<T>>, isPublic: boolean = false): Promise<Result<T>> => {
    try {
        const result = await promise;
        
        // 如果是公共接口，或者不是认证错误，直接返回结果
        if (isPublic || result.code !== error_codes.AUTH_FAILED) {
            return result;
        }
        
        // 对于认证错误，交由request.ts处理后返回结果
        return result;
    } catch (error: any) {
        // 错误已在request.ts中处理
        throw error;
    }
};

// 用户相关API
export const registerUser = (data: CreateRegisteredUserRequest): APIResponse<CreateUserResponse> =>
    handleApiResponse(post('/users/register', data), true);

export const loginUser = (data: { user_id: string, password: string }): APIResponse<CreateUserResponse> =>
    handleApiResponse(post('/users/login', data), true);

export const createTemporaryUser = (): APIResponse<CreateUserResponse> =>
    handleApiResponse(post('/users/temporary'), true);

export const refreshToken = (): APIResponse<{ token: string }> =>
    handleApiResponse(post('/users/refresh-token'), true);

export const updateNickname = (data: { nickname: string }): APIResponse<User> =>
    handleApiResponse(put('/users/update-nickname', data));

export const updatePassword = (data: { password: string }): APIResponse<User> =>
    handleApiResponse(put('/users/update-password', data));

// 群组相关API
export const createGroup = (data: NewGroupRequest): APIResponse<GroupInfo> =>
    handleApiResponse(post('/groups/create', data));

export const queryGroupsByName = (params: QueryGroupInfoByNameRequest): APIResponse<GroupInfo[]> =>
    handleApiResponse(get('/groups/by-name', params));

export const queryGroupById = (params: QueryGroupInfoByIdRequest): APIResponse<GroupInfo> =>
    handleApiResponse(get('/groups/by-id', params));

export const queryGroupsByLocation = (params: QueryGroupInfoByLocationRequest): APIResponse<GroupInfo[]> =>
    handleApiResponse(get('/groups/by-location', params));

export const joinGroup = (data: JoinGroupRequest): APIResponse<JoinGroupResponse> =>
    handleApiResponse(post('/groups/join', data));

export const leaveGroup = (data: LeaveGroupRequest): APIResponse<LeaveGroupResponse> =>
    handleApiResponse(post('/groups/leave', data));

// 消息相关API
export const sendMessageToGroup = (data: SendMessageToGroupRequest): APIResponse<SendMessageToGroupResponse> =>
    handleApiResponse(post('/messages/create', data));

export const queryMessageFromGroup = (data: QueryMessageFromGroupRequest): APIResponse<GroupMessage[]> =>
    handleApiResponse(post('/messages/get', data));

// 保活接口
export const keepAliveInGroup = (data: KeepAliveInGroupRequest): APIResponse<KeepAliveInGroupResponse> =>
    handleApiResponse(post('/groups/keep-alive', data));

