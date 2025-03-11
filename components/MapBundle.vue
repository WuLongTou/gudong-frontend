<template>
    <div id="map-container" class="map-container" />
</template>

<script setup lang="ts">
import type { MapLocation } from '~/types';
const { $amap } = useNuxtApp()

const emits = defineEmits<{
    'update:location': [MapLocation]
    'update:locationName': [string]
}>()

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

// 存放props.location的值
const locationFromProps = toRef(props, 'location')
// 存放地图中拖动marker导致location的变化
const locationFromMap = ref<MapLocation>(locationFromProps.value)
// 存放location的变化事件
const LocationSource = {
    PROPS: 'props',
    MAP: 'map'
} as const

type LocationSourceType = typeof LocationSource[keyof typeof LocationSource]

const locationChangeEvent = ref<{
    location: MapLocation,
    locationSource: LocationSourceType
}>(
    {
        location: locationFromProps.value,
        locationSource: LocationSource.PROPS
    }
)
// 监控props.location的变化
watch(locationFromProps, (newLocation) => {
    locationChangeEvent.value = {
        location: newLocation,
        locationSource: LocationSource.PROPS
    }
})

// 监控地图中拖动marker导致location的变化
watch(locationFromMap, (newLocation) => {
    locationChangeEvent.value = {
        location: newLocation,
        locationSource: LocationSource.MAP
    }
})


onMounted(async () => {
    // 处理location的变化
    watch(locationChangeEvent, (newLocationEvent) => {
        // 如果location是从props传入的，则需要更新地图的中心位置和marker的位置
        if (newLocationEvent.locationSource === LocationSource.PROPS) {
            map.setCenter([newLocationEvent.location.longitude, newLocationEvent.location.latitude])
            marker.setPosition([newLocationEvent.location.longitude, newLocationEvent.location.latitude])
        }
        AMap.plugin('AMap.Geocoder', function () {
            const geocoder = new $amap.Geocoder()
            geocoder.getAddress([newLocationEvent.location.longitude, newLocationEvent.location.latitude], (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    if (newLocationEvent.locationSource === LocationSource.PROPS) {
                        // 如果location是从props传入的，则只更新locationName，因为外面的locationName已经是最新的了
                        emits('update:locationName', result.regeocode.formattedAddress as string)
                    } else {
                        // 如果location是从地图中拖动marker导致的，则更新location和locationName
                        emits('update:location', newLocationEvent.location)
                        emits('update:locationName', result.regeocode.formattedAddress as string)
                    }
                }
            })
        })
    }, { deep: true })

    const location = await getCurrentLocation() as GeolocationPosition

    const map = new $amap.Map('map-container', {
        zoom: 12,
        center: [location.coords.longitude, location.coords.latitude],
    })

    const marker = new $amap.Marker({
        position: [location.coords.longitude, location.coords.latitude],
        map: map,
        draggable: true,
    })

    marker.on('dragend', (e) => {
        locationChangeEvent.value = {
            location: {
                longitude: e.lnglat.lng,
                latitude: e.lnglat.lat
            },
            locationSource: LocationSource.MAP
        }
    })


    $amap.plugin('AMap.Geolocation', () => {
        const geolocation = new $amap.Geolocation({
            enableHighAccuracy: true, // 高精度定位
            buttonPosition: 'RB', // 右下角
            showMarker: true, // 显示定位标记
            showCircle: true, // 显示定位精度圈
        })
        map.addControl(geolocation)

        // 点击定位按钮事件
        geolocation.on('complete', (data: any) => {
            const pos = {
                longitude: data.position.lng,
                latitude: data.position.lat
            }
            emits('update:location', pos)
            emits('update:locationName', data.formattedAddress)
        })
    })

    locationChangeEvent.value = {
        location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        },
        locationSource: LocationSource.MAP
    }


})
</script>

<style scoped>
.map-container {
    height: 100%;
}
</style>