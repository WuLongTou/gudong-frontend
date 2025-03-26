// 位置类型
export interface Location {
  latitude: number
  longitude: number
}

// 附近用户类型
export interface NearbyUser {
  id: string
  nickname: string
  avatar?: string
  status?: string
  distance: number
  last_active: string
}

// 用户活动类型
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

// 附近群组类型
export interface NearbyGroup {
  id: string
  name: string
  avatar?: string
  description: string
  memberCount: number
  distance: number
  createTime: string
}

// 活动创建响应
export interface ActivityCreationResponse {
  activity_id: string
  [key: string]: any
}

// 天气数据类型
export interface WeatherData {
  temperature: number; // 温度
  description: string; // 天气描述
  code: string;       // 天气代码（用于选择图标）
} 