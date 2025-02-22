<template>
    <el-container class="h-screen">
        <!-- 地图区域 (占70%) -->
        <el-main class="p-0 h-screen">
            <MapBundle :location="currentLocation" :location-name="currentLocationName"
                @update:location="onUpdateLocation" @update:location-name="onUpdateLocationName" />
        </el-main>
        <!-- 侧边栏 (占30%) -->
        <el-aside width="30%" class="border-l bg-gray-50">
            <el-scrollbar class="h-full p-4">
                <el-form label-width="100px">
                    <el-form-item label="经度">
                        <el-input v-model="form.longitude" v-on:blur="onBlurLongitude" placeholder="请输入经度" />
                    </el-form-item>
                    <el-form-item label="纬度">
                        <el-input v-model="form.latitude" v-on:blur="onBlurLatitude" placeholder="请输入纬度" />
                    </el-form-item>
                </el-form>
                <!-- 用户信息 -->
                <el-card class="mb-4">
                    <div class="flex items-center gap-">
                        <el-avatar :size="50"
                            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                        <div class="flex-1">
                            <h3 class="font-bold">用户名</h3>
                            <p class="text-gray-500 text-sm">user@example.com</p>
                        </div>
                        <el-dropdown class="flex-1">
                            <el-text>
                                {{ currentLocationName }}
                            </el-text>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        {{ currentLocation }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <el-button type="primary" circle>
                            <el-icon>
                                <Setting />
                            </el-icon>
                        </el-button>
                    </div>
                </el-card>

                <!-- 群组搜索 -->
                <el-card class="mb-4">
                    <el-input placeholder="搜索群组">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </el-card>

                <!-- 群组列表 -->
                <el-card>
                    <div class="space-y-3">
                        <div v-for="i in 5" :key="i" class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                            <el-avatar :size="40" shape="square" />
                            <div>
                                <h4 class="font-medium">群组 {{ i }}</h4>
                                <p class="text-sm text-gray-500">成员 {{ i * 3 }} 人</p>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-scrollbar>
        </el-aside>
    </el-container>
</template>

<script setup lang="ts">
import { Search, Setting } from '@element-plus/icons-vue'
import type { MapLocation } from '~/types'
const currentLocation = ref<MapLocation>({
    longitude: 112.69167,
    latitude: 35.148894
})
const currentLocationName = ref('旮旯')
function onUpdateLocation(location: MapLocation) {
    currentLocation.value = location
    form.value.longitude = location.longitude
    form.value.latitude = location.latitude
}
function onUpdateLocationName(locationName: string) {
    currentLocationName.value = locationName
}
const form = ref({
    longitude: 112.69167,
    latitude: 35.148894,
    locationName: '旮旯'
})
function onBlurLongitude(e: Event) {
    currentLocation.value.longitude = form.value.longitude;
}
function onBlurLatitude(e: Event) {
    currentLocation.value.latitude = form.value.latitude;
}

</script>