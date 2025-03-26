<template>
    <PageContainer>
        <!-- 顶部信息栏 -->
        <TopInfoBar :location-name="currentLocationName" @user-click="dialogs.userProfile = true" class="home-page-top-bar" />

        <!-- 地图区域 -->
        <MapBundle :location="currentLocation" :location-name="currentLocationName" @update:location="onUpdateLocation"
            @update:location-name="onUpdateLocationName" />

        <!-- 地图控制组件 -->
        <MapControls @control="controlMap" />

        <!-- 创建活动按钮 -->
        <CreateActivityButton @click="dialogs.createActivity = true" />

        <!-- 近期活动卡片 -->
        <ActivitySidebar v-model="showRecentActivities" :tabs="tabs">
            <template #activities="{ data }">
                <ActivityList :activities="recentActivities" :loading="activity.isLoading.activities"
                    :error="activity.error.activities" empty-text="附近暂无活动，来创建第一个活动吧！"
                    @activity-click="viewActivityDetails" />
            </template>
            <template #users="{ data }">
                <ActivityList :activities="nearbyUsers" :loading="activity.isLoading.users"
                    :error="activity.error.users" empty-text="附近暂无用户，邀请好友加入吧！" @activity-click="viewUserDetails" />
            </template>
            <template #groups="{ data }">
                <ActivityList :activities="nearbyGroups" :loading="activity.isLoading.groups"
                    :error="activity.error.groups" empty-text="附近暂无群组，创建第一个群组吧！" @activity-click="viewGroupDetails" />
            </template>
        </ActivitySidebar>

        <!-- 悬浮菜单按钮 -->
        <FloatingMenu :items="menuItems" :initial-x="menuPosition.x" :initial-y="menuPosition.y"
            @menu-item-click="handleMenuItemClick" />

        <!-- 首次使用提示 -->
        <div v-if="showFloatingMenuTip" class="floating-menu-tip">
            <div class="tip-content">
                <p>长按悬浮按钮可以拖动位置</p>
                <el-button size="small" @click="dismissFloatingMenuTip">知道了</el-button>
            </div>
        </div>

        <!-- 各功能模块的弹窗 -->
        <!-- 用户信息弹窗 -->
        <el-dialog v-model="dialogs.userProfile" title="个人信息" width="90%" class="user-dialog"
            :modal-append-to-body="false" :append-to-body="true" center>
            <UserBundle :location="currentLocation" :location-name="currentLocationName"
                @update:location="onUpdateLocation" />
        </el-dialog>

        <!-- 群组功能弹窗 -->
        <el-dialog v-model="dialogs.groupManager" title="群组" width="90%" class="group-dialog"
            :modal-append-to-body="false" :append-to-body="true" center>
            <GroupBundle :location="currentLocation" :location-name="currentLocationName" />
        </el-dialog>

        <!-- 位置信息弹窗 -->
        <el-dialog v-model="dialogs.locationInfo" title="位置信息" width="90%" class="location-dialog"
            :modal-append-to-body="false" :append-to-body="true" center>
            <div class="location-info-content">
                <div class="location-coordinates">
                    <p><span>当前位置：</span>{{ currentLocationName }}</p>
                    <p><span>经度：</span>{{ currentLocation.longitude.toFixed(6) }}</p>
                    <p><span>纬度：</span>{{ currentLocation.latitude.toFixed(6) }}</p>
                </div>
                <el-button type="primary" @click="reloadCurrentPosition" class="reload-location-btn">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                    重新定位
                </el-button>
            </div>
        </el-dialog>

        <!-- 创建活动弹窗 -->
        <el-dialog v-model="dialogs.createActivity" title="发布新动态" width="90%" class="activity-dialog"
            :modal-append-to-body="false" :append-to-body="true" center>
            <el-form :model="activityForm" class="activity-form">
                <el-form-item label="动态类型">
                    <el-select v-model="activityForm.type" placeholder="选择动态类型">
                        <el-option label="签到" value="签到" />
                        <el-option label="求助" value="求助" />
                        <el-option label="分享" value="分享" />
                        <el-option label="活动" value="活动" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
                <el-form-item label="动态内容">
                    <el-input v-model="activityForm.details" type="textarea" placeholder="分享你的想法..." :rows="4" />
                </el-form-item>
                <el-form-item label="当前位置">
                    <div class="location-preview">
                        <el-icon>
                            <Location />
                        </el-icon>
                        <span>{{ currentLocationName || '未知位置' }}</span>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogs.createActivity = false">取消</el-button>
                    <el-button type="primary" @click="submitActivity" :loading="activity.isLoading.create">
                        发布
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, reactive, markRaw, nextTick } from 'vue'
import {
    Plus, Location, User, ChatRound, Refresh, Setting, Close,
    Search, Management
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useActivity } from '~/composables/useActivity'
import PageContainer from '~/components/layout/PageContainer/PageContainer.vue'
import TopInfoBar from '~/components/layout/Navbar/TopInfoBar.vue'
import MapControls from '~/components/features/map/MapControls.vue'
import MapBundle from '~/components/MapBundle.vue'
import CreateActivityButton from '~/components/features/activity/CreateActivityButton.vue'
import ActivitySidebar from '~/components/layout/Sidebar/ActivitySidebar.vue'
import ActivityList from '~/components/features/activity/ActivityList.vue'
import FloatingMenu from '~/components/layout/FloatMenu/FloatingMenu.vue'
import type { NearbyUser, UserActivity } from '~/types/activity_type'
import type { NearbyGroup } from '~/types/group_type'
import { useMapStore } from '~/stores/map'
import type { MapLocation } from '~/types/map_type'

