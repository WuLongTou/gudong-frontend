import type { Result } from './common';

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应结果
 */
export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 地理位置信息
 */
export interface GeoLocation {
  latitude: number
  longitude: number
}

/**
 * 带分页的API响应结果
 */
export type PaginatedResult<T> = Result<PaginationResult<T>> 