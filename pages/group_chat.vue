<template>
    <div class="h-screen flex flex-col">
        <!-- 头部 -->
        <div class="border-b p-4 flex items-center justify-between bg-white">
            <div>
                <h1 class="text-xl font-bold">{{ groupInfo.name }}</h1>
                <p class="text-gray-500 text-sm">位置：{{ groupInfo.location_name }}</p>
            </div>
            <NuxtLink to="/home">
                <el-button type="primary">返回主页</el-button>
            </NuxtLink>
        </div>

        <!-- 消息区域 -->
        <el-scrollbar class="flex-1 p-4 bg-gray-50" ref="scrollbar">
            <div class="space-y-4">
                <div v-for="(msg, index) in messages" :key="index" class="flex"
                    :class="{ 'justify-end': isCurrentUser(msg.sender_id), 'justify-start': !isCurrentUser(msg.sender_id) }">
                    <div class="max-w-[70%] rounded-lg p-3"
                        :class="{ 'bg-blue-100': isCurrentUser(msg.sender_id), 'bg-white': !isCurrentUser(msg.sender_id) }">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-medium">{{ msg.sender_name }}</span>
                            <span class="text-xs text-gray-500">{{ formatTime(msg.timestamp) }}</span>
                        </div>
                        <p class="text-gray-800">{{ msg.message }}</p>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <div v-if="showScrollButton" class="fixed bottom-20 right-6">
            <el-button type="primary" circle @click="scrollToBottom"
                class="opacity-80 hover:opacity-100 transition-opacity">
                <el-icon>
                    <ArrowDown />
                </el-icon>
            </el-button>
        </div>
        <!-- 发送消息区域 -->
        <div class="border-t p-4 bg-white">
            <el-input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" :maxlength="200"
                show-word-limit clearable>
                <template #append>
                    <el-button @click="sendMessage" type="primary">发送</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendMessageToGroup, queryMessageFromGroup } from '@/utils/api'
import type { QueryMessageFromGroupResponse } from '@/types'
import dayjs from 'dayjs'


const route = useRoute()
const groupId = ref("")
groupId.value = route.query.group_id as string
const messages = ref<QueryMessageFromGroupResponse[]>([])
const newMessage = ref('')
const scrollbar = ref()
const showScrollButton = ref(false)

// 获取群组信息（需要根据你的接口实现）
const groupInfo = ref({
    name: '群组名称',
    location_name: '位置名称'
})

// 获取消息历史
const loadMessages = async () => {
    try {
        const { data } = await queryMessageFromGroup({
            group_id: groupId.value,
            start_timestamp: dayjs().subtract(7, 'day').unix(),
            end_timestamp: dayjs().unix()
        })
        messages.value = data.content || []
    } catch (error) {
        ElMessage.error('获取消息失败')
    }
}

// 发送消息
const sendMessage = async () => {
    if (!newMessage.value.trim()) return

    try {
        await sendMessageToGroup({
            group_id: groupId.value,
            message: newMessage.value.trim()
        })
        newMessage.value = ''
        await loadMessages()
        // 显示滚动按钮
        showScrollButton.value = true
    } catch (error) {
        ElMessage.error('发送消息失败')
    }
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        scrollbar.value?.setScrollTop(scrollbar.value?.wrapRef?.scrollHeight || 0)
        showScrollButton.value = false
    })
}

// 时间格式化
const formatTime = (timestamp: number) => {
    const now = dayjs();
    const messageTime = dayjs.unix(timestamp);
    const diffMinutes = now.diff(messageTime, 'minute');
    const diffHours = now.diff(messageTime, 'hour');
    const diffDays = now.diff(messageTime, 'day');
    const diffMonths = now.diff(messageTime, 'month');
    if (diffMinutes < 1) return '刚刚'
    if (diffHours < 1) return `${diffMinutes}分钟前`
    if (diffDays < 1) return messageTime.format('HH:mm')
    if (diffMonths < 1) return messageTime.format('MM-DD')
    return messageTime.format('YYYY-MM-DD')
}

// 判断当前用户（需要根据你的用户系统实现）
const isCurrentUser = (senderId: string) => {
    return senderId === 'current_user_id' // 替换为实际用户ID获取逻辑
}

onMounted(() => {
    loadMessages()
})
</script>