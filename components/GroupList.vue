<template>
    <el-scrollbar v-if="showScroll" height="400px">
        <div class="group-list-component">
            <div v-for="group in groups" :key="group.group_id" class="group-list-item">
                <el-avatar :size="40" shape="square" />
                <div class="group-list-info">
                    <h4 class="group-list-name">{{ group.name }}</h4>
                    <p class="group-list-location">
                        位置：{{ group.location_name }} · 成员 {{ group.member_count }} 人
                    </p>
                </div>
                <el-button v-if="showJoinButton" size="small" @click="handleJoinGroup(group)">
                    加入
                </el-button>
            </div>
            <div v-if="groups.length === 0" class="group-list-empty">
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

<style scoped>
.group-list-component {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.group-list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
}

.group-list-item:hover {
    background-color: #f3f4f6;
}

.group-list-info {
    flex: 1;
    min-width: 0; /* 防止文本溢出 */
}

.group-list-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.group-list-location {
    font-size: 0.875rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.group-list-empty {
    text-align: center;
    color: #9ca3af;
    padding: 1rem 0;
}

/* 针对手机竖屏模式的优化 */
@media (max-aspect-ratio: 2/3) {
    .group-list-item {
        padding: 0.75rem 0.5rem;
    }
    
    /* 调整按钮大小以便于触摸 */
    :deep(.el-button--small) {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
}

/* 针对极小屏幕的优化 */
@media (max-width: 320px) {
    .group-list-item {
        flex-wrap: wrap;
    }
    
    .group-list-info {
        width: 100%;
        margin-bottom: 0.25rem;
    }
}
</style>