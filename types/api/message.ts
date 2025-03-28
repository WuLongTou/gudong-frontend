// ------------------------
// API 请求参数类型 (前端 -> 后端)
// ------------------------

/**
 * 发送消息到群组请求
 */
export interface SendMessageToGroupRequest {
    group_id: string
    content: string
}

/**
 * 从群组查询消息请求
 */
export interface QueryMessageFromGroupRequest {
    group_id: string
    message_id?: string
    limit?: number
}

// ------------------------
// API 响应数据类型 (后端 -> 前端)
// ------------------------

/**
 * 群组消息
 */
export interface GroupMessage {
    message_id: string
    group_id: string
    user_id: string
    nickname: string
    content: string
    created_at: string
}

/**
 * 发送消息到群组响应
 */
export interface SendMessageToGroupResponse {
    message_id: string
}
