import { get, post } from '../request'
import type { EmptyResponse } from '../request'
import { GROUP_API } from '../paths'
import type { EmptyRequestParams } from '~/types/common'
import type {
  NewGroupRequest,
  GroupInfo,
  JoinGroupRequest,
  JoinGroupResponse,
  LeaveGroupRequest,
  KeepAliveInGroupRequest,
  KeepAliveInGroupResponse,
  GroupMember,
  QueryGroupInfoByIdRequest,
  QueryGroupInfoByNameRequest,
  QueryGroupInfoByLocationRequest,
  SetMemberRoleRequest
} from '~/types/api/group'
import type { ApiResponse } from '~/types/common'

/**
 * 创建群组
 */
export const createGroup = (data: NewGroupRequest) =>
  post<GroupInfo, NewGroupRequest>(GROUP_API.CREATE, data)

/**
 * 获取群组信息（通过ID）
 */
export const getGroupById = (groupId: string) =>
  get<GroupInfo, QueryGroupInfoByIdRequest>(GROUP_API.BY_ID, { group_id: groupId })

/**
 * 获取群组信息（通过名称）
 */
export const getGroupByName = (name: string) =>
  get<GroupInfo[], QueryGroupInfoByNameRequest>(GROUP_API.BY_NAME, { name })

/**
 * 获取群组信息（通过位置）
 */
export const getGroupByLocation = (params: { latitude: number, longitude: number, radius?: number }) =>
  get<GroupInfo[], QueryGroupInfoByLocationRequest>(GROUP_API.BY_LOCATION, params)

/**
 * 获取附近群组
 */
export const getNearbyGroups = async (
  params: { latitude: number, longitude: number },
  radius: number = 5000
): Promise<ApiResponse<GroupInfo[]>> => {
  const response = await get<any, QueryGroupInfoByLocationRequest>(
    GROUP_API.NEARBY,
    { ...params, radius }
  );

  // 标准化API响应格式
  if (response.code === 0 && response.resp_data) {
    const data = response.resp_data;
    let standardizedData: GroupInfo[] = [];

    if (Array.isArray(data)) {
      standardizedData = data;
    } else if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
      standardizedData = data.items;
    }

    return {
      code: response.code,
      msg: response.msg || '',
      resp_data: standardizedData
    };
  }

  return response as ApiResponse<GroupInfo[]>;
}

/**
 * 加入群组
 */
export const joinGroup = (data: JoinGroupRequest) =>
  post<JoinGroupResponse, JoinGroupRequest>(GROUP_API.JOIN, data)

/**
 * 离开群组
 */
export const leaveGroup = (data: LeaveGroupRequest) =>
  post<EmptyResponse, LeaveGroupRequest>(GROUP_API.LEAVE, data)

/**
 * 获取群组成员
 */
export const getGroupMembers = (groupId: string) =>
  get<GroupMember[], QueryGroupInfoByIdRequest>(GROUP_API.MEMBERS(groupId), { group_id: groupId })

/**
 * 设置成员角色
 */
export const setMemberRole = (
  groupId: string,
  userId: string,
  role: string
) =>
  post<EmptyResponse, SetMemberRoleRequest>(GROUP_API.SET_ROLE(groupId, userId), { role })

/**
 * 移除群组成员
 */
export const removeGroupMember = (
  groupId: string,
  userId: string
) =>
  post<EmptyResponse, EmptyRequestParams>(GROUP_API.REMOVE_MEMBER(groupId, userId), {})

/**
 * 群组保活
 */
export const keepAliveInGroup = (data: KeepAliveInGroupRequest) =>
  post<KeepAliveInGroupResponse, KeepAliveInGroupRequest>(GROUP_API.KEEP_ALIVE, data) 