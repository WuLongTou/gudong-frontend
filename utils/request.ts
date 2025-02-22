import type { Result } from '~/types/common'

export const post_wrapper = <T>(url: string, data?: any) => {
    const { $axios } = useNuxtApp()
    return $axios.post<Result<T>>(url, data)
}