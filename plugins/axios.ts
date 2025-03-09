import axios from "axios"

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const instance = axios.create({
        baseURL: config.public.apiBaseUrl,
        timeout: 10000
    })

    instance.interceptors.request.use(cfg => {
        const token = localStorage.getItem('session_token')
        if (token && cfg.headers) {
            cfg.headers.Authorization = `Bearer ${token}`
        }
        return cfg
    })

    instance.interceptors.response.use(
        (response) => {
            return Promise.resolve(response.data);
        },
        (error) => {
            const errData = error.response?.data || { 
                code: 500, 
                msg: error.message || '未知错误',
                resp_data: null
            };
            return Promise.reject(errData);
        }
    )

    return {
        provide: {
            axios: instance
        }
    }
})