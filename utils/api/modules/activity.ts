import { get, post } from '../request'
import type { Result } from '~/types/common'
import type { PaginatedResult, GeoLocation } from '~/types/api'
import { ACTIVITY_API, USER_API } from '../paths'

export interface Activity {
  id: string
  userId: string
  userNickname: string
  userAvatarUrl?: string
  type: string
  content?: string
  location: GeoLocation
  createdAt: string
}

export interface NearbyUser {
  id: string
  nickname: string
  avatarUrl?: string
  motto?: string
  lastActiveAt: string
  location: GeoLocation
  distance: number
}

export interface CreateActivityParams {
  type: string
  content?: string
  location: GeoLocation
}

export interface GetNearbyParams {
  location: GeoLocation
  radius?: number
  limit?: number
}

/**
 * 创建活动
 */
export const createActivity = (params: CreateActivityParams) => {
  return post<Result<Activity>>(ACTIVITY_API.CREATE, params)
}

/**
 * 获取附近活动
 */
export const getNearbyActivities = (params: GetNearbyParams) => {
  return get<PaginatedResult<Activity>>(ACTIVITY_API.NEARBY, {
    params: {
      ...params.location,
      radius: params.radius,
      limit: params.limit
    }
  })
}

/**
 * 获取附近用户
 */
export const getNearbyUsers = (params: GetNearbyParams) => {
  return get<PaginatedResult<NearbyUser>>(USER_API.NEARBY, {
    params: {
      ...params.location,
      radius: params.radius,
      limit: params.limit
    }
  })
}

/**
 * 获取用户活动历史
 */
export const getUserActivities = (userId: string) => {
  return get<PaginatedResult<Activity>>(USER_API.USER_ACTIVITIES(userId))
}

/**
 * 获取当前用户活动历史
 */
export const getMyActivities = () => {
  return get<PaginatedResult<Activity>>(USER_API.MY_ACTIVITIES)
} 