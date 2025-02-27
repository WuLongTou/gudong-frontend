<template>
    <el-container class="h-screen">
        <!-- 地图区域 (占70%) -->
        <el-main width="80%" class="!p-2 h-screen">
            <MapBundle :location="currentLocation" :location-name="currentLocationName"
                @update:location="onUpdateLocation" @update:location-name="onUpdateLocationName" />
        </el-main>
        <!-- 侧边栏 (占30%) -->
        <el-aside width="20%" class="border-l bg-gray-50">
            <el-scrollbar class="h-full p-2">
                <UserBundle :location="currentLocation" :location-name="currentLocationName"
                    @update:location="onUpdateLocation" />
                <GroupBundle :location="currentLocation" :location-name="currentLocationName" />
            </el-scrollbar>
        </el-aside>
    </el-container>
</template>

<script setup lang="ts">
import type { MapLocation } from '~/types'

// 既然vue会自动比较值是否变化，所以MapBundle和UserBundle的Location就共用一个变量也不会导致无限更新
const currentLocation = ref<MapLocation>({
    longitude: 112.69167,
    latitude: 35.148894
})
const currentLocationName = ref('旮旯')
function onUpdateLocation(location: MapLocation) {
    currentLocation.value = location
}
function onUpdateLocationName(locationName: string) {
    currentLocationName.value = locationName
}
</script>