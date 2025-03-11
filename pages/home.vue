<template>
    <div class="home-container">
        <!-- 地图区域 -->
        <div class="map-container">
            <MapBundle :location="currentLocation" :location-name="currentLocationName"
                @update:location="onUpdateLocation" @update:location-name="onUpdateLocationName" />
        </div>

        <!-- 侧栏切换按钮 -->
        <div class="sidebar-toggle" :class="{ 'sidebar-hidden': !showSidebar }" @click="toggleSidebar">
            <el-icon :size="24" class="toggle-icon">
                <el-icon-d-arrow-right v-if="showSidebar" />
                <el-icon-d-arrow-left v-else />
            </el-icon>
        </div>

        <!-- 侧边栏 -->
        <div class="sidebar-container" :class="{ 'sidebar-hidden': !showSidebar }">
            <el-scrollbar class="sidebar-scrollbar">
                <UserBundle :location="currentLocation" :location-name="currentLocationName"
                    @update:location="onUpdateLocation" />
                <GroupBundle :location="currentLocation" :location-name="currentLocationName" />
            </el-scrollbar>
        </div>
    </div>
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

// 侧栏显示状态
const showSidebar = ref(true)

// 切换侧栏显示/隐藏
function toggleSidebar() {
    showSidebar.value = !showSidebar.value
}
</script>

<style scoped>
.home-container {
    position: fixed;
    /* 改用fixed定位确保充满整个视口 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.map-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

/* 基础样式 */
.sidebar-container {
    position: absolute;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    transition: transform 0.3s ease;
    z-index: 10;
    overflow: hidden;
}

.sidebar-scrollbar {
    height: 100%;
    padding: 0px;
}

/* 默认左右布局 */
@media (min-width: 1251px) {
    .sidebar-container {
        top: 0;
        right: 0;
        min-width: 500px;
        width: 20%;
        height: 100%;
        border-left: 1px solid #e0e0e0;
    }

    .sidebar-container.sidebar-hidden {
        transform: translateX(100%);
    }

    .sidebar-toggle {
        top: 50%;
        transform: translateY(-50%);
        right: max(20%, 500px); /* 使用min()函数确保按钮位置与sidebar实际宽度一致 */
        border-radius: 4px 0 0 4px;
        border-right: none;
    }

    .sidebar-toggle.sidebar-hidden {
        right: 0;
    }

    .toggle-icon {
        transform: rotate(0deg);
    }
}

/* 上下布局 */
@media (max-width: 1250px) {
    .sidebar-container {
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        min-width: 0;
        height: 40%;
        border-top: 1px solid #e0e0e0;
    }

    .sidebar-container.sidebar-hidden {
        transform: translateY(100%);
    }

    .sidebar-toggle {
        bottom: 40%;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 32px;
        border-radius: 4px 4px 0 0;
        border-bottom: none;
    }

    .sidebar-toggle.sidebar-hidden {
        bottom: 0;
    }

    .toggle-icon {
        transform: rotate(90deg);
    }

    .sidebar-toggle.sidebar-hidden .toggle-icon {
        transform: rotate(90deg);
    }
}

/* 侧栏切换按钮样式 */
.sidebar-toggle {
    position: fixed; /* 改为 fixed 定位，确保按钮始终相对于视口定位 */
    width: 32px; /* 固定宽度 */
    height: 60px; /* 固定高度 */
    z-index: 100;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

</style>