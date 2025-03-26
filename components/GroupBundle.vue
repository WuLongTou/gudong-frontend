<template>
    <el-tabs v-model="activeTabValue" class="group-tabs">
        <el-tab-pane label="搜索群组" name="search">
            <!-- 群组搜索 -->
            <el-card class="group-card">
                <div class="search-container">
                    <el-input v-model="wantedGroupName" placeholder="输入你想搜索的群组吧" @keyup.enter="handleSearch" clearable>
                        <template #append>
                            <el-button type="primary" @click="handleSearch" :loading="searching">
                                <el-icon>
                                    <Search />
                                </el-icon>
                                搜索
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </el-card>

            <!-- 群组列表 -->
            <el-card class="mt-4">
                <div class="group-list-container">
                    <div class="group-list-title">
                        附近群组列表
                    </div>
                    <GroupList :groups="groupsNearby" :show-join-button="true" @join="handleJoinGroup" show-scroll />
                </div>
            </el-card>
        </el-tab-pane>

        <el-tab-pane label="创建群组" name="create">
            <!-- 创建群组表单 -->
            <el-card class="group-card">
                <el-form :model="dialogForm" label-width="5rem">
                    <el-form-item label="群组名称" required>
                        <el-input v-model="dialogForm.name" placeholder="请输入群组名称" clearable />
                    </el-form-item>
                    <el-form-item label="当前位置">
                        <el-input :model-value="locationName" readonly />
                        <div class="group-location-info">
                            坐标：{{ location.latitude.toFixed(4) }}, {{ location.longitude.toFixed(4) }}
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleCreateGroup" class="create-button">创建群组</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-tab-pane>
    </el-tabs>

    <!-- 搜索结果弹窗 -->
    <el-dialog v-model="showResults" title="搜索结果" :modal="true" class="search-dialog" center>
        <GroupList :groups="searchResults" :loading="searching" :show-join-button="true" show-scroll
            @join="handleJoinGroup" />
        <div v-if="searchResults.length === 0 && !searching" class="empty-result">
            没有找到相关群组
        </div>
    </el-dialog>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { GroupInfo, JoinGroupResponse } from '~/types/group_type';
import type { MapLocation } from '~/types/map_type';
import { ref, watch, onMounted, defineEmits, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createGroup, queryGroupsByName, queryGroupsByLocation, joinGroup } from '~/utils/api/modules/group';
import { debounce } from 'lodash-es';
import { useRouter } from 'vue-router';
import GroupList from './GroupList.vue'
import type { Result } from '~/types/common';
import { handleApiResponse, handleApiError } from '~/utils/helpers/responseHandler';
import { useActivity } from '~/composables/useActivity';

const props = defineProps<{
    location: MapLocation
    locationName: string
    activeTab?: 'search' | 'create' // 新增属性，用于外部控制显示哪个标签页
}>()

const emit = defineEmits(['refresh-activities', 'update:activeTab'])

// 通过计算属性来处理双向绑定的activeTab
const activeTabValue = computed({
    get: () => props.activeTab || 'search',
    set: (value) => emit('update:activeTab', value)
})

const wantedGroupName = ref('')
const groupsNearby = ref<GroupInfo[]>([])
const showResults = ref(false);
const searching = ref(false);
const searchResults = ref<GroupInfo[]>([]);
const dialogForm = ref({
    name: ''
})

const router = useRouter()
const { fetchRecentActivities } = useActivity()

watch(props, () => {
    getNearbyGroups()
}, { deep: true })

// 立即执行搜索
const handleSearch = async () => {
    if (!wantedGroupName.value.trim()) {
        ElMessage.warning('请输入搜索内容')
        return;
    }

    try {
        searching.value = true;
        showResults.value = true;
        
        const response = await queryGroupsByName({
            name: wantedGroupName.value.trim()
        });
        
        const { success, data } = handleApiResponse<GroupInfo[]>(response, {
            successMessage: '',
            errorMessage: '搜索失败',
            showSuccessMessage: false
        });
        
        if (success && data) {
            searchResults.value = data;
        }
    } catch (error) {
        handleApiError(error, '搜索失败');
    } finally {
        searching.value = false;
    }
}

// 防抖搜索处理
const handleSearchInput = debounce(async () => {
    if (!wantedGroupName.value.trim()) {
        showResults.value = false;
        return;
    }

    handleSearch();
}, 500);

