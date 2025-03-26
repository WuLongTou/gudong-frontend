import type { Result } from '~/types/common'
import { error_codes } from './error_codes'
import { isPublicApi } from './auth/token'
import { SESSION_TOKEN_KEY } from './auth/token'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'

// HTTP方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// 创建基础请求函数
export const request = async <T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options: any = {}
): Promise<Result<T>> => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const fullUrl = `${baseURL}${url}`

    // 获取token - 直接从 UserStore 获取
    const userStore = useUserStore()
    const token = userStore.sessionToken

    // 请求头
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }

    // 如果有token且不是公共API，添加Authorization头
    if (token && !isPublicApi(url)) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        // 准备请求配置
        const fetchOptions = {
            method,
            headers,
            ...options
        }

        // 添加请求体数据
        if (method !== 'GET' && data) {
            fetchOptions.body = JSON.stringify(data)
        }

        // 发送请求
        const response = await $fetch<Result<T>>(fullUrl, fetchOptions)
        
        // 检查响应中的错误码
        if (response.code === error_codes.AUTH_FAILED) {
            // 如果是认证失败错误，处理token过期情况
            const nuxtApp = useNuxtApp()
            const handleAuthError = nuxtApp.$handleAuthError as any
            if (handleAuthError && !isPublicApi(url)) {
                handleAuthError(response.msg || '登录已过期，请重新登录')
            }
        } else if (response.code === error_codes.PERMISSION_DENIED) {
            // 如果是权限错误
            ElMessage.error(response.msg || '没有操作权限')
        }

        // 返回结果数据
        return response
    } catch (error: any) {
        console.error('Request error:', error)
        
        // 检查是否是认证错误
        if (error.response?.status === 401 || 
            error.response?.data?.code === error_codes.AUTH_FAILED) {
            const nuxtApp = useNuxtApp()
            const handleAuthError = nuxtApp.$handleAuthError as any
            if (handleAuthError && !isPublicApi(url)) {
                handleAuthError(error.response?.data?.msg || '登录已过期，请重新登录')
            }
        }
        
        // 创建统一的错误响应格式
        return {
            code: error.response?.data?.code || error_codes.INTERNAL_ERROR,
            msg: error.response?.data?.msg || error.message || '请求失败',
            resp_data: null as unknown as T
        }
    }
}

// HTTP方法封装
export const get = <T>(url: string, params?: Record<string, any>): Promise<Result<T>> => {
    // 处理查询参数
    const queryString = params ?
        '?' + Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&')
        : ''

    return request<T>('GET', `${url}${queryString}`)
}

export const post = <T>(url: string, data?: any): Promise<Result<T>> =>
    request<T>('POST', url, data)

export const put = <T>(url: string, data?: any): Promise<Result<T>> =>
    request<T>('PUT', url, data)

export const del = <T>(url: string, data?: any): Promise<Result<T>> =>
    request<T>('DELETE', url, data)