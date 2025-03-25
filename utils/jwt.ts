import type { StorageAdapter } from '~/plugins/storage';
import type { Result } from '@/types/common';

// 定时器ID
let refreshTimerId: NodeJS.Timeout | null = null;
// 刷新token时的锁，防止多个请求同时刷新token
let isRefreshing = false;
// 等待队列，存储因token过期而被拦截的请求
let pendingRequests: Array<() => void> = [];

// 公共API路径列表，这些API不需要token验证
export const publicApiPaths = [
  '/users/register',
  '/users/login',
  '/users/temporary',
  '/users/refresh-token'
];

// 检查是否是公共API
export function isPublicApi(url: string): boolean {
  return publicApiPaths.some(path => url.includes(path));
}

// 刷新token函数
export async function refreshToken(storage: any): Promise<boolean> {
  // 确保只在客户端执行
  if (typeof window === 'undefined') return false;
  
  // 如果正在刷新，返回false
  if (isRefreshing) return false;
  
  try {
    isRefreshing = true;
    
    // 动态导入API函数，避免循环依赖
    const { refreshToken: apiRefreshToken } = await import('./api');
    const response = await apiRefreshToken();
    
    if (response.code === 0 && response.resp_data?.token) {
      // 保存新token
      storage.setItem('session_token', response.resp_data.token);
      
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
export function addPendingRequest(callback: () => void): void {
  pendingRequests.push(callback);
}

// 启动token刷新定时器
export function startTokenRefreshTimer(storage: any): void {
  // 确保只在客户端执行
  if (typeof window === 'undefined') return;
  
  // 先清除现有的定时器
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
  }

  // 设置一个定时器，每15分钟刷新一次token
  refreshTimerId = setInterval(async () => {
    const token = storage.getItem('session_token');
    if (!token) {
      // 如果没有token，停止定时器
      stopTokenRefreshTimer();
      return;
    }

    // 尝试刷新token
    await refreshToken(storage);
  }, 15 * 60 * 1000); // 每15分钟刷新一次
}

// 停止token刷新定时器
export function stopTokenRefreshTimer(): void {
  // 确保只在客户端执行
  if (typeof window === 'undefined') return;
  
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
  }
} 