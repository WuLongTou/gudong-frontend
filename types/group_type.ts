export interface NewGroupRequest {
    name: string
    location_name: string
    latitude: number
    longitude: number
    description: string
    password?: string
}

export interface GroupInfo {
    group_id: string
    name: string
    location_name: string
    description: string
    member_count: number
    is_need_password: boolean
}

export interface QueryGroupInfoByIdRequest {
    group_id: string
}

export interface QueryGroupInfoByNameRequest {
    name: string
}

export interface QueryGroupInfoByLocationRequest {
    latitude: number;
    longitude: number;
    radius?: number;
}

export interface JoinGroupRequest {
    group_id: string
    password?: string
}
export interface JoinGroupResponse {
}

export interface KeepAliveInGroupRequest {
    group_id: string;
}

export interface KeepAliveInGroupResponse {
    last_active_time: number;
}

export interface LeaveGroupRequest {
    group_id: string
}

export interface LeaveGroupResponse {
}

export interface NearbyGroup {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  memberCount: number;
  distance: number;
  createTime: string;
}

