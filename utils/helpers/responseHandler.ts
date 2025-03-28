import type { ApiResponse } from '~/types/common'
import { ElMessage } from 'element-plus'

/**
 * 处理API响应（简化版本）
 * @param response API响应对象
 * @param options 可选配置
 * @returns 处理后的结果
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  options?: {
    successMessage?: string | null;
    errorMessage?: string | null;
  }
): { success: boolean; data: T | null; message: string } {
  const success = response.code === 0
  const result = {
    success,
    data: success ? response.resp_data : null,
    message: response.msg || ''
  }

  // 显示成功消息
  if (success && options?.successMessage) {
    ElMessage.success(options.successMessage)
  }

  // 显示错误消息
  if (!success && options?.errorMessage) {
    ElMessage.error(options.errorMessage + (result.message ? `: ${result.message}` : ''))
  }

  return result
}

/**
 * 处理API错误
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 */
export function handleApiError(error: unknown, defaultMessage: string = '请求失败') {
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  console.error(errorMessage, error)
  ElMessage.error(errorMessage)
} 