// import type { StorageAdapter } from '~/plugins/storage.client';
import { startTokenRefreshTimer, stopTokenRefreshTimer } from '~/utils/auth/jwt.client';
import { SESSION_TOKEN_KEY, USER_ID_KEY, NICKNAME_KEY, EXPIRES_AT_KEY } from '~/utils/auth/token';
import { useUserStore } from '~/stores/user';
import { defineNuxtPlugin, useNuxtApp } from '#app';
import { ElMessage, ElMessageBox } from 'element-plus';
import { error_codes } from '~/utils/error_codes';

// 客户端检测
const isClient = () => typeof window !== 'undefined';

// 定义插件提供的函数类型
declare module '#app' {
  interface NuxtApp {
    $auth: {
      isLoggedIn: () => boolean;
      getUser: () => { userId: string; nickname: string };
      logout: () => void;
    };
    $clearLoginInfo: () => void;
    $handleAuthError: (message: string) => void;
    $handleResponse: (response: any) => any;
  }
}

// Storage接口定义
interface Storage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export default defineNuxtPlugin((nuxtApp) => {
  // 初始化token刷新
  const userStore = useUserStore();
  userStore.initTokenRefresh();

  // 用于防止多个过期提示同时出现
  let isShowingAuthError = false;

  // 清除登录信息的辅助函数
  const clearLoginInfo = () => {
    userStore.logout();
  };

  // 处理认证错误
  const handleAuthError = (message: string) => {
    // 清除登录信息
    userStore.logout();
    
    if (!isShowingAuthError) {
      isShowingAuthError = true;
      ElMessageBox.alert(message, '登录提示', {
        confirmButtonText: '确定',
        type: 'warning',
        callback: (action: string) => {
          isShowingAuthError = false;
          if (action === 'confirm') {
            navigateTo('/login');
          }
        }
      });
    }
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
      auth: {
        // 获取登录状态
        isLoggedIn: () => userStore.isLoggedIn,

        // 获取当前用户信息
        getUser: () => userStore.currentUser,

        // 登出
        logout: () => {
          userStore.logout();
          handleAuthError('已登出系统');
        }
      },
      clearLoginInfo,
      handleAuthError,
      handleResponse
    }
  };
}); 