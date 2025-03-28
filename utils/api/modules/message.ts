import { get, post } from '../request'
import { MESSAGE_API } from '../paths'
import type { 
  SendMessageToGroupRequest, 
  SendMessageToGroupResponse,
  QueryMessageFromGroupRequest,
  GroupMessage 
} from '~/types/api/message'

/**
 * 发送消息到群组
 */
export const sendMessageToGroup = (data: SendMessageToGroupRequest) => 
  post<SendMessageToGroupResponse, SendMessageToGroupRequest>(MESSAGE_API.CREATE, data)

/**
 * 从群组查询消息
 */
export const queryMessageFromGroup = (params: QueryMessageFromGroupRequest) => 
  get<GroupMessage[], QueryMessageFromGroupRequest>(MESSAGE_API.GET, params) 