<template>
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
        <el-divider />
        <el-button class="create-button" type="primary" @click="showCreateDialog = true">
            增加群组
        </el-button>
    </el-card>

    <!-- 新增群组弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建新群组" class="group-dialog">
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
        </el-form>

        <template #footer>
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="handleCreateGroup">创建</el-button>
        </template>
    </el-dialog>

    <!-- 搜索结果弹窗 -->
    <el-dialog v-model="showResults" title="搜索结果" :modal="true" class="search-dialog" center>
        <GroupList :groups="searchResults" :loading="searching" :show-join-button="true" show-scroll
            @join="handleJoinGroup" />
        <div v-if="searchResults.length === 0 && !searching" class="empty-result">
            没有找到相关群组
        </div>
    </el-dialog>

    <!-- 群组列表 -->
    <el-card>
        <div class="group-list-container">
            <div class="group-list-title">
                附近群组列表
            </div>
            <GroupList :groups="groupsNearby" :show-join-button="true" @join="handleJoinGroup" show-scroll />
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { GroupInfo, JoinGroupResponse } from '~/types/group_type';
import type { MapLocation } from '~/types/map_type';
import { ref, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createGroup, queryGroupsByName, queryGroupsByLocation, joinGroup } from '~/utils/api/modules/group';
import { debounce } from 'lodash-es';
import GroupList from './GroupList.vue'
import type { Result } from '~/types/common';
import { handleApiResponse, handleApiError } from '~/utils/helpers/responseHandler';

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

const wantedGroupName = ref('')
const groupsNearby = ref<GroupInfo[]>([])
const showResults = ref(false);
const searching = ref(false);
const searchResults = ref<GroupInfo[]>([]);
const showCreateDialog = ref(false)
const dialogForm = ref({
    name: ''
})

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
            showCreateDialog.value = false
            dialogForm.value.name = '' // 清空表单
            getNearbyGroups() // 刷新列表
        }
    } catch (error) {
        handleApiError(error, '创建群组失败');
    }
}

async function handleJoinGroup(group: GroupInfo) {
    const router = useRouter()
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
async function joinGroupAndNavigate(groupId: string, message?: string) {
    const router = useRouter()
    const params: any = { groupId };
    if (message) params.message = message;
    
    try {
        const response = await joinGroup(params);
        
        const { success } = handleApiResponse<JoinGroupResponse>(response, {
            successMessage: '',
            errorMessage: '加入群组失败',
            showSuccessMessage: false
        });
        
        if (success) {
            router.push(`/group_chat?group_id=${groupId}`);
        }
    } catch (error) {
        handleApiError(error, '加入群组失败');
    }
}

// 监听搜索框内容变化，实现防抖搜索
watch(wantedGroupName, handleSearchInput)

// 监听创建群组对话框显示状态
watch(showCreateDialog, (newVal) => {
    if (newVal && wantedGroupName.value.trim()) {
        // 当对话框显示并且搜索框有内容时，自动填充到创建群组名称
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

.group-dialog {
    width: 35%;
}

.search-dialog {
    width: 60%;
}

.search-container {
    margin-bottom: var(--spacing-md);
}

.create-button {
    margin-top: var(--spacing-sm);
    width: 100%;
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
    :deep(.el-dialog.search-dialog),
    :deep(.el-dialog.group-dialog) {
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