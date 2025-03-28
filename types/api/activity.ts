// ------------------------
// 活动类型枚举 - 与后端保持一致
// ------------------------

/**
 * 活动类型枚举
 */
export enum ActivityType {
  GroupCreated = 'group_created',
  UserJoined = 'user_joined',
  MessageSent = 'message_sent',
  UserCheckedIn = 'user_checked_in'
}

// ------------------------
// API 请求参数类型 (前端 -> 后端)
// ------------------------

/**
 * 获取附近活动请求
 */
export interface GetNearbyActivitiesRequest {
  latitude: number
  longitude: number
  radius: number
  limit: number
}

/**
 * 创建用户活动请求
 */
export interface CreateUserActivityRequest {
  activity_type: ActivityType
  description?: string
  latitude: number
  longitude: number
}

/**
 * 查找附近用户请求
 */
export interface FindNearbyUsersRequest {
  latitude: number
  longitude: number
  radius: number
  limit: number
}

/**
 * 查找用户活动请求
 */
export interface FindUserActivitiesRequest {
  limit: number
}

// ------------------------
// API 响应数据类型 (后端 -> 前端)
// ------------------------

/**
 * 活动详情
 */
export interface ActivityDetail {
  id: string
  activity_type: ActivityType
  group_id: string
  group_name: string
  user_id: string
  user_name: string
  description: string
  occurred_at: string
  latitude: number
  longitude: number
  distance?: number
  avatar_url?: string
}

/**
 * 附近用户信息
 */
export interface NearbyUser {
  user_id: string
  nickname: string
  distance: number
}

/**
 * 获取附近活动响应
 */
export interface GetNearbyActivitiesResponse {
  activities: ActivityDetail[]
}

/**
 * 创建用户活动响应
 */
export interface CreateUserActivityResponse {
  activity_id: string
}

/**
 * 查找附近用户响应
 */
export interface FindNearbyUsersResponse {
  users: NearbyUser[]
}

/**
 * 查找用户活动响应
 */
export interface FindUserActivitiesResponse {
  activities: ActivityDetail[]
  next_cursor?: string
  has_more: boolean
}

// 为保持向后兼容，提供类型别名
export type Activity = ActivityDetail
export type QueryActivityRequest = GetNearbyActivitiesRequest
export type NearbyUsersRequest = FindNearbyUsersRequest
export type CreateActivityRequest = CreateUserActivityRequest
export type CreateActivityResponse = CreateUserActivityResponse
export type RecentActivitiesRequest = GetNearbyActivitiesRequest 