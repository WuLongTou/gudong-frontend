// ------------------------
// API 请求参数类型 (前端 -> 后端)
// ------------------------

/**
 * 创建群组请求
 */
export interface NewGroupRequest {
    name: string
    location_name: string
    latitude: number
    longitude: number
    description: string
    password?: string
}

/**
 * 根据ID查询群组请求
 */
export interface QueryGroupInfoByIdRequest {
    group_id: string
}

/**
 * 根据名称查询群组请求
 */
export interface QueryGroupInfoByNameRequest {
    name: string
}

/**
 * 根据位置查询群组请求
 */
export interface QueryGroupInfoByLocationRequest {
    latitude: number
    longitude: number
    radius?: number
}

/**
 * 加入群组请求
 */
export interface JoinGroupRequest {
    group_id: string
    password?: string
}

/**
 * 离开群组请求
 */
export interface LeaveGroupRequest {
    group_id: string
}

/**
 * 设置成员角色请求
 */
export interface SetMemberRoleRequest {
    role: string
}

/**
 * 群组保活请求
 */
export interface KeepAliveInGroupRequest {
    group_id: string
}

// ------------------------
// API 响应数据类型 (后端 -> 前端)
// ------------------------

/**
 * 群组信息
 */
export interface GroupInfo {
    group_id: string
    name: string
    location_name: string
    description: string
    member_count: number
    is_need_password: boolean
}

/**
 * 群组成员信息
 */
export interface GroupMember {
    group_id: string
    user_id: string
    nickname: string
    avatar_url?: string
    role: 'owner' | 'admin' | 'member'
    joined_at: string
    last_active?: string
}

/**
 * 加入群组响应
 */
export interface JoinGroupResponse {
    // 加入成功后的额外信息，如果有的话
}

/**
 * 离开群组响应
 */
export interface LeaveGroupResponse {
    // 离开成功后的额外信息，如果有的话
}

/**
 * 群组保活响应
 */
export interface KeepAliveInGroupResponse {
    last_active_time: number
}

/**
 * 附近群组信息
 */
export interface NearbyGroup {
    id: string
    name: string
    description?: string
    memberCount: number
    distance?: number
}

