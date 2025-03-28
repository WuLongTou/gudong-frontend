<template>
    <el-tabs v-model="activeTabValue" class="group-tabs">
        <el-tab-pane label="搜索群组" name="search">
            <!-- 群组搜索 -->
            <el-card class="group-card">
                <div class="search-container">
                    <el-input v-model="wantedGroupName" placeholder="输入你想搜索的群组吧" @keyup.enter="handleSearch" clearable>
                        <template #append>
                            <el-button type="primary" @click="handleSearch" :loading="searching">
                                <el-icon><Search /></el-icon>
                                搜索
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </el-card>

            <!-- 群组列表 -->
            <el-card class="mt-4">
                <div class="group-list-container">
                    <div class="group-list-title">附近群组列表</div>
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
import type { GroupInfo } from '~/types/api/group';
import type { MapLocation } from '~/types/map_type';
import { ref, watch, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import GroupList from './GroupList.vue'
import { 
  createGroup, getGroupByName, joinGroup 
} from '~/utils/api/modules/group'

const props = defineProps<{
    location: MapLocation
    locationName: string
    activeTab?: 'search' | 'create'
    groups?: GroupInfo[]
}>()

const emit = defineEmits(['refresh-activities', 'update:activeTab', 'refresh-groups'])

// 响应式数据
const wantedGroupName = ref('')
const showResults = ref(false);
const searching = ref(false);
const searchResults = ref<GroupInfo[]>([]);
const dialogForm = ref({ name: '' })

const router = useRouter()

// 通过计算属性处理双向绑定
const activeTabValue = computed({
    get: () => props.activeTab || 'search',
    set: (value) => emit('update:activeTab', value)
})

// 获取群组列表，使用props传入的数据
const groupsNearby = computed(() => props.groups || [])

// 通知父组件刷新群组数据
const notifyGroupsRefresh = () => {
    emit('refresh-groups')
}

// 搜索群组
const handleSearch = async () => {
    if (!wantedGroupName.value.trim()) {
        ElMessage.warning('请输入搜索内容')
        return;
    }

    try {
        searching.value = true;
        showResults.value = true;

        const response = await getGroupByName(wantedGroupName.value.trim());

        if (response.code === 0 && response.resp_data) {
            searchResults.value = response.resp_data;
        } else {
            ElMessage.error(response.msg || '搜索失败');
        }
    } catch (error) {
        console.error('搜索失败:', error);
        ElMessage.error('搜索失败');
    } finally {
        searching.value = false;
    }
}

// 防抖搜索
const handleSearchInput = debounce(() => {
    if (wantedGroupName.value.trim()) handleSearch();
    else showResults.value = false;
}, 500);

// 通知父组件刷新活动数据
const notifyActivityRefresh = () => {
    emit('refresh-activities')
}

// 创建群组
const handleCreateGroup = async () => {
    if (!dialogForm.value.name.trim()) {
        ElMessage.warning('请输入群组名称')
        return
    }

    try {
        const response = await createGroup({
            name: dialogForm.value.name.trim(),
            location_name: props.locationName,
            latitude: props.location.latitude,
            longitude: props.location.longitude,
            description: '',
            password: undefined
        });

        if (response.code === 0) {
            ElMessage.success('创建成功');
            dialogForm.value.name = ''
            notifyGroupsRefresh()
            notifyActivityRefresh()
            activeTabValue.value = 'search'
        } else {
            ElMessage.error(response.msg || '创建群组失败');
        }
    } catch (error) {
        console.error('创建群组失败:', error);
        ElMessage.error('创建群组失败');
    }
}

// 加入群组
async function handleJoinGroup(group: GroupInfo) {
    showResults.value = false;

    try {
        if (group.is_need_password) {
            ElMessageBox.prompt('请输入密码', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^\d{6}$/,
                inputErrorMessage: '密码必须为6位数字'
            }).then(({ value }) => joinGroupAndNavigate(group.group_id, value));
        } else {
            await joinGroupAndNavigate(group.group_id);
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '加入群组失败')
    }
}

// 加入群组并导航
async function joinGroupAndNavigate(groupId: string, password?: string) {
    try {
        const response = await joinGroup({ group_id: groupId, password });
        
        if (response.code === 0) {
            ElMessage.success('加入成功');
            notifyGroupsRefresh();
            notifyActivityRefresh();
            router.push(`/group_chat?group_id=${groupId}`);
        } else {
            ElMessage.error(response.msg || '加入群组失败');
        }
    } catch (error) {
        console.error('加入群组失败:', error);
        ElMessage.error('加入群组失败');
    }
}

// 监听搜索框内容变化
watch(wantedGroupName, handleSearchInput)

// 监听标签页切换
watch(activeTabValue, (newVal) => {
    if (newVal === 'create' && wantedGroupName.value.trim()) {
        dialogForm.value.name = wantedGroupName.value.trim()
    }
})

// 组件挂载时通知父组件刷新群组数据
onMounted(() => {
    notifyGroupsRefresh()
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

.group-location-info {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

@include m.mobile {
    .search-container {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .search-button {
        width: 100%;
    }

    :deep(.el-dialog.search-dialog) {
        width: 90%;
        max-width: 90vw;
    }

    :deep(.el-form-item) {
        margin-bottom: var(--spacing-md);
    }

    :deep(.el-input__inner) {
        font-size: var(--font-size-sm);
        height: 2.5rem;
    }
}

@media (max-height: 600px) {
    .group-card {
        margin-bottom: var(--spacing-sm);
    }

    :deep(.el-card__body) {
        padding: var(--spacing-md);
    }
}
</style>