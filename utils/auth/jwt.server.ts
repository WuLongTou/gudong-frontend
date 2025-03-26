import type { PendingRequestCallback } from './jwt';

// 服务器端空实现

export async function doRefreshToken(): Promise<boolean> {
  return false;
}

export function addPendingRequest(_callback: PendingRequestCallback): void {
  // 服务器端空实现
}

export function startTokenRefreshTimer(): void {
  // 服务器端空实现
}

export function stopTokenRefreshTimer(): void {
  // 服务器端空实现
} 