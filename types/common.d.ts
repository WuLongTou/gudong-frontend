// 新增公共响应类型
interface Result<T = any> {
    code: number
    message?: string
    data: T
}

export type { Result } 