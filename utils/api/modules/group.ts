import { get, post, put, del } from '../request'
import type { Result, PaginatedResult, GeoLocation } from '~/types/api'
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
} from '~/types/group_type'

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
  return post<Result<GroupInfo>>('/groups', params)
}

export const queryGroupsByName = (params: QueryGroupInfoByNameRequest): APIResponse<GroupInfo[]> =>
  get('/groups/by-name', params);

export const queryGroupById = (params: QueryGroupInfoByIdRequest): APIResponse<GroupInfo> =>
  get('/groups/by-id', params);

export const queryGroupsByLocation = (params: QueryGroupInfoByLocationRequest): APIResponse<GroupInfo[]> =>
  get('/groups/by-location', params);

export const updateGroup = (groupId: string, params: UpdateGroupParams) => {
  return put<Result<GroupInfo>>(`/groups/${groupId}`, params)
}

export const getGroupDetail = (groupId: string) => {
  return get<Result<GroupInfo>>(`/groups/${groupId}`)
}

export const getUserGroups = () => {
  return get<PaginatedResult<GroupInfo>>('/groups/user')
}

export const getNearbyGroups = (location: GeoLocation, radius: number = 5000) => {
  return get<PaginatedResult<GroupInfo>>('/groups/nearby', {
    params: { ...location, radius }
  })
}

export const joinGroup = (params: JoinGroupParams) => {
  return post<Result<null>>('/groups/join', params)
}

export const leaveGroup = (groupId: string) => {
  return post<Result<null>>(`/groups/${groupId}/leave`)
}

export const getGroupMembers = (groupId: string) => {
  return get<PaginatedResult<GroupMember>>(`/groups/${groupId}/members`)
}

export const removeGroupMember = (groupId: string, userId: string) => {
  return del<Result<null>>(`/groups/${groupId}/members/${userId}`)
}

export const setGroupAdmin = (groupId: string, userId: string, isAdmin: boolean) => {
  return put<Result<null>>(`/groups/${groupId}/members/${userId}/role`, {
    role: isAdmin ? 'admin' : 'member'
  })
}

// 保活接口
export const keepAliveInGroup = (data: KeepAliveInGroupRequest): APIResponse<KeepAliveInGroupResponse> =>
  post('/groups/keep-alive', data); 