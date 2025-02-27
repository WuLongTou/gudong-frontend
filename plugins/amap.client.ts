import AMapLoader from '@amap/amap-jsapi-loader'

declare global {
    interface Window {
        _AMapSecurityConfig: {
            securityJsCode?: string
            serviceHost?: string
        }
    }
}

export default defineNuxtPlugin(async (nuxtApp) => {
    const runtimeConfig = useRuntimeConfig()
    window._AMapSecurityConfig = {
        serviceHost: runtimeConfig.public.amapServiceHost
    }

    // 异步加载高德地图
    const mapInstance = await AMapLoader.load({
        key: runtimeConfig.public.amapApiKey,
        version: '2.0',
    }) as typeof AMap

    return {
        provide: {
            amap: mapInstance
        }
    }
})