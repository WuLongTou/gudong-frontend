/**
 * 通用API返回结果类型
 * 后续应与后端保持一致的命名，推荐使用ApiResponse
 */
export interface ApiResponse<T> {
  /** 返回码, 0表示成功，非0表示失败 */
  code: number;
  /** 错误信息描述 */
  msg: string;
  /** 返回的数据 */
  resp_data: T;
}

/**
 * 空请求类型，用于不需要请求参数的API
 */
export interface EmptyRequestParams { }