// 获取附近的群组
const getNearbyGroups = async () => {
    try {
        const response = await queryGroupsByLocation({
            latitude: props.location.latitude,
            longitude: props.location.longitude,
            radius: 1000
        });
        
        const { success, data } = handleApiResponse<GroupInfo[]>(response, {
            successMessage: '',
            errorMessage: '获取附近群组失败',
            showSuccessMessage: false
        });
        
        if (success && data) {
            groupsNearby.value = data;
        }
    } catch (error) {
        handleApiError(error, '获取附近群组失败');
    }
}

// 在群组操作后刷新附近活动
const refreshActivities = async () => {
    try {
        await fetchRecentActivities(props.location, 5000, 20)
        emit('refresh-activities')
    } catch (error) {
        console.error('刷新活动失败', error)
    }
}

const handleCreateGroup = async () => {
    if (!dialogForm.value.name.trim()) {
        ElMessage.warning('请输入群组名称')
        return
    }

    try {
        const response = await createGroup({
            name: dialogForm.value.name.trim(),
            description: '',
            isPublic: true,
            location: {
                latitude: props.location.latitude,
                longitude: props.location.longitude
            }
        });
        
        const { success } = handleApiResponse<GroupInfo>(response, {
            successMessage: '创建成功',
            errorMessage: '创建群组失败'
        });
        
        if (success) {
            dialogForm.value.name = '' // 清空表单
            getNearbyGroups() // 刷新列表
            await refreshActivities() // 刷新活动列表
            // 创建成功后切换到搜索标签页
            activeTabValue.value = 'search'
        }
    } catch (error) {
        handleApiError(error, '创建群组失败');
    }
}

async function handleJoinGroup(group: GroupInfo) {
    showResults.value = false;
    
    try {
        if (group.is_need_password) {
            ElMessageBox.prompt('请输入密码', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^\d{6}$/,
                inputErrorMessage: '密码必须为6位数字'
            }).then(async ({ value }) => {
                await joinGroupAndNavigate(group.group_id, value);
            });
        } else {
            await joinGroupAndNavigate(group.group_id);
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '加入群组失败')
    }
}

// 提取共用的加入群组和导航逻辑
async function joinGroupAndNavigate(groupId: string, password?: string) {
    const params: any = { groupId };
    if (password) params.password = password;
    
    try {
        const response = await joinGroup(params);
        
        const { success } = handleApiResponse<JoinGroupResponse>(response, {
            successMessage: '加入成功',
            errorMessage: '加入群组失败'
        });
        
        if (success) {
            getNearbyGroups(); // 刷新列表
            await refreshActivities(); // 刷新活动列表
            // 导航到群聊页面
            router.push(`/group_chat?groupId=${groupId}`);
        }
    } catch (error) {
        handleApiError(error, '加入群组失败');
    }
}

// 监听搜索框内容变化，实现防抖搜索
watch(wantedGroupName, handleSearchInput)

// 监听切换标签页时，如果切换到创建页面且搜索框有内容，自动填充到创建框
watch(activeTabValue, (newVal) => {
    if (newVal === 'create' && wantedGroupName.value.trim()) {
        dialogForm.value.name = wantedGroupName.value.trim()
    }
})

onMounted(() => {
    getNearbyGroups()
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.group-tabs {
    width: 100%;
}

.group-list-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.group-list-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
}

.empty-result {
    text-align: center;
    color: var(--text-color-quaternary);
    padding: var(--spacing-2xl) 0;
    font-size: var(--font-size-sm);
}

.search-dialog {
    width: 60%;
}

.search-container {
    margin-bottom: var(--spacing-md);
}

.create-button {
    width: 100%;
    margin-top: var(--spacing-md);
}

.mt-4 {
    margin-top: 1rem;
}

// 媒体查询使用混合器
@include m.mobile {
    .search-container {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .search-button {
        width: 100%;
    }

    // 调整对话框宽度 - 使用更具体的选择器提高优先级
    :deep(.el-dialog.search-dialog) {
        width: 90%;
        max-width: 90vw;
    }

    // 调整表单项间距
    :deep(.el-form-item) {
        margin-bottom: var(--spacing-md);
    }

    // 调整输入框大小
    :deep(.el-input__inner) {
        font-size: var(--font-size-sm);
        height: 2.5rem;
    }
}

// 针对小屏幕设备的优化
@media (max-height: 600px) {
    .group-card {
        margin-bottom: var(--spacing-sm);
    }

    :deep(.el-card__body) {
        padding: var(--spacing-md);
    }
}

// 添加此类的样式定义
.group-location-info {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}
</style>