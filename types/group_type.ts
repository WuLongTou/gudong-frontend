import type { MapLocation } from "./map_type"

export interface RegisterUserRequest {
    security_code: string;
    public_key: JsonWebKey;
}

export interface RegisterUserResponse {
    session_token: string;
    user_id: string;
    public_key: JsonWebKey;
    expires_at: number;
}

export interface NewGroupRequest {
    name: string
    location: MapLocation
}
export interface NewGroupResponse {
    group_id: string
    name: string
    location: MapLocation
    location_name: string
    member_count: number
}

export interface QueryGroupInfoRequestById {
    group_id: string
}
export interface QueryGroupInfoResponse {
    group_id: string
    name: string
    location: MapLocation
    location_name: string
    member_count: number
}

export interface QueryGroupInfoRequestByName {
    name: string
}

export interface QueryGroupInfoRequestByLocation {
    location: MapLocation
}

export interface JoinGroupRequest {
    group_id: string
    room_access_token?: string
}
export interface JoinGroupResponse {
}

export interface KeepAliveInGroupRequest {
    group_id: string
}

export interface KeepAliveInGroupResponse {
}

export interface LeaveGroupRequest {
    group_id: string
    room_access_token?: string
}

export interface LeaveGroupResponse {
}

export interface SendMessageToGroupRequest {
    group_id: string
    message: string
}
export interface SendMessageToGroupResponse {
}

export interface QueryMessageFromGroupRequest {
    group_id: string
    start_timestamp: number
    end_timestamp: number
}
export interface QueryMessageFromGroupResponse {
    sender_id: string
    sender_name: string
    message: string
    timestamp: number
}

export interface KeepAliveInGroupRequest {
    group_id: string
}
export interface KeepAliveInGroupResponse {
}

export interface OnlineRequest {
    user_id: string
}
export interface OnlineResponse {
    token: string
}
