<template>
    <!-- 群组搜索 -->
    <el-card class="group-card">
        <el-input v-model="wantedGroupName" placeholder="搜索群组" @blur="handleSearchInput" clearable>
            <template #suffix>
                <el-icon>
                    <Search />
                </el-icon>
            </template>
        </el-input>
        <el-button class="create-button" type="primary" @click="showCreateDialog = true">
            增加群组
        </el-button>
    </el-card>

    <!-- 新增群组弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建新群组" width="500px">
        <el-form :model="dialogForm" label-width="80px">
            <el-form-item label="群组名称" required>
                <el-input v-model="dialogForm.name" placeholder="请输入群组名称" clearable />
            </el-form-item>
            <el-form-item label="当前位置">
                <el-input :model-value="locationName" readonly />
                <div class="location-info">
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
    <el-dialog v-model="showResults" title="搜索结果" :modal="true" width="60%" center>
        <GroupList :groups="searchResults" :loading="searching" :show-join-button="true" show-scroll
            @join="handleJoinGroup" />
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
import type { MapLocation, GroupInfo, QueryGroupInfoByIdRequest, QueryGroupInfoByNameRequest, QueryGroupInfoByLocationRequest, JoinGroupResponse } from '~/types';
import { ref, watchEffect } from 'vue';
import { ElMessage } from 'element-plus';
import { createGroup, queryGroupsByName, queryGroupsByLocation, joinGroup } from '../utils/api';
import { debounce } from 'lodash-es';
import GroupList from './GroupList.vue'
import type { AxiosResponse } from 'axios';
import type { Result } from '~/types/common';

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

// 防抖搜索处理
const handleSearchInput = debounce(async () => {
    if (!wantedGroupName.value.trim()) {
        showResults.value = false;
        return;
    }

    try {
        searching.value = true;
        showResults.value = true;
        const { code, msg, resp_data }: Result<GroupInfo[]> = await queryGroupsByName({
            name: wantedGroupName.value.trim()
        });
        if (code === 0) {
            searchResults.value = resp_data;
        }
        else {
            ElMessage.error(msg || '搜索失败')
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '搜索失败')
    } finally {
        searching.value = false;
    }
}, 500);

// 处理群组选择
const handleSelectGroup = (group: GroupInfo) => {
    console.log('选中群组', group);
    showResults.value = false;
};

// 获取附近的群组
const getNearbyGroups = async () => {
    try {
        const { code, msg, resp_data }: Result<GroupInfo[]> = await queryGroupsByLocation({
            latitude: props.location.latitude,
            longitude: props.location.longitude,
            radius: 1000
        });
        if (code === 0) {
            groupsNearby.value = resp_data;
            console.log('获取附近群组', groupsNearby.value);
        }
        else {
            ElMessage.error(msg || '获取附近群组失败')
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '获取附近群组失败')
    }
}

const handleCreateGroup = async () => {
    if (!dialogForm.value.name.trim()) {
        ElMessage.warning('请输入群组名称')
        return
    }

    try {
        const { code, msg, resp_data }: Result<GroupInfo> = await createGroup({
            name: dialogForm.value.name.trim(),
            location_name: props.locationName,
            latitude: props.location.latitude,
            longitude: props.location.longitude,
            description: ''
        })

        if (code === 0) {
            ElMessage.success('创建成功')
            showCreateDialog.value = false
            dialogForm.value.name = '' // 清空表单
            getNearbyGroups() // 刷新列表
        }
        else {
            ElMessage.error(msg || '创建群组失败')
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '创建群组失败')
    }
}

async function handleJoinGroup(group: GroupInfo) {
    console.log('加入群组', group);
    showResults.value = false;
    if (group.is_need_password) {
        ElMessage.warning('该群组需要密码，请输入密码')
        ElMessageBox.prompt('请输入密码', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d{6}$/,
            inputErrorMessage: '密码必须为6位数字'
        }).then(async ({ value }) => {
            const { code, msg, resp_data }: Result<JoinGroupResponse> = await joinGroup({
                group_id: group.group_id,
                password: value
            })
            if (code === 0) {
                navigateTo(`/group_chat?group_id=${group.group_id}&password=${value}`)
            }
            else {
                ElMessage.error(msg || '加入群组失败')
            }
        })
    }
    else {
        const { code, msg, resp_data }: Result<JoinGroupResponse> = await joinGroup({
            group_id: group.group_id,
        })
        if (code === 0) {
            navigateTo(`/group_chat?group_id=${group.group_id}`)
        }
        else {
            ElMessage.error(msg || '加入群组失败')
        }
    }
}
</script>

<style scoped>
.group-card {
    margin-bottom: 1rem;
}

.create-button {
    margin-top: 0.5rem;
    width: 100%;
}

.location-info {
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    word-break: break-word;
}

.group-list-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.group-list-title {
    font-size: 1.125rem;
    font-weight: 700;
}

/* 针对手机竖屏模式的优化 */
@media (max-aspect-ratio: 2/3) {
    /* 调整对话框宽度 */
    :deep(.el-dialog) {
        width: 90% !important;
        max-width: 500px;
    }
    
    /* 调整表单项间距 */
    :deep(.el-form-item) {
        margin-bottom: 0.75rem;
    }
    
    /* 调整输入框大小 */
    :deep(.el-input__inner) {
        font-size: 0.875rem;
        height: 2.5rem;
    }
}

/* 针对小屏幕设备的优化 */
@media (max-height: 600px) {
    .group-card {
        margin-bottom: 0.5rem;
    }
    
    :deep(.el-card__body) {
        padding: 0.75rem;
    }
}
</style>