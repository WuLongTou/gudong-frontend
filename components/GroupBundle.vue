<template>
    <!-- 群组搜索 -->
    <el-card class="mb-4">
        <el-input v-model="groupNameSearched" placeholder="搜索群组" @blur="onGroupSearch">
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
            <div v-for="i in 5" :key="i" class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <el-avatar :size="40" shape="square" />
                <div>
                    <h4 class="font-medium">群组 {{ i }}</h4>
                    <p class="text-sm text-gray-500">成员 {{ i * 3 }} 人</p>
                </div>
            </div>
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { MapLocation } from '~/types';

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

const groupNameSearched = ref('')
function onGroupSearch() {
    console.log('群组搜索')
}
function onGroupAdd() {
    console.log('增加群组')
}
</script>