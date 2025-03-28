import type { ApiResponse } from '~/types/common';
import { error_codes } from '~/utils/error_codes';
import { isPublicApi } from '~/utils/auth/token';
import { useUserStore } from '~/stores/user';

/**
 * API请求核心模块
 * 
 * 注意：此文件整合了原utils/request.ts的功能，
 * 是项目中所有API请求的基础。所有API模块都应该
 * 使用这个文件中提供的方法进行HTTP请求。
 */

// 空请求类型（占位用）
export interface EmptyRequest { }

// 空响应类型（占位用）
export interface EmptyResponse { }

// HTTP方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 请求选项接口
export interface RequestOptions {
  headers?: Record<string, string>;
  isPublic?: boolean;
  showErrorMessage?: boolean;
  [key: string]: unknown;
}

/**
 * 创建基础请求函数
 * @description 返回值使用Result类型，未来应改为ApiResponse以与后端保持一致
 */
export const request = async <TResponse, TRequest = EmptyRequest>(
  method: HttpMethod,
  url: string,
  data?: TRequest,
  options: RequestOptions = {}
): Promise<ApiResponse<TResponse>> => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  let fullUrl = `${baseURL}${url}`;

  // 获取token
  const userStore = useUserStore();
  const token = userStore.sessionToken;

  // 请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // 如果有token且不是公共API，添加Authorization头
  if (token && !options.isPublic && !isPublicApi(url)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 准备请求配置
    const fetchOptions: Record<string, unknown> = {
      method,
      headers,
      ...options
    };

    // 处理GET请求的查询参数
    if (method === 'GET' && data) {
      const queryParams = new URLSearchParams();
      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        // 更新完整URL
        fullUrl = `${baseURL}${url}`;
      }
    } else if (data) {
      // 非GET请求添加请求体
      fetchOptions.body = JSON.stringify(data);
    }

    // 发送请求
    const response = await $fetch<ApiResponse<TResponse>>(fullUrl, fetchOptions);

    // 检查认证相关错误码
    if (response.code === error_codes.AUTH_FAILED && !isPublicApi(url) && !options.isPublic) {
      const nuxtApp = useNuxtApp();
      const handleAuthError = nuxtApp.$handleAuthError as ((message: string) => void) | undefined;
      handleAuthError?.(response.msg || '登录已过期，请重新登录');
    } else if (response.code === error_codes.PERMISSION_DENIED) {
      // 使用element-plus显示权限错误消息
      const { ElMessage } = await import('element-plus');
      ElMessage.error(response.msg || '没有操作权限');
    }

    return response;
  } catch (error: unknown) {
    console.error('Request error:', error);

    // 处理认证错误
    const err = error as { response?: { status?: number, data?: { code?: number, msg?: string } } };
    if ((err.response?.status === 401 ||
      err.response?.data?.code === error_codes.AUTH_FAILED) &&
      !isPublicApi(url) && !options.isPublic) {
      const nuxtApp = useNuxtApp();
      const handleAuthError = nuxtApp.$handleAuthError as ((message: string) => void) | undefined;
      handleAuthError?.(err.response?.data?.msg || '登录已过期，请重新登录');
    }

    // 是否显示错误消息
    if (options.showErrorMessage !== false) {
      const { ElMessage } = await import('element-plus');
      ElMessage.error(err.response?.data?.msg || (error instanceof Error ? error.message : '请求失败'));
    }

    // 创建统一的错误响应格式
    return {
      code: err.response?.data?.code || error_codes.INTERNAL_ERROR,
      msg: err.response?.data?.msg || (error instanceof Error ? error.message : '请求失败'),
      resp_data: null as unknown as TResponse
    };
  }
};

// HTTP方法封装
export const get = <TResponse, TRequest = EmptyRequest>(
  url: string,
  params?: TRequest,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> => request<TResponse, TRequest>('GET', url, params, options);

export const post = <TResponse, TRequest = EmptyRequest>(
  url: string,
  data?: TRequest,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> => request<TResponse, TRequest>('POST', url, data, options);

export const put = <TResponse, TRequest = EmptyRequest>(
  url: string,
  data?: TRequest,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> => request<TResponse, TRequest>('PUT', url, data, options);

export const del = <TResponse, TRequest = EmptyRequest>(
  url: string,
  data?: TRequest,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> => request<TResponse, TRequest>('DELETE', url, data, options); 