// 获取路由器实例
const router = useRouter()

// 使用地图存储
const mapStore = useMapStore()

// 默认位置
const defaultLocation: MapLocation = {
    latitude: 39.9042,
    longitude: 116.4074
}

// 位置和地址状态
const currentLocation = ref<MapLocation>(defaultLocation)
const currentLocationName = ref('加载中...')

// 直接使用 useActivity composable
const activity = useActivity()
const { nearbyUsers, recentActivities, nearbyGroups, fetchNearbyUsers, fetchRecentActivities, fetchNearbyGroups, error } = activity

// 监听位置变化
watch(currentLocation, async (newLocation) => {
    if (newLocation) {
        await Promise.all([
            fetchNearbyUsers(newLocation, 5000, 20),
            fetchRecentActivities(newLocation, 5000, 20),
            fetchNearbyGroups(newLocation)
        ])
    }
})

// 加载页面数据
onMounted(async () => {
    // 尝试从 mapStore 获取上次保存的位置
    const savedLocation = mapStore.getLastLocation()
    
    // 如果存在已保存的位置，则更新当前位置
    if (savedLocation) {
        currentLocation.value = savedLocation
        // 地址名称会稍后更新，先设置为加载中状态
        currentLocationName.value = '获取中...'
    } else {
        // 如果没有保存的位置，尝试获取当前位置
        getCurrentPosition()
    }

    // 初始化加载当前位置的数据
    await Promise.all([
        fetchNearbyUsers(currentLocation.value, 5000, 20),
        fetchRecentActivities(currentLocation.value, 5000, 20),
        fetchNearbyGroups(currentLocation.value)
    ])

    // 在客户端环境中更新位置
    menuPosition.x = window.innerWidth - 80
    menuPosition.y = window.innerHeight - 80

    // 检查localStorage是否已经关闭过提示
    if (process.client) {
        const tipDismissed = localStorage.getItem('floatingMenuTipDismissed')
        if (tipDismissed === 'true') {
            showFloatingMenuTip.value = false
        }
    }
})

// 弹窗状态
const dialogs = reactive({
    userProfile: false,
    groupManager: false,
    locationInfo: false,
    settings: false,
    createActivity: false
})

// 近期活动状态
const showRecentActivities = ref(true)

// 活动表单
const activityForm = reactive({
    type: '签到',
    details: ''
})

// 定义菜单位置和项目
const menuPosition = reactive({
    x: 0,
    y: 0
})

// 定义MenuItem接口
interface MenuItem {
    id: string
    label: string
    icon: any
    action?: () => void
}

// 悬浮菜单提示
const showFloatingMenuTip = ref(true)

// 关闭悬浮菜单提示
const dismissFloatingMenuTip = () => {
    showFloatingMenuTip.value = false
    // 保存到localStorage，避免重复显示
    if (process.client) {
        localStorage.setItem('floatingMenuTipDismissed', 'true')
    }
}

// 重新加载当前位置
const reloadCurrentPosition = async () => {
    try {
        // 重新获取位置
        await Promise.all([
            fetchNearbyUsers(currentLocation.value, 5000, 20),
            fetchRecentActivities(currentLocation.value, 5000, 20),
            fetchNearbyGroups(currentLocation.value)
        ])
        ElMessage.success('位置信息已更新')
    } catch (err) {
        console.error('更新位置失败', err)
        ElMessage.error('位置更新失败')
    }
}

// 定义菜单项
const menuItems = ref<MenuItem[]>([
    { id: 'user', label: '个人', icon: markRaw(User), action: () => dialogs.userProfile = true },
    { id: 'chat', label: '消息', icon: markRaw(ChatRound), action: () => router.push('/chat') },
    { id: 'location', label: '位置', icon: markRaw(Location), action: () => dialogs.locationInfo = true },
    { id: 'groupSearch', label: '搜群', icon: markRaw(Search), action: () => handleOpenGroupManager('search') },
    { id: 'groupCreate', label: '建群', icon: markRaw(Management), action: () => handleOpenGroupManager('create') },
    { id: 'refresh', label: '刷新', icon: markRaw(Refresh), action: reloadCurrentPosition },
    { id: 'settings', label: '设置', icon: markRaw(Setting), action: () => dialogs.settings = true }
])

// 处理FloatingMenu的点击事件
const handleMenuItemClick = (item: MenuItem) => {
    if (typeof item.action === 'function') {
        item.action()
    }
}

