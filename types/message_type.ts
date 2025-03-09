
export interface GroupMessage {
    message_id: string
    group_id: string
    user_id: string
    nickname: string
    content: string
    created_at: string
}

export interface SendMessageToGroupRequest {
    group_id: string
    content: string
}
export interface SendMessageToGroupResponse {
}

export interface QueryMessageFromGroupRequest {
    group_id: string
    message_id?: string
    limit?: number
}
