import type { Result } from '~/types/common';
import { error_codes } from '~/utils/constants/error_codes';
import { isPublicApi } from '~/utils/auth/token';
import { useUserStore } from '~/stores/user';

// HTTP方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 请求选项接口
interface RequestOptions {
  headers?: Record<string, string>;
  isPublic?: boolean;
  showErrorMessage?: boolean;
  params?: Record<string, any>;
  [key: string]: any;
}

// 创建基础请求函数
export const request = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<Result<T>> => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const fullUrl = `${baseURL}${url}`;

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
    // 准备请求配置和请求体数据
    const fetchOptions: any = {
      method,
      headers,
      ...options
    };

    // 添加请求体数据
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // 发送请求
    const response = await $fetch<Result<T>>(fullUrl, fetchOptions);
    
    // 返回结果数据
    return response;
  } catch (error: any) {
    console.error('Request error:', error);
    
    // 创建统一的错误响应格式
    return {
      code: error.response?.data?.code || error_codes.INTERNAL_ERROR,
      msg: error.response?.data?.msg || error.message || '请求失败',
      resp_data: null as unknown as T
    };
  }
};

// HTTP方法封装
export const get = <T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<Result<T>> => {
  // 处理查询参数
  const queryString = params ?
      '?' + Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&')
      : '';

  return request<T>('GET', `${url}${queryString}`, undefined, options);
};

export const post = <T>(url: string, data?: any, options?: RequestOptions): Promise<Result<T>> =>
  request<T>('POST', url, data, options);

export const put = <T>(url: string, data?: any, options?: RequestOptions): Promise<Result<T>> =>
  request<T>('PUT', url, data, options);

export const del = <T>(url: string, data?: any, options?: RequestOptions): Promise<Result<T>> =>
  request<T>('DELETE', url, data, options); 