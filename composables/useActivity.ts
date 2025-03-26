import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import type { MapLocation } from '~/types/map_type'
import type { CreateActivityResponse, NearbyUser, UserActivity } from '~/types/activity_type'
import { createActivity, getNearbyActivities, getNearbyUsers } from '~/utils/api/modules/activity'
import { useFormatters } from './useFormatters'
import type { NearbyGroup } from '~/types/group_type'

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

export interface ActivityData {
  nearbyUsers: Ref<NearbyUser[]>
  recentActivities: Ref<UserActivity[]>
  nearbyGroups: Ref<NearbyGroup[]>
  isLoading: {
    users: boolean
    activities: boolean
    create: boolean
    groups: boolean
  }
  error: {
    users: string | undefined
    activities: string | undefined
    create: string | undefined
    groups: string | undefined
  }
  fetchNearbyUsers: (location: MapLocation, radius?: number, limit?: number) => Promise<NearbyUser[]>
  fetchRecentActivities: (location: MapLocation, radius?: number, limit?: number) => Promise<UserActivity[]>
  fetchNearbyGroups: (location: MapLocation) => Promise<NearbyGroup[]>
  createActivity: (location: MapLocation, activityType: string, activityDetails?: string) => Promise<CreateActivityResponse>
  formatRelativeTime: (timestamp: string) => string
  formatDistance: (distance: number) => string
}

// 客户端检测
const isClient = () => typeof window !== 'undefined';

/**
 * 创建活动数据钩子
 * @returns ActivityData 活动数据与方法
 */
function createActivityHook(): ActivityData {
  const nearbyUsers = ref<NearbyUser[]>([])
  const recentActivities = ref<UserActivity[]>([])
  const nearbyGroups = ref<NearbyGroup[]>([])
  const isLoading = reactive({
    users: false,
    activities: false,
    create: false,
    groups: false
  })
  const error = reactive({
    users: undefined as string | undefined,
    activities: undefined as string | undefined,
    create: undefined as string | undefined,
    groups: undefined as string | undefined
  })
  
  // 使用通用格式化工具
  const formatters = useFormatters()

  /**
   * 获取附近用户
   */
  const fetchNearbyUsers = async (location: MapLocation, radius: number = 5000, limit: number = 20): Promise<NearbyUser[]> => {
    if (!location || !location.latitude || !location.longitude) {
      error.users = '位置信息无效'
      return []
    }
    
    isLoading.users = true
    error.users = undefined
    
    try {
      const result = await getNearbyUsers({
        location,
        radius,
        limit,
      }) as unknown as ApiResponse<PaginatedResult<NearbyUser> | NearbyUser[]>
      
      if (result && result.code === 0 && result.resp_data) {
        // 处理不同的数据结构
        if (Array.isArray(result.resp_data)) {
          nearbyUsers.value = result.resp_data
        } else if (result.resp_data.items) {
          nearbyUsers.value = result.resp_data.items
        } else {
          nearbyUsers.value = []
        }
        return nearbyUsers.value
      } else {
        error.users = result?.msg || '获取附近用户失败'
        return []
      }
    } catch (err: any) {
      console.error('获取附近用户错误:', err)
      error.users = err.message || '网络请求失败'
      return []
    } finally {
      isLoading.users = false
    }
  }

  /**
   * 获取最近活动
   */
  const fetchRecentActivities = async (location: MapLocation, radius: number = 5000, limit: number = 20): Promise<UserActivity[]> => {
    if (!location || !location.latitude || !location.longitude) {
      error.activities = '位置信息无效'
      return []
    }
    
    isLoading.activities = true
    error.activities = undefined
    
    try {
      const result = await getNearbyActivities({
        location,
        radius,
        limit,
      }) as unknown as ApiResponse<PaginatedResult<UserActivity> | UserActivity[]>
      
      if (result && result.code === 0 && result.resp_data) {
        // 处理不同的数据结构
        if (Array.isArray(result.resp_data)) {
          recentActivities.value = result.resp_data
        } else if (result.resp_data.items) {
          recentActivities.value = result.resp_data.items
        } else {
          recentActivities.value = []
        }
        return recentActivities.value
      } else {
        error.activities = result?.msg || '获取最近活动失败'
        return []
      }
    } catch (err: any) {
      console.error('获取最近活动错误:', err)
      error.activities = err.message || '网络请求失败'
      return []
    } finally {
      isLoading.activities = false
    }
  }

  /**
   * 获取附近群组
   */
  const fetchNearbyGroups = async (location: MapLocation): Promise<NearbyGroup[]> => {
    if (!location || !location.latitude || !location.longitude) {
      error.groups = '位置信息无效'
      return []
    }
    
    isLoading.groups = true
    error.groups = undefined
    
    try {
      const response = await fetch(`/api/v1/groups/nearby?latitude=${location.latitude}&longitude=${location.longitude}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json() as ApiResponse<PaginatedResult<NearbyGroup>>
      
      if (data.code === 0 && data.resp_data && Array.isArray(data.resp_data.items)) {
        nearbyGroups.value = data.resp_data.items
        return data.resp_data.items
      } else {
        error.groups = data.msg || '获取附近群组失败'
        return []
      }
    } catch (err: any) {
      console.error('获取附近群组错误:', err)
      error.groups = err.message || '网络请求失败'
      return []
    } finally {
      isLoading.groups = false
    }
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
      // 使用as unknown转换类型
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

  return {
    nearbyUsers,
    recentActivities,
    nearbyGroups,
    isLoading,
    error,
    fetchNearbyUsers,
    fetchRecentActivities,
    fetchNearbyGroups,
    createActivity: createUserActivity,
    // 使用共享的格式化函数
    formatRelativeTime: formatters.formatRelativeTime,
    formatDistance: formatters.formatDistance,
  }
}

/**
 * 使用活动数据的组合式函数
 * @returns ActivityData 活动相关的数据和方法
 */
export function useActivity(): ActivityData {
  return createActivityHook()
}

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