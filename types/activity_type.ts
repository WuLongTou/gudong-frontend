// 附近用户类型
export interface NearbyUser {
  user_id: string
  nickname: string
  last_active: string
  latitude: number
  longitude: number
  distance: number
  avatar?: string
  status: string
}

// 用户活动类型
export interface UserActivity {
  activity_id: string
  user_id: string
  nickname: string
  activity_type: string
  activity_details?: string
  latitude: number
  longitude: number
  created_at: string
  distance: number
  avatar?: string
}

// 活动创建请求类型
export interface CreateActivityRequest {
  activity_type: string
  activity_details?: string
  latitude: number
  longitude: number
}

// 活动创建响应类型
export interface CreateActivityResponse {
  activity_id: string
}

// 附近用户查询请求类型
export interface NearbyUsersRequest {
  latitude: number
  longitude: number
  radius?: number
  limit?: number
}

// 最近活动查询请求类型
export interface RecentActivitiesRequest {
  latitude: number
  longitude: number
  radius?: number
  limit?: number
} 