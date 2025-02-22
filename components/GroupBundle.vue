<template>
    <!-- 群组搜索 -->
    <el-card class="mb-4">
        <el-input v-model="wantedGroupName" placeholder="搜索群组" @blur="onGroupSearch">
            <template #suffix>
                <el-icon>
                    <Search />
                </el-icon>
            </template>
        </el-input>
        <el-button class="mt-2 w-full" type="primary" @click="onGroupAdd">增加群组</el-button>
    </el-card>

    <!-- 群组列表 -->
    <el-card>
        <div class="space-y-3">
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
import type { MapLocation, QueryGroupInfoResponseByName } from '~/types';
import { ref, watchEffect } from 'vue';
import { ElMessage } from 'element-plus';
import { createGroup, queryGroupsByName } from '../utils/api';

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

const wantedGroupName = ref('')
const groups = ref<QueryGroupInfoResponseByName[]>([])

const runtimeConfig = useRuntimeConfig()

async function onGroupSearch() {
    try {
        const { data } = await queryGroupsByName({
            name: wantedGroupName.value
        });
        if (data.code === 0) {
            groups.value = data.data;
        }
    } catch (error) {
        const err = error as Error
        ElMessage.error(err.message || '搜索群组失败')
    }
}

async function onGroupAdd() {
    try {
        const { data } = await createGroup({
            name: wantedGroupName.value,
            location: props.location
        });

        if (data.code === 0) {
            ElMessage.success('创建成功');
            onGroupSearch(); // 刷新列表
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