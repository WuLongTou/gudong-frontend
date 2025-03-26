/**
 * API路径常量
 * 集中管理所有API端点，便于统一维护
 */

// 用户相关
export const USER_API = {
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  TEMPORARY: '/users/temporary',
  REFRESH_TOKEN: '/users/refresh-token',
  UPDATE_NICKNAME: '/users/update-nickname',
  UPDATE_PASSWORD: '/users/update-password',
  RESET_PASSWORD: '/users/reset-password',
  CHECK_TOKEN: '/users/check-token',
  NEARBY: '/users/nearby',
  MY_ACTIVITIES: '/users/me/activities',
  USER_ACTIVITIES: (userId: string) => `/users/${userId}/activities`
}

// 群组相关
export const GROUP_API = {
  CREATE: '/groups/create',
  BY_NAME: '/groups/by-name',
  BY_ID: '/groups/by-id',
  BY_LOCATION: '/groups/by-location',
  JOIN: '/groups/join',
  LEAVE: '/groups/leave',
  DETAIL: (groupId: string) => `/groups/${groupId}`,
  USER_GROUPS: '/groups/user',
  NEARBY: '/groups/nearby',
  MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
  REMOVE_MEMBER: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}`,
  SET_ROLE: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}/role`,
  KEEP_ALIVE: '/groups/keep-alive'
}

// 消息相关
export const MESSAGE_API = {
  CREATE: '/messages/create',
  GET: '/messages/get'
}

// 活动相关
export const ACTIVITY_API = {
  CREATE: '/activities/create',
  NEARBY: '/activities/nearby',
  NEARBY_USERS: '/activities/nearby-users',
  RECENT: '/activities/recent'
} 