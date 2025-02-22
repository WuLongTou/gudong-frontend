interface NewGroupRequest {
    name: string
    location: MapLocation
}
interface NewGroupResponse {
    group_id: string
    name: string
    location: MapLocation
    location_name: string
    member_count: number
}

interface QueryGroupInfoRequestById {
    group_id: string
}
interface QueryGroupInfoResponse {
    group_id: string
    name: string
    location: MapLocation
    location_name: string
    member_count: number
}

interface QueryGroupInfoRequestByName {
    name: string
}

interface QueryGroupInfoRequestByLocation {
    location: MapLocation
}

interface JoinGroupRequest {
    group_id: string
    user_id: string
    room_access_token?: string
}
interface JoinGroupResponse {
}

interface LeaveGroupRequest {
    group_id: string
    user_id: string
    room_access_token?: string
}

interface LeaveGroupResponse {
}

interface SendMessageToGroupRequest {
    group_id: string
    user_id: string
    message: string
}
interface SendMessageToGroupResponse {
}

interface QueryMessageFromGroupRequest {
    group_id: string
    start_timestamp: number
    end_timestamp: number
}
interface QueryMessageFromGroupResponse {
    id: string
    messages: {
        user_id: string
        message: string | null
        timestamp: number
    }[]
}

export type {
    NewGroupRequest,
    NewGroupResponse,
    QueryGroupInfoRequestById,
    QueryGroupInfoRequestByName,
    QueryGroupInfoRequestByLocation,
    QueryGroupInfoResponse,
    JoinGroupRequest,
    JoinGroupResponse,
    LeaveGroupRequest,
    LeaveGroupResponse,
    SendMessageToGroupRequest,
    SendMessageToGroupResponse,
    QueryMessageFromGroupRequest,
    QueryMessageFromGroupResponse,
}

