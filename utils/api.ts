// 新增文件 - 群组相关API接口
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
} from '../types/group_type';
import { post_wrapper } from './request';

// 创建群组
export const createGroup = (data: NewGroupRequest) => {
    return post_wrapper<NewGroupResponse>('/group/create', data);
};

// 根据名称查询群组
export const queryGroupsByName = (data: QueryGroupInfoRequestByName) => {
    return post_wrapper<QueryGroupInfoResponse[]>('/group/query-by-name', data);
};

// 根据ID查询群组
export const queryGroupById = (data: QueryGroupInfoRequestById) => {
    return post_wrapper<QueryGroupInfoResponse>('/group/query-by-id', data);
};

// 根据位置查询群组
export const queryGroupsByLocation = (data: QueryGroupInfoRequestByLocation) => {
    return post_wrapper<QueryGroupInfoResponse[]>('/group/query-by-location', data);
};

// 加入群组
export const joinGroup = (data: JoinGroupRequest) => {
    return post_wrapper<JoinGroupResponse>('/group/join', data);
};

// 离开群组
export const leaveGroup = (data: LeaveGroupRequest) => {
    return post_wrapper<LeaveGroupResponse>('/group/leave', data);
};

// 发送消息到群组
export const sendMessageToGroup = (data: SendMessageToGroupRequest) => {
    return post_wrapper<SendMessageToGroupResponse>('/group/send-message', data);
};


