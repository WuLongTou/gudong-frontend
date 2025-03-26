import { TOKEN_REFRESH_INTERVAL } from './token';
import { refreshToken } from '~/utils/api/modules/user';
import { useUserStore } from '~/stores/user';
import type { PendingRequestCallback } from './jwt';

// 定时器ID
let refreshTimerId: NodeJS.Timeout | null = null;
// 刷新token时的锁，防止多个请求同时刷新token
let isRefreshing = false;
// 等待队列，存储因token过期而被拦截的请求
let pendingRequests: Array<PendingRequestCallback> = [];

// 刷新token函数
export async function doRefreshToken(): Promise<boolean> {
  // 如果正在刷新，返回false
  if (isRefreshing) return false;

  try {
    isRefreshing = true;
    const userStore = useUserStore();

    // 如果没有token，不进行刷新
    if (!userStore.sessionToken) {
      return false;
    }

    // 刷新 token
    const response = await refreshToken();

    if (response.code === 0 && response.resp_data?.token) {
      // 直接更新 store 中的 token
      userStore.sessionToken = response.resp_data.token;

      // 执行队列中的所有请求
      pendingRequests.forEach(callback => callback());
      pendingRequests = [];

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Token刷新请求失败:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
}

// 添加请求到等待队列
export function addPendingRequest(callback: PendingRequestCallback): void {
  pendingRequests.push(callback);
}

// 启动token刷新定时器
export function startTokenRefreshTimer(): void {
  // 先清除现有的定时器
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
  }

  // 设置一个定时器，定期刷新token
  refreshTimerId = setInterval(async () => {
    const userStore = useUserStore();
    
    // 如果没有token，停止定时器
    if (!userStore.sessionToken) {
      stopTokenRefreshTimer();
      return;
    }

    // 尝试刷新token
    await doRefreshToken();
  }, TOKEN_REFRESH_INTERVAL);
}

// 停止token刷新定时器
export function stopTokenRefreshTimer(): void {
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
  }
} 