<template>
    <div class="h-screen flex flex-col">
        <!-- 头部 -->
        <div class="border-b p-4 flex items-center justify-between bg-white">
            <div>
                <h1 class="text-xl font-bold">{{ groupInfo.name }}</h1>
                <p class="text-gray-500 text-sm">位置：{{ groupInfo.location_name }}</p>
            </div>
            <el-button type="primary" @click="onLeaveGroup">返回主页</el-button>
        </div>

        <!-- 消息区域 -->
        <el-scrollbar class="flex-1 p-4 bg-gray-50" ref="scrollbar" @scroll="checkScrollToBottom">
            <div class="space-y-4">
                <div v-for="msg in messages" :key="msg.message_id" class="flex"
                    :class="{ 'justify-end': isCurrentUser(msg.user_id), 'justify-start': !isCurrentUser(msg.user_id) }">
                    <div class="max-w-[70%] rounded-lg p-3"
                        :class="{ 'bg-blue-100': isCurrentUser(msg.user_id), 'bg-white': !isCurrentUser(msg.user_id) }">
                        <p class="text-gray-800">{{ msg.nickname }}</p>
                        <p class="text-gray-800">{{ msg.content }}</p>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs text-gray-500">{{ formatTime(msg.created_at) }}</span>
                        </div>
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
import { sendMessageToGroup, queryMessageFromGroup, leaveGroup } from '@/utils/api'
import type { GroupMessage } from '@/types'
import dayjs from 'dayjs'
import { useNuxtApp } from '#app'

const { $storage } = useNuxtApp()

const route = useRoute()
const groupId = ref("")
groupId.value = route.query.group_id as string
const messages = ref<GroupMessage[]>([])
const newMessage = ref('')
const scrollbar = ref()
const showScrollButton = ref(false)
const getOlderMessageIntervalId = ref<NodeJS.Timeout | null>(null)
const getLatestMessageIntervalId = ref<NodeJS.Timeout | null>(null)

// 获取群组信息（需要根据你的接口实现）
const groupInfo = ref({
    name: '群组名称',
    location_name: '位置名称'
})

// 合并新收到的消息
const mergeNewMessages = (msg_recived: GroupMessage[], show_scroll_button: boolean) => {
    const newMessages = msg_recived.filter((msg) => !messages.value.some((m) => m.message_id === msg.message_id))
    if (newMessages.length > 0) {
        messages.value.push(...newMessages)
        messages.value.sort((a, b) => {
            return dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
        })
        // 显示滚动按钮
        showScrollButton.value = show_scroll_button
    }
}

// 获取消息历史
const loadHistoryMessage = async () => {
    try {
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            limit: -20
        })
        mergeNewMessages(data.resp_data, false)
        console.log("messages: ", messages.value)
    } catch (error) {
        ElMessage.error('获取消息失败')
    }
}

// 获取最新的消息
const loadLatestMessage = async () => {
    try {
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            message_id: messages.value.length > 0 ? messages.value[0].message_id : undefined,
            limit: 20
        })
        mergeNewMessages(data.resp_data, true)
        console.log("messages: ", messages.value)
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
            content: newMessage.value.trim()
        })
        newMessage.value = ''
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

// 监控滚动情况，如果用户已经滚动到底部，则隐藏滚动按钮
const checkScrollToBottom = () => {
    const scrollTop = scrollbar.value?.wrapRef?.scrollTop
    const scrollHeight = scrollbar.value?.wrapRef?.scrollHeight
    const clientHeight = scrollbar.value?.wrapRef?.clientHeight
    if (scrollTop + clientHeight >= scrollHeight) {
        showScrollButton.value = false
    }
}

// 时间格式化
const formatTime = (timestamp: string) => {
    const timestampNumber = dayjs(timestamp).unix()
    const now = dayjs();
    const messageTime = dayjs.unix(timestampNumber);
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
    return senderId == $storage.getItem('user_id')
}

// 离开群组
const onLeaveGroup = async () => {
    try {
        await leaveGroup({
            group_id: groupId.value
        })
        navigateTo('/home')
    } catch (error) {
        ElMessage.error('离开群组失败')
    }
}

onMounted(() => {
    loadHistoryMessage()
    scrollToBottom()
    getOlderMessageIntervalId.value = setInterval(() => {
        loadHistoryMessage()
    }, 5000)
    getLatestMessageIntervalId.value = setInterval(() => {
        loadLatestMessage()
    }, 2000)
})

onUnmounted(() => {
    if (getOlderMessageIntervalId.value) {
        clearInterval(getOlderMessageIntervalId.value)
    }
    if (getLatestMessageIntervalId.value) {
        clearInterval(getLatestMessageIntervalId.value)
    }
})
</script>