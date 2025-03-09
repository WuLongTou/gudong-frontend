<template>
    <el-scrollbar v-if="showScroll" height="400px">
        <div class="space-y-3">
            <div v-for="group in groups" :key="group.group_id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <el-avatar :size="40" shape="square" />
                <div class="flex-1">
                    <h4 class="font-medium">{{ group.name }}</h4>
                    <p class="text-sm text-gray-500">
                        位置：{{ group.location_name }} · 成员 {{ group.member_count }} 人
                    </p>
                </div>
                <el-button v-if="showJoinButton" size="small" @click="handleJoinGroup(group)">
                    加入
                </el-button>
            </div>
            <div v-if="groups.length === 0" class="text-center text-gray-400">
                {{ loading ? '加载中...' : '暂无数据' }}
            </div>
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import type { GroupInfo } from '~/types';

const props = defineProps<{
    groups: GroupInfo[]
    loading?: boolean
    showJoinButton?: boolean
    showScroll?: boolean
}>()

const emit = defineEmits<{
    (e: 'join', group: GroupInfo): void
}>()

const handleJoinGroup = (group: GroupInfo) => {
    emit('join', group)
}

onMounted(() => {
    console.log('groups', props.groups)
})
</script>