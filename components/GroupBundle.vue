<template>
    <!-- 群组搜索 -->
    <el-card class="mb-4">
        <el-input v-model="wantedGroupName" placeholder="搜索群组" @blur="handleSearchInput" clearable>
            <template #suffix>
                <el-icon>
                    <Search />
                </el-icon>
            </template>
        </el-input>
        <el-button 
            class="mt-2 w-full" 
            type="primary" 
            @click="showCreateDialog = true"
        >
            增加群组
        </el-button>
    </el-card>

    <!-- 新增群组弹窗 -->
    <el-dialog 
        v-model="showCreateDialog" 
        title="创建新群组" 
        width="500px"
    >
        <el-form :model="dialogForm" label-width="80px">
            <el-form-item label="群组名称" required>
                <el-input 
                    v-model="dialogForm.name" 
                    placeholder="请输入群组名称"
                    clearable
                />
            </el-form-item>
            <el-form-item label="当前位置">
                <el-input 
                    :model-value="locationName" 
                    readonly
                />
                <div class="text-gray-500 text-xs mt-1">
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
        <el-scrollbar height="400px">
            <div class="space-y-3">
                <div v-for="group in searchResults" :key="group.group_id"
                    class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    @click="handleSelectGroup(group)">
                    <el-avatar :size="40" shape="square" />
                    <div class="flex-1">
                        <h4 class="font-medium">{{ group.name }}</h4>
                        <p class="text-sm text-gray-500">
                            位置：{{ group.location_name }} · 成员 {{ group.member_count }} 人
                        </p>
                    </div>
                </div>
                <div v-if="searchResults.length === 0" class="text-center text-gray-400">
                    {{ searching ? '搜索中...' : '暂无相关群组' }}
                </div>
            </div>
        </el-scrollbar>
    </el-dialog>

    <!-- 群组列表 -->
    <el-card>
        <div class="space-y-3">
            <div class="text-lg font-bold">
                附近群组列表
            </div>
            <div v-for="group in groups" :key="group.group_id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <el-avatar :size="40" shape="square" />
                <div class="flex-1">
                    <h4 class="font-medium">{{ group.name }}</h4>
                    <p class="text-sm text-gray-500">
                        位置：{{ locationName }} · 成员 {{ group.member_count }} 人
                    </p>
                </div>
                <el-button size="small" @click="handleJoinGroup(group.group_id)">加入</el-button>
            </div>
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { MapLocation, QueryGroupInfoResponse } from '~/types';
import { ref, watchEffect } from 'vue';
import { ElMessage } from 'element-plus';
import { createGroup, queryGroupsByName } from '../utils/api';
import { debounce } from 'lodash-es';

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

const wantedGroupName = ref('')
const groups = ref<QueryGroupInfoResponse[]>([])
const showResults = ref(false);
const searching = ref(false);
const searchResults = ref<QueryGroupInfoResponse[]>([]);
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
        const { data } = await queryGroupsByName({
            name: wantedGroupName.value.trim()
        });
        if (data.code === 0) {
            searchResults.value = data.data;
        }
    } catch (error) {
        ElMessage.error('搜索失败');
    } finally {
        searching.value = false;
    }
}, 500);

// 处理群组选择
const handleSelectGroup = (group: QueryGroupInfoResponse) => {
    console.log('选中群组', group);
    showResults.value = false;
};

// 获取附近的群组
const getNearbyGroups = async () => {
    const { data } = await queryGroupsByLocation({
        location: props.location
    });
    if (data.code === 0) {
        groups.value = data.data;
    }
}

const handleCreateGroup = async () => {
    if (!dialogForm.value.name.trim()) {
        ElMessage.warning('请输入群组名称')
        return
    }

    try {
        const { data } = await createGroup({
            name: dialogForm.value.name.trim(),
            location: props.location
        })

        if (data.code === 0) {
            ElMessage.success('创建成功')
            showCreateDialog.value = false
            dialogForm.value.name = '' // 清空表单
            getNearbyGroups() // 刷新列表
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '创建群组失败')
    }
}

function handleJoinGroup(groupId: string) {
    console.log('加入群组', groupId);
}
</script>