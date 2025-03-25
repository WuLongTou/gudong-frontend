import type { StorageAdapter } from '~/plugins/storage';
import { startTokenRefreshTimer, stopTokenRefreshTimer } from '~/utils/jwt';

export default defineNuxtPlugin((nuxtApp) => {
  // 获取storage，检查是否在浏览器环境
  const isClient = process.client;
  const storage = nuxtApp.$storage as StorageAdapter || (isClient ? localStorage : null);

  // 如果不在客户端环境，提供一个空的实现
  const clientSideStorage = {
    getItem: (key: string): string | null => {
      if (!isClient) return null;
      return storage?.getItem(key) || null;
    },
    setItem: (key: string, value: string): void => {
      if (!isClient) return;
      storage?.setItem(key, value);
    },
    removeItem: (key: string): void => {
      if (!isClient) return;
      storage?.removeItem(key);
    }
  };

  // 如果在客户端环境且有token，启动刷新定时器
  let initialized = false;

  // 确保只在客户端环境下初始化一次
  if (isClient && !initialized) {
    // 初次加载页面时检查token并启动刷新定时器
    if (clientSideStorage.getItem('session_token')) {
      startTokenRefreshTimer(clientSideStorage);
    }
    
    // 标记为已初始化
    initialized = true;

    // 页面离开时停止定时器
    nuxtApp.hook('app:mounted', () => {
      onBeforeUnmount(() => {
        stopTokenRefreshTimer();
      });
    });
  }

  // 检查用户是否已登录
  const isLoggedIn = (): boolean => {
    const token = clientSideStorage.getItem('session_token');
    return !!token;
  };

  // 获取当前用户信息
  const getCurrentUser = (): { userId: string | null; nickname: string | null } => {
    return {
      userId: clientSideStorage.getItem('user_id'),
      nickname: clientSideStorage.getItem('nickname')
    };
  };

  // 注销用户
  const logout = (): void => {
    clientSideStorage.removeItem('session_token');
    clientSideStorage.removeItem('user_id');
    clientSideStorage.removeItem('nickname');
    if (isClient) {
      stopTokenRefreshTimer();
    }
  };

  return {
    provide: {
      auth: {
        isLoggedIn,
        getCurrentUser,
        logout
      }
    }
  };
}); 