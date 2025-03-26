/**
 * JWT相关的共享类型定义
 * 用于客户端和服务器端共享的类型
 */

/**
 * 等待请求的回调函数类型
 * 当token刷新成功后，这些回调将被调用以重试请求
 */
export type PendingRequestCallback = () => void; 