// 新增公共响应类型
export interface Result<T = any> {
    code: number
    msg?: string
    resp_data: T
}
