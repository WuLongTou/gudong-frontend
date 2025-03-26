<template>
    <div id="map-container" class="map-container">
        <!-- 右键/长按菜单 -->
        <Teleport to="body">
            <div v-if="showContextMenu" class="map-context-menu" :style="contextMenuStyle">
                <div class="menu-item" @click="handleMenuClick">
                    <el-icon>
                        <Location />
                    </el-icon>
                    <span>设为当前位置</span>
                </div>
            </div>
        </Teleport>

        <!-- 功能提示 -->
        <div v-if="!hasShownTip" class="map-tip">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            <span>长按或右键点击地图可设置位置</span>
            <el-button class="tip-button" size="small" type="primary" text @click="dismissTip">知道了</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Location, InfoFilled } from '@element-plus/icons-vue'
import type { MapLocation } from '~/types/map_type'
import { useMapStore } from '~/stores/map'

defineOptions({
  name: 'MapBundle'
})

const { $amap } = useNuxtApp()

const emits = defineEmits<{
    'update:location': [MapLocation]
    'update:locationName': [string]
}>()

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

// 使用pinia store
const mapStore = useMapStore()

// 是否已显示过提示
const hasShownTip = ref(mapStore.getHasShownTip())

// 右键菜单相关状态
const showContextMenu = ref(false)
const contextMenuPosition = ref<MapLocation>({ longitude: 0, latitude: 0 })
const contextMenuStyle = ref({
    left: '0',
    top: '0'
})

// 存放props.location的值
const locationFromProps = toRef(props, 'location')
// 存放地图中拖动marker导致location的变化
const locationFromMap = ref<MapLocation>(locationFromProps.value)

// 监控props.location的变化
watch(locationFromProps, (newLocation) => {
    locationFromMap.value = newLocation
})

// 监控地图中拖动marker导致location的变化
watch(locationFromMap, (newLocation) => {
    emits('update:location', newLocation)
    mapStore.saveLocation(newLocation)
})

// 关闭提示
const dismissTip = () => {
    hasShownTip.value = true
    mapStore.markTipAsShown()
}

// 右键菜单点击后移动位置
const moveToClickPosition = () => {
    console.log('moveToClickPosition')
    try {
        const newPosition = { ...contextMenuPosition.value }

        // 更新位置
        locationFromMap.value = newPosition

        // 更新地图中心点和标记位置
        map.setCenter([newPosition.longitude, newPosition.latitude])
        marker.setPosition([newPosition.longitude, newPosition.latitude])

        // 隐藏菜单
        closeContextMenu()

        // 恢复地图拖动
        map.setStatus({ dragEnable: true })
    } catch (error) {
        console.error('移动位置失败:', error)
    }
}

// 监听点击事件关闭右键菜单
const closeContextMenu = () => {
    showContextMenu.value = false
}

let map: any
let marker: any

// 处理菜单点击
const handleMenuClick = () => {
    moveToClickPosition()
    // 添加触感反馈
    if (navigator.vibrate) {
        navigator.vibrate(30)
    }
}

