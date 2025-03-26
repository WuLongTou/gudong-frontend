import type { Result } from '~/types/common';
import type {
  SendMessageToGroupRequest,
  SendMessageToGroupResponse,
  QueryMessageFromGroupRequest,
  GroupMessage,
} from '~/types/message_type';
import { post } from '~/utils/api/request';
import { MESSAGE_API } from '../paths';

// 统一响应类型
type APIResponse<T> = Promise<Result<T>>;

// 消息相关API
export const sendMessageToGroup = (data: SendMessageToGroupRequest): APIResponse<SendMessageToGroupResponse> =>
  post(MESSAGE_API.CREATE, data);

export const queryMessageFromGroup = (data: QueryMessageFromGroupRequest): APIResponse<GroupMessage[]> =>
  post(MESSAGE_API.GET, data); 