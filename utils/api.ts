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
    CreateRegisteredUserRequest,
    CreateUserResponse,
    KeepAliveInGroupRequest,
    KeepAliveInGroupResponse,
} from '@/types/group_type';
import type {
    SendMessageToGroupRequest,
    SendMessageToGroupResponse,
    QueryMessageFromGroupRequest,
    GroupMessage,
} from '@/types/message_type';
import { useNuxtApp } from '#app';

// 统一响应类型
type APIResponse<T> = Promise<Result<T>>;

// 核心请求封装
const api_wrapper = async <T>(method: 'get' | 'post', url: string, data?: any): Promise<Result<T>> => {
    const { $axios } = useNuxtApp();
    try {
        return await $axios.request({ method, url, [method === 'get' ? 'params' : 'data']: data });
    } catch (err) {
        return err as Result<T>;
    }
};

// 用户相关API
export const registerUser = (data: CreateRegisteredUserRequest): APIResponse<CreateUserResponse> =>
    api_wrapper('post', '/users/register', data);

export const createTemporaryUser = (): APIResponse<CreateUserResponse> =>
    api_wrapper('post', '/users/temporary');

// 群组相关API
export const createGroup = (data: NewGroupRequest): APIResponse<GroupInfo> =>
    api_wrapper('post', '/groups/create', data);

export const queryGroupsByName = (params: QueryGroupInfoByNameRequest): APIResponse<GroupInfo[]> =>
    api_wrapper('get', '/groups/by-name', params);

export const queryGroupById = (params: QueryGroupInfoByIdRequest): APIResponse<GroupInfo> =>
    api_wrapper('get', '/groups/by-id', params);

export const queryGroupsByLocation = (params: QueryGroupInfoByLocationRequest): APIResponse<GroupInfo[]> =>
    api_wrapper('get', '/groups/by-location', {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius
    });

export const joinGroup = (data: JoinGroupRequest): APIResponse<JoinGroupResponse> =>
    api_wrapper('post', '/groups/join', data);

export const leaveGroup = (data: LeaveGroupRequest): APIResponse<LeaveGroupResponse> =>
    api_wrapper('post', '/groups/leave', data);

// 消息相关API
export const sendMessageToGroup = (data: SendMessageToGroupRequest): APIResponse<SendMessageToGroupResponse> =>
    api_wrapper('post', '/messages/create', data);

export const queryMessageFromGroup = (data: QueryMessageFromGroupRequest): APIResponse<GroupMessage[]> =>
    api_wrapper('post', '/messages/get', data);

// 保活接口
export const keepAliveInGroup = (data: KeepAliveInGroupRequest): APIResponse<KeepAliveInGroupResponse> =>
    api_wrapper('post', '/groups/keep_alive', data);