// 定义图标映射
const iconMap: Record<string, any> = {
    User: markRaw(User),
    ChatRound: markRaw(ChatRound),
    Location: markRaw(Location),
    Refresh: markRaw(Refresh),
    Setting: markRaw(Setting),
    Search: markRaw(Search),
    Management: markRaw(Management)
}

// 地图控制
const controlMap = (action: string) => {
    switch (action) {
        case 'zoomIn':
            // 放大地图
            const mapContainer = document.getElementById('map-container')
            if (mapContainer) {
                // 尝试通过自定义事件触发地图缩放
                mapContainer.dispatchEvent(new CustomEvent('map:zoomIn'))
            } else {
                ElMessage.warning('地图组件尚未加载完成')
            }
            break
        case 'zoomOut':
            // 缩小地图
            const mapContainerOut = document.getElementById('map-container')
            if (mapContainerOut) {
                mapContainerOut.dispatchEvent(new CustomEvent('map:zoomOut'))
            } else {
                ElMessage.warning('地图组件尚未加载完成')
            }
            break
        case 'locateMe':
            // 定位到当前位置，并通知地图组件更新中心
            const mapContainerCenter = document.getElementById('map-container')
            if (mapContainerCenter) {
                // 先发送事件通知地图组件准备更新中心
                mapContainerCenter.dispatchEvent(new CustomEvent('map:centerToCurrentLocation'))
            }
            // 然后获取当前位置
            getCurrentPosition()
            break
        default:
            console.warn(`未知的地图控制操作: ${action}`)
    }
}

// 位置更新处理
const onUpdateLocation = (loc: MapLocation) => {
    currentLocation.value = loc
}

// 位置名称更新处理
const onUpdateLocationName = (name: string) => {
    currentLocationName.value = name
}

// 获取当前位置
function getCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                // 更新位置
                currentLocation.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
                // 地址名称由MapBundle组件处理
                currentLocationName.value = '获取中...'

                // 通知地图组件更新中心位置
                const mapContainer = document.getElementById('map-container')
                if (mapContainer) {
                    // 确保地图中心跟随位置更新
                    mapContainer.dispatchEvent(new CustomEvent('map:centerToCurrentLocation'))
                }

                // 获取位置成功提示
                ElMessage.success('已定位到当前位置')
            },
            error => {
                console.error('获取位置失败:', error)
                ElMessage.warning('无法获取您的位置，将使用默认位置')
                // 使用默认位置
                currentLocationName.value = '默认位置'
            }
        )
    } else {
        ElMessage.error('您的浏览器不支持地理定位')
        currentLocationName.value = '未知位置'
    }
}

// 查看群组详情
const viewGroupDetails = (groupId: string) => {
    router.push(`/group/${groupId}`)
}

// 提交活动
const submitActivity = async () => {
    if (!activityForm.type) {
        ElMessage.warning('请选择活动类型')
        return
    }

    try {
        await activity.createActivity(
            currentLocation.value,
            activityForm.type,
            activityForm.details
        )
        ElMessage.success('活动发布成功')
        dialogs.createActivity = false
        // 清空表单
        activityForm.details = ''
        // 刷新活动列表
        await fetchRecentActivities(currentLocation.value, 5000, 20)
    } catch (err) {
        console.error('发布活动失败', err)
        ElMessage.error('发布失败，请重试')
    }
}

// 查看活动详情
const viewActivityDetails = (activityId: string) => {
    router.push(`/activity/${activityId}`)
}

// 查看用户详情
const viewUserDetails = (userId: string) => {
    router.push(`/user/${userId}`)
}

// 定义侧边栏选项卡
const tabs = [
    { name: 'activities', label: '动态', data: recentActivities },
    { name: 'users', label: '用户', data: nearbyUsers },
    { name: 'groups', label: '群组', data: nearbyGroups }
]

// 处理打开群组管理器
const handleOpenGroupManager = (tab: 'search' | 'create') => {
    dialogs.groupManager = true
    
    // 在下一个微任务循环中获取GroupBundle组件并执行相应操作
    nextTick(() => {
        const groupBundle = document.querySelector('.group-dialog')
        if (groupBundle) {
            if (tab === 'create') {
                // 直接打开创建群组对话框
                const createButton = groupBundle.querySelector('.create-button') as HTMLElement
                if (createButton) {
                    createButton.click()
                }
            } else if (tab === 'search') {
                // 聚焦到搜索输入框
                const searchInput = groupBundle.querySelector('.search-container input') as HTMLInputElement
                if (searchInput) {
                    searchInput.focus()
                }
            }
        }
    })
}
</script>

<style lang="scss">
@use '~/assets/scss/pages/home';

.floating-menu-tip {
  position: fixed;
  bottom: 180px;
  right: 20px;
  z-index: 1000;
  
  .tip-content {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    max-width: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    p {
      margin: 0;
      text-align: center;
      font-size: 14px;
    }
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 30px;
    border-width: 10px 10px 0;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.7) transparent transparent;
  }
}
</style>