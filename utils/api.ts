// 新增文件 - 群组相关API接口
import type { Result } from '@/types/common';
import type {
    NewGroupRequest,
    NewGroupResponse,
    QueryGroupInfoRequestByName,
    QueryGroupInfoRequestById,
    QueryGroupInfoRequestByLocation,
    QueryGroupInfoResponse,
    JoinGroupRequest,
    JoinGroupResponse,
    LeaveGroupRequest,
    LeaveGroupResponse,
    SendMessageToGroupRequest,
    SendMessageToGroupResponse,
    QueryMessageFromGroupRequest,
    QueryMessageFromGroupResponse,
    RegisterUserRequest,
    RegisterUserResponse,
    KeepAliveInGroupRequest,
    KeepAliveInGroupResponse,
} from '@/types/group_type';
import axios, { type AxiosResponse } from 'axios';

// 统一响应类型封装
type APIResponse<T> = Promise<AxiosResponse<Result<T>>>;

// 注册用户
export const registerUser = (data: RegisterUserRequest): APIResponse<RegisterUserResponse> => {
    return post_wrapper('/user/register', data);
};

// 创建群组
export const createGroup = (data: NewGroupRequest): APIResponse<NewGroupResponse> => {
    return post_wrapper('/group/create', data);
};

// 根据名称查询群组
export const queryGroupsByName = (data: QueryGroupInfoRequestByName): APIResponse<QueryGroupInfoResponse[]> => {
    return post_wrapper('/group/query-by-name', data);
};

// 根据ID查询群组
export const queryGroupById = (data: QueryGroupInfoRequestById): APIResponse<QueryGroupInfoResponse> => {
    return post_wrapper('/group/query-by-id', data);
};

// 根据位置查询群组
export const queryGroupsByLocation = (data: QueryGroupInfoRequestByLocation): APIResponse<QueryGroupInfoResponse[]> => {
    return post_wrapper('/group/query-by-location', data);
};

// 加入群组
export const joinGroup = (data: JoinGroupRequest): APIResponse<JoinGroupResponse> => {
    return post_wrapper('/group/join', data);
};

// 离开群组
export const leaveGroup = (data: LeaveGroupRequest): APIResponse<LeaveGroupResponse> => {
    return post_wrapper('/group/leave', data);
};

// 发送消息到群组
export const sendMessageToGroup = (data: SendMessageToGroupRequest): APIResponse<SendMessageToGroupResponse> => {
    return post_wrapper('/group/send-message', {
        ...data,
        token: localStorage.getItem('session_token')
    });
};

// 查询群组消息
export const queryMessageFromGroup = (data: QueryMessageFromGroupRequest): APIResponse<QueryMessageFromGroupResponse[]> => {
    return post_wrapper('/group/query-message', data);
};

// 保活
export const keepAliveInGroup = (data: KeepAliveInGroupRequest): APIResponse<KeepAliveInGroupResponse> => {
    return post_wrapper('/group/keep-alive', data);
};

