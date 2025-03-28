import { get, post } from '../request'
import type { ApiResponse } from '~/types/common'
import { ACTIVITY_API, USER_API } from '../paths'
import type {
  CreateUserActivityRequest,
  GetNearbyActivitiesRequest,
  FindNearbyUsersRequest,
  FindUserActivitiesRequest,
  ActivityDetail,
  NearbyUser,
  GetNearbyActivitiesResponse,
  CreateUserActivityResponse,
  FindNearbyUsersResponse,
  FindUserActivitiesResponse
} from '~/types/api/activity'
import type { EmptyRequest } from '../request'

/**
 * 创建活动
 */
export const createActivity = (params: CreateUserActivityRequest): Promise<ApiResponse<CreateUserActivityResponse>> =>
  post<CreateUserActivityResponse, CreateUserActivityRequest>(ACTIVITY_API.CREATE, params);

/**
 * 获取附近活动
 */
export const getNearbyActivities = (params: GetNearbyActivitiesRequest): Promise<ApiResponse<GetNearbyActivitiesResponse>> =>
  get<GetNearbyActivitiesResponse, GetNearbyActivitiesRequest>(ACTIVITY_API.NEARBY, params);

/**
 * 获取附近用户
 */
export const getNearbyUsers = (params: FindNearbyUsersRequest): Promise<ApiResponse<FindNearbyUsersResponse>> =>
  get<FindNearbyUsersResponse, FindNearbyUsersRequest>(USER_API.NEARBY, params);

/**
 * 获取用户活动历史
 */
export const getUserActivities = (userId: string): Promise<ApiResponse<FindUserActivitiesResponse>> =>
  get<FindUserActivitiesResponse, FindUserActivitiesRequest>(
    USER_API.USER_ACTIVITIES(userId), 
    { limit: 20 }
  );

/**
 * 获取当前用户活动历史
 */
export const getMyActivities = (limit: number = 20): Promise<ApiResponse<FindUserActivitiesResponse>> =>
  get<FindUserActivitiesResponse, FindUserActivitiesRequest>(USER_API.MY_ACTIVITIES, { limit }); 