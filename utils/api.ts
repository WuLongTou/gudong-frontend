// 新增文件 - 群组相关API接口
import type {
    NewGroupRequest,
    NewGroupResponse,
    QueryGroupInfoRequestByName,
    QueryGroupInfoResponseByName,
    QueryGroupInfoRequestById,
    QueryGroupInfoResponseById,
    JoinGroupRequest,
    JoinGroupResponse,
    LeaveGroupRequest,
    LeaveGroupResponse,
    SendMessageToGroupRequest,
    SendMessageToGroupResponse,
    QueryMessageFromGroupRequest,
    QueryMessageFromGroupResponse,
} from '../types/GroupType';
import { post_wrapper } from './request';

// 创建群组
export const createGroup = (data: NewGroupRequest) => {
    return post_wrapper<NewGroupResponse>('/group/create', data);
};

// 根据名称查询群组
export const queryGroupsByName = (data: QueryGroupInfoRequestByName) => {
    return post_wrapper<QueryGroupInfoResponseByName[]>('/group/query-by-name', data);
};

// 加入群组
export const joinGroup = (data: JoinGroupRequest) => {
    return post_wrapper<JoinGroupResponse>('/group/join', data);
}; 