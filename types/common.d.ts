// 新增公共响应类型
export interface Result<T = any> {
    code: number
    error_message?: string
    content: T
}