// 设置地图交互事件
const setupMapInteractions = () => {
    if (!map) {
        console.error('地图未初始化，无法设置交互事件')
        return
    }

    let longPressTimer: number | null = null
    let isTouching = false

    const handleLongPress = (e: TouchEvent) => {
        const touch = e.touches[0]
        const pixel = new $amap.Pixel(touch.clientX, touch.clientY)
        const lnglat = map.containerToLngLat(pixel)

        contextMenuPosition.value = {
            longitude: lnglat.lng,
            latitude: lnglat.lat
        }

        // 计算菜单位置，确保在屏幕内
        const menuWidth = 150
        const menuHeight = 45
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight

        let left = touch.clientX
        let top = touch.clientY

        if (left + menuWidth > screenWidth) {
            left = screenWidth - menuWidth - 10
        }
        if (top + menuHeight > screenHeight) {
            top = screenHeight - menuHeight - 10
        }

        contextMenuStyle.value = {
            left: left + 'px',
            top: top + 'px'
        }

        showContextMenu.value = true
        map.setStatus({ dragEnable: false })

        // 触感反馈
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    // PC端右键菜单
    map.on('rightclick', (e: any) => {
        if (e.originEvent) {
            e.originEvent.preventDefault()
        }

        contextMenuPosition.value = {
            longitude: e.lnglat.lng,
            latitude: e.lnglat.lat
        }

        contextMenuStyle.value = {
            left: e.pixel.x + 'px',
            top: e.pixel.y + 'px'
        }

        showContextMenu.value = true
    })

    // 触摸开始
    map.getContainer().addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length !== 1) return

        isTouching = true
        longPressTimer = window.setTimeout(() => {
            if (isTouching) {
                handleLongPress(e)
            }
        }, 500)
    }, { passive: true })

    // 触摸移动
    map.getContainer().addEventListener('touchmove', () => {
        isTouching = false
        if (longPressTimer) {
            clearTimeout(longPressTimer)
            longPressTimer = null
        }
    }, { passive: true })

    // 触摸结束
    map.getContainer().addEventListener('touchend', () => {
        isTouching = false
        if (longPressTimer) {
            clearTimeout(longPressTimer)
            longPressTimer = null
        }
    }, { passive: true })

    // 触摸取消
    map.getContainer().addEventListener('touchcancel', () => {
        isTouching = false
        if (longPressTimer) {
            clearTimeout(longPressTimer)
            longPressTimer = null
        }
    }, { passive: true })

    // 点击时关闭菜单
    const handleClick = () => {
        if (showContextMenu.value) {
            closeContextMenu()
            map.setStatus({ dragEnable: true })
        }
    }

    map.on('click', handleClick)
    document.addEventListener('click', handleClick)

    // 在组件卸载时清理
    onUnmounted(() => {
        document.removeEventListener('click', handleClick)
        map.off('click', handleClick)
    })
}

// 定义事件处理函数
const handleZoomIn = () => {
    if (map) {
        map.zoomIn()
    }
}

const handleZoomOut = () => {
    if (map) {
        map.zoomOut()
    }
}

// 处理地图中心与当前位置同步
const handleCenterToCurrentLocation = () => {
    console.log('准备将地图中心设置为当前位置')
    // 标记需要居中显示
    shouldCenterOnNextLocationUpdate.value = true
}

// 标记是否需要在下次位置更新时居中显示
const shouldCenterOnNextLocationUpdate = ref(false)

// 更新地图中心到当前位置
const updateMapCenter = (location: MapLocation) => {
    if (map && marker) {
        console.log('更新地图中心:', location)
        map.setCenter([location.longitude, location.latitude])
        marker.setPosition([location.longitude, location.latitude])
    }
}

// 监听位置变化，更新地图中心
watch(locationFromProps, (newLocation) => {
    // 如果标记了需要居中显示，或者是初始加载时，则更新地图中心
    if (shouldCenterOnNextLocationUpdate.value) {
        updateMapCenter(newLocation)
        shouldCenterOnNextLocationUpdate.value = false
    }
})

onMounted(async () => {
    // 检查提示状态不需要了，已通过pinia store获取
    try {
        // 尝试从pinia store获取上次保存的位置
        const savedLocation = mapStore.getLastLocation()

        // 获取初始化位置 - 优先使用保存的位置，其次使用当前地理位置
        let initialLocation: MapLocation
        if (savedLocation) {
            initialLocation = savedLocation
        } else {
            const geolocation = await getCurrentLocation() as GeolocationPosition
            initialLocation = {
                longitude: geolocation.coords.longitude,
                latitude: geolocation.coords.latitude
            }
        }

        map = new $amap.Map('map-container', {
            zoom: 15,
            center: [initialLocation.longitude, initialLocation.latitude],
        })

        marker = new $amap.Marker({
            position: [initialLocation.longitude, initialLocation.latitude],
            map: map,
            draggable: true,
        })
        
        // 添加地图控制自定义事件监听
        const mapContainer = document.getElementById('map-container')
        if (mapContainer) {
            // 缩放地图监听 - 使用命名函数便于后续移除
            mapContainer.addEventListener('map:zoomIn', handleZoomIn)
            mapContainer.addEventListener('map:zoomOut', handleZoomOut)
            // 添加地图中心与位置同步事件
            mapContainer.addEventListener('map:centerToCurrentLocation', handleCenterToCurrentLocation)
        }

        // 发出初始位置更新
        if (savedLocation) {
            emits('update:location', savedLocation)
        }

        marker.on('dragend', (e: { lnglat: { lng: number; lat: number } }) => {
            const position = {
                longitude: e.lnglat.lng,
                latitude: e.lnglat.lat
            }
            locationFromMap.value = position
            mapStore.saveLocation(position)
        })

        // 处理地图交互事件 - 确保在map初始化后调用
        setupMapInteractions()

        $amap.plugin('AMap.Geolocation', () => {
            const geolocation = new $amap.Geolocation({
                enableHighAccuracy: true, // 高精度定位
                buttonPosition: 'LB', // 左下角
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
                locationFromMap.value = pos
                emits('update:location', pos)
                emits('update:locationName', data.formattedAddress)
                mapStore.saveLocation(pos)

                // 更新地图中心点和标记位置
                map.setCenter([pos.longitude, pos.latitude])
                marker.setPosition([pos.longitude, pos.latitude])
            })
        })

        // 使用Geocoder获取地址
        $amap.plugin('AMap.Geocoder', function () {
            const geocoder = new $amap.Geocoder()

            // 如果有保存的位置，获取其地址
            if (savedLocation) {
                geocoder.getAddress([savedLocation.longitude, savedLocation.latitude], (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        emits('update:locationName', result.regeocode.formattedAddress as string)
                    }
                })
            }

            // 监听位置变化，更新地址
            watch(locationFromMap, (newLocation) => {
                geocoder.getAddress([newLocation.longitude, newLocation.latitude], (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        emits('update:locationName', result.regeocode.formattedAddress as string)
                    }
                })
            })
        })
    } catch (error) {
        console.error('地图初始化失败:', error)
    }
})

