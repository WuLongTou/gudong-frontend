import { ElMessage } from 'element-plus'
import type { Result } from '~/types/common'

/**
 * 处理通用的API响应
 * @param response API响应对象
 * @param successMessage 成功提示消息
 * @param errorMessage 失败提示消息
 * @returns 处理结果和数据
 */
export function handleApiResponse<T>(
  response: Result<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showSuccessMessage?: boolean;
    showErrorMessage?: boolean;
  } = {}
): { success: boolean; data: T | null } {
  const {
    successMessage = '操作成功',
    errorMessage = '操作失败',
    showSuccessMessage = true,
    showErrorMessage = true
  } = options
  
  if (response.code === 0 && response.resp_data) {
    if (showSuccessMessage) {
      ElMessage.success(successMessage)
    }
    return { success: true, data: response.resp_data }
  } else {
    if (showErrorMessage) {
      ElMessage.error(response.msg || errorMessage)
    }
    return { success: false, data: null }
  }
}

/**
 * 统一错误处理
 * @param error 错误对象
 * @param errorMessage 错误提示信息
 */
export function handleApiError(error: any, errorMessage: string = '请求失败') {
  console.error('API请求错误:', error)
  ElMessage.error(error.message || errorMessage)
  return { success: false, data: null }
} 