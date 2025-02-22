import axios from "axios"
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const instance = axios.create({
        baseURL: config.public.apiBaseUrl,
        timeout: 10000
    })

    instance.interceptors.request.use(cfg => {
        return cfg
    })

    instance.interceptors.response.use(
        response => Promise.resolve(response),
        error => Promise.reject(error)
    )

    return {
        provide: {
            axios: instance
        }
    }
})