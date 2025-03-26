import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import type { MapLocation } from '~/types/map_type'
import type { CreateActivityResponse } from '~/types/activity_type'
import { createActivity, getNearbyActivities, getNearbyUsers } from '~/utils/api/modules/activity'
import { getNearbyGroups } from '~/utils/api/modules/group'
import { useFormatters } from './useFormatters'

// API响应类型
interface ApiResponse<T> {
  code: number;
  msg?: string;
  resp_data?: T;
}

// 分页结果类型
interface PaginatedResult<T> {
  total?: number;
  page?: number;
  page_size?: number;
  items?: T[];
  [key: string]: any;
}

// 本地类型定义
export interface NearbyUser {
  id: string
  nickname: string
  avatar?: string
  status?: string
  distance: number
  last_active: string
}

export interface UserActivity {
  id: string
  user_id: string
  nickname: string
  avatar?: string
  activity_type: string
  activity_details?: string
  distance: number
  created_at: string
}

export interface NearbyGroup {
  id: string
  name: string
  avatar?: string
  description: string
  memberCount: number
  distance: number
  createTime: string
}

// 通用加载和错误状态类型
interface LoadingState {
  users: boolean
  activities: boolean
  create: boolean
  groups: boolean
}

interface ErrorState {
  users?: string
  activities?: string
  create?: string
  groups?: string
}

// Composable返回类型
export interface ActivityData {
  nearbyUsers: Ref<NearbyUser[]>
  recentActivities: Ref<UserActivity[]>
  nearbyGroups: Ref<NearbyGroup[]>
  isLoading: LoadingState
  error: ErrorState
  fetchNearbyUsers: (location: MapLocation, radius?: number, limit?: number) => Promise<NearbyUser[]>
  fetchRecentActivities: (location: MapLocation, radius?: number, limit?: number) => Promise<UserActivity[]>
  fetchNearbyGroups: (location: MapLocation) => Promise<NearbyGroup[]>
  createActivity: (location: MapLocation, activityType: string, activityDetails?: string) => Promise<CreateActivityResponse>
  formatRelativeTime: (timestamp: string) => string
  formatDistance: (distance: number) => string
  formatActivityType: (type: string) => string
}

/**
 * 将活动类型转换为更友好的显示文本
 */
const formatActivityType = (type: string): string => {
  switch (type) {
    case 'USER_ONLINE':
      return '上线'
    case 'USER_CHECKIN':
      return '签到'
    case 'GROUP_CREATE':
      return '创建群组'
    case 'GROUP_JOIN':
      return '加入群组'
    case 'GROUP_LEAVE':
      return '离开群组'
    case 'GROUP_MEMBER_ADDED':
      return '新成员加入'
    case 'GROUP_MEMBER_REMOVED':
      return '成员被移除'
    case 'GROUP_UPDATE':
      return '群组更新'
    case 'FRIEND_REQUEST':
      return '好友请求'
    case 'FRIEND_ACCEPT':
      return '接受好友'
    case 'MESSAGE_SENT':
      return '发送消息'
    default:
      return type;
  }
}

/**
 * 活动数据组合式函数
 * @returns ActivityData 活动相关的数据和方法
 */