onUnmounted(() => {
    // 移除事件监听
    document.removeEventListener('click', () => {
        if (showContextMenu.value) {
            closeContextMenu()
            map.setStatus({ dragEnable: true })
        }
    })

    if (map) {
        // 移除地图点击事件
        map.off('click', () => {
            if (showContextMenu.value) {
                closeContextMenu()
                map.setStatus({ dragEnable: true })
            }
        })
    }
    
    // 移除地图控制自定义事件监听
    const mapContainer = document.getElementById('map-container')
    if (mapContainer) {
        // 使用相同的命名函数移除事件监听器
        mapContainer.removeEventListener('map:zoomIn', handleZoomIn)
        mapContainer.removeEventListener('map:zoomOut', handleZoomOut)
        mapContainer.removeEventListener('map:centerToCurrentLocation', handleCenterToCurrentLocation)
    }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.map-context-menu {
    position: absolute;
    z-index: 999;
    background-color: v.$background-color-white;
    border-radius: v.$border-radius-lg;
    box-shadow: v.$shadow-lg;
    padding: v.$space-xs 0;
    min-width: 10rem;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    animation: menu-fade-in 0.25s cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: top center;
    border: 1px solid v.$border-color-light;
}

.menu-item {
    padding: v.$space-md;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: v.$space-md;
    font-size: v.$font-size-md;
    color: v.$text-color-primary;
    transition: all 0.2s;
    
    .el-icon {
        color: v.$primary-color;
        font-size: v.$font-size-lg;
        flex-shrink: 0;
    }
    
    &:hover {
        background-color: rgba(v.$primary-color, 0.05);
    }
    
    &:active {
        background-color: rgba(v.$primary-color, 0.1);
        transform: scale(0.98);
    }
}

@keyframes menu-fade-in {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.map-tip {
    position: absolute;
    top: v.$space-md;
    left: 50%;
    transform: translateX(-50%);
    background-color: v.$background-color-white;
    color: v.$text-color-primary;
    padding: v.$space-sm v.$space-md;
    border-radius: v.$border-radius-lg;
    font-size: v.$font-size-md;
    display: flex;
    align-items: center;
    gap: v.$space-sm;
    z-index: 998;
    animation: fade-in 0.3s ease-in-out;
    box-shadow: v.$shadow-md;
    max-width: 90%;
    
    .tip-icon {
        color: v.$primary-color;
        font-size: v.$font-size-lg;
        flex-shrink: 0;
    }
    
    span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tip-button {
        font-size: v.$font-size-sm;
        padding: v.$space-xs v.$space-sm;
        color: v.$primary-color;
        
        &:hover {
            background-color: rgba(7, 193, 96, 0.1);
        }
        
        &:active {
            background-color: rgba(7, 193, 96, 0.2);
        }
    }
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

@include m.mobile {
    .map-context-menu {
        min-width: 9rem;
        border-radius: v.$border-radius-md;
    }

    .menu-item {
        padding: v.$space-sm v.$space-md;
    }

    .map-tip {
        width: 85%;
        max-width: 20rem;
    }
} 
</style>