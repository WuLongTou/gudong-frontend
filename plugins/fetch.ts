import { defineNuxtPlugin } from '#app'
import { error_codes } from "~/utils/error_codes"
import type { StorageAdapter } from '~/plugins/storage'
import { ElMessage, ElMessageBox } from "element-plus"

export default defineNuxtPlugin((nuxtApp) => {
    const isClient = process.client
    
    // 用于防止多个过期提示同时出现
    let isShowingAuthError = false;

    // 如果不在客户端环境，提供一个空的实现
    const clientSideStorage = {
        getItem: (key: string): string | null => {
            const storage = nuxtApp.$storage as StorageAdapter | undefined
            if (!isClient) return null;
            if (storage) return storage.getItem(key);
            if (isClient) return localStorage.getItem(key);
            return null;
        },
        setItem: (key: string, value: string): void => {
            const storage = nuxtApp.$storage as StorageAdapter | undefined
            if (!isClient) return;
            if (storage) storage.setItem(key, value);
            else if (isClient) localStorage.setItem(key, value);
        },
        removeItem: (key: string): void => {
            const storage = nuxtApp.$storage as StorageAdapter | undefined
            if (!isClient) return;
            if (storage) storage.removeItem(key);
            else if (isClient) localStorage.removeItem(key);
        }
    };

    // 处理认证错误
    const handleAuthError = (message: string) => {
        // 清除登录信息
        clearLoginInfo();
        
        // 只在客户端环境下且没有显示中的错误弹窗时显示错误消息
        if (isClient && !isShowingAuthError) {
            isShowingAuthError = true;
            ElMessageBox.alert(message, '登录提示', {
                confirmButtonText: '确定',
                type: 'warning',
                callback: (action: string) => {
                    isShowingAuthError = false;
                    if (action === 'confirm') {
                        navigateTo('/');
                    }
                }
            });
        }
    };

    // 清除登录信息的辅助函数
    const clearLoginInfo = () => {
        clientSideStorage.removeItem('session_token');
        clientSideStorage.removeItem('user_id');
        clientSideStorage.removeItem('nickname');
    };

    // 处理响应
    const handleResponse = (response: any) => {
        // 检查错误码
        if (response.code === error_codes.AUTH_FAILED) {
            handleAuthError(response.msg || '登录已过期，请重新登录');
            return null;
        } else if (response.code === error_codes.PERMISSION_DENIED) {
            ElMessage.error(response.msg || '没有操作权限');
            return null;
        } else if (response.code !== 0) {
            ElMessage.error(response.msg || '请求失败');
            return null;
        }
        
        return response;
    };

    return {
        provide: {
            clientStorage: clientSideStorage,
            clearLoginInfo,
            handleAuthError,
            handleResponse
        }
    }
}); 