export function useActivity(): ActivityData {
  // 响应式状态
  const nearbyUsers = ref<NearbyUser[]>([])
  const recentActivities = ref<UserActivity[]>([])
  const nearbyGroups = ref<NearbyGroup[]>([])
  
  // 加载和错误状态
  const isLoading = reactive<LoadingState>({
    users: false,
    activities: false,
    create: false,
    groups: false
  })
  
  const error = reactive<ErrorState>({
    users: undefined,
    activities: undefined,
    create: undefined,
    groups: undefined
  })
  
  // 使用格式化工具
  const formatters = useFormatters()

  /**
   * 通用数据获取函数
   */
  const fetchData = async <T, R>(
    fetchFn: (params: any) => Promise<any>,
    params: any,
    stateRef: Ref<R[]>,
    mapFn: (item: any) => R,
    loadingKey: keyof LoadingState,
    errorKey: keyof ErrorState,
    errorMessage: string
  ): Promise<R[]> => {
    if (!params.location || !params.location.latitude || !params.location.longitude) {
      error[errorKey] = '位置信息无效'
      return []
    }
    
    isLoading[loadingKey] = true
    error[errorKey] = undefined
    
    try {
      const result = await fetchFn(params) as unknown as ApiResponse<PaginatedResult<any>>
      
      if (result && result.code === 0 && result.resp_data) {
        let mappedData: R[] = []
        
        if (Array.isArray(result.resp_data)) {
          mappedData = result.resp_data.map(mapFn)
        } else if (result.resp_data.items) {
          mappedData = result.resp_data.items.map(mapFn)
        }
        
        stateRef.value = mappedData
        return mappedData
      } else {
        error[errorKey] = result?.msg || errorMessage
        return []
      }
    } catch (err: any) {
      console.error(`获取数据错误 (${errorKey}):`, err)
      error[errorKey] = err.message || '网络请求失败'
      return []
    } finally {
      isLoading[loadingKey] = false
    }
  }

  /**
   * 获取附近用户
   */
  const fetchNearbyUsers = (location: MapLocation, radius: number = 5000, limit: number = 20): Promise<NearbyUser[]> => {
    return fetchData(
      getNearbyUsers,
      { location, radius, limit },
      nearbyUsers,
      mapToNearbyUser,
      'users',
      'users',
      '获取附近用户失败'
    )
  }

  /**
   * 获取最近活动
   */
  const fetchRecentActivities = (location: MapLocation, radius: number = 5000, limit: number = 20): Promise<UserActivity[]> => {
    return fetchData(
      getNearbyActivities,
      { location, radius, limit },
      recentActivities,
      mapToUserActivity,
      'activities',
      'activities',
      '获取最近活动失败'
    )
  }

  /**
   * 获取附近群组
   */
  const fetchNearbyGroups = (location: MapLocation): Promise<NearbyGroup[]> => {
    // 适配getNearbyGroups函数签名
    const wrappedGetNearbyGroups = (params: { location: MapLocation, radius?: number }) => 
      getNearbyGroups(params.location, params.radius)

    return fetchData(
      wrappedGetNearbyGroups,
      { location, radius: 5000 },
      nearbyGroups,
      mapToNearbyGroup,
      'groups',
      'groups',
      '获取附近群组失败'
    )
  }

  /**
   * 创建用户活动
   */
  const createUserActivity = async (
    location: MapLocation,
    activityType: string,
    activityDetails?: string
  ): Promise<CreateActivityResponse> => {
    if (!location || !location.latitude || !location.longitude) {
      error.create = '位置信息无效'
      return { activity_id: '' }
    }
    
    isLoading.create = true
    error.create = undefined
    
    try {
      const result = await createActivity({
        type: activityType,
        content: activityDetails,
        location
      }) as unknown as ApiResponse<{ id: string }>
      
      if (result && result.code === 0 && result.resp_data) {
        // 创建成功后刷新活动列表
        await fetchRecentActivities(location)
        return { activity_id: result.resp_data.id }
      } else {
        error.create = result?.msg || '创建活动失败'
        return { activity_id: '' }
      }
    } catch (err: any) {
      console.error('创建活动错误:', err)
      error.create = err.message || '网络请求失败'
      return { activity_id: '' }
    } finally {
      isLoading.create = false
    }
  }

  // 数据映射函数
  const mapToNearbyUser = (user: any): NearbyUser => ({
    id: user.id || user.user_id,
    nickname: user.nickname,
    avatar: user.avatar || user.avatarUrl,
    status: user.status,
    distance: user.distance,
    last_active: user.last_active || user.lastActiveAt,
  })

  const mapToUserActivity = (activity: any): UserActivity => ({
    id: activity.id || activity.activity_id,
    user_id: activity.userId || activity.user_id,
    nickname: activity.userNickname || activity.nickname,
    avatar: activity.userAvatarUrl || activity.avatar,
    activity_type: activity.type || activity.activity_type,
    activity_details: activity.content || activity.activity_details,
    distance: activity.distance,
    created_at: activity.createdAt || activity.created_at,
  })

  const mapToNearbyGroup = (group: any): NearbyGroup => ({
    id: group.id || group.group_id,
    name: group.name,
    avatar: group.avatar || group.avatarUrl,
    description: group.description,
    memberCount: group.memberCount || group.member_count,
    distance: group.distance,
    createTime: group.createTime || group.createdAt || group.created_at,
  })

  return {
    // 响应式状态
    nearbyUsers,
    recentActivities,
    nearbyGroups,
    isLoading,
    error,
    
    // 数据获取方法
    fetchNearbyUsers,
    fetchRecentActivities,
    fetchNearbyGroups,
    createActivity: createUserActivity,
    
    // 格式化方法
    formatRelativeTime: formatters.formatRelativeTime,
    formatDistance: formatters.formatDistance,
    formatActivityType
  }
} 