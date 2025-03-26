import { get, post, put, del } from '../request'
import type { Result } from '~/types/common'
import type { PaginatedResult, GeoLocation } from '~/types/api'
import type {
  NewGroupRequest,
  QueryGroupInfoByNameRequest,
  QueryGroupInfoByIdRequest,
  QueryGroupInfoByLocationRequest,
  GroupInfo as GroupInfoDTO,
  JoinGroupRequest,
  JoinGroupResponse,
  LeaveGroupRequest,
  LeaveGroupResponse,
  KeepAliveInGroupRequest,
  KeepAliveInGroupResponse,
} from '~/types/group_type'
import { GROUP_API } from '../paths'

// 统一响应类型
type APIResponse<T> = Promise<Result<T>>;

export interface GroupInfo {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  ownerId: string
  memberCount: number
  maxMembers: number
  isPublic: boolean
  location?: GeoLocation
  createdAt: string
  updatedAt: string
}

export interface CreateGroupParams {
  name: string
  description?: string
  avatarUrl?: string
  isPublic: boolean
  maxMembers?: number
  location?: GeoLocation
}

export interface UpdateGroupParams {
  name?: string
  description?: string
  avatarUrl?: string
  isPublic?: boolean
  maxMembers?: number
  location?: GeoLocation
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  nickname: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface JoinGroupParams {
  groupId: string
  message?: string
}

// 群组相关API
export const createGroup = (params: CreateGroupParams) => {
  return post<Result<GroupInfo>>(GROUP_API.CREATE, params)
}

export const queryGroupsByName = (params: QueryGroupInfoByNameRequest): APIResponse<GroupInfo[]> =>
  get(GROUP_API.BY_NAME, params);

export const queryGroupById = (params: QueryGroupInfoByIdRequest): APIResponse<GroupInfo> =>
  get(GROUP_API.BY_ID, params);

export const queryGroupsByLocation = (params: QueryGroupInfoByLocationRequest): APIResponse<GroupInfo[]> =>
  get(GROUP_API.BY_LOCATION, params);

export const updateGroup = (groupId: string, params: UpdateGroupParams) => {
  return put<Result<GroupInfo>>(GROUP_API.DETAIL(groupId), params)
}

export const getGroupDetail = (groupId: string) => {
  return get<Result<GroupInfo>>(GROUP_API.DETAIL(groupId))
}

export const getUserGroups = () => {
  return get<PaginatedResult<GroupInfo>>(GROUP_API.USER_GROUPS)
}

export const getNearbyGroups = (location: GeoLocation, radius: number = 5000) => {
  return get<PaginatedResult<GroupInfo>>(GROUP_API.NEARBY, {
    ...location,
    radius
  })
}

export const joinGroup = (params: JoinGroupParams) => {
  return post<Result<null>>(GROUP_API.JOIN, params)
}

export const leaveGroup = (groupId: string) => {
  return post<Result<null>>(GROUP_API.LEAVE, { group_id: groupId })
}

export const getGroupMembers = (groupId: string) => {
  return get<PaginatedResult<GroupMember>>(GROUP_API.MEMBERS(groupId))
}

export const removeGroupMember = (groupId: string, userId: string) => {
  return del<Result<null>>(GROUP_API.REMOVE_MEMBER(groupId, userId))
}

export const setGroupAdmin = (groupId: string, userId: string, isAdmin: boolean) => {
  return put<Result<null>>(GROUP_API.SET_ROLE(groupId, userId), {
    role: isAdmin ? 'admin' : 'member'
  })
}

// 保活接口
export const keepAliveInGroup = (data: KeepAliveInGroupRequest): APIResponse<KeepAliveInGroupResponse> =>
  post(GROUP_API.KEEP_ALIVE, data); 