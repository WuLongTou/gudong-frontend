<template>
    <div class="chat-container">
        <!-- 头部 -->
        <div class="chat-header">
            <div>
                <h1 class="group-title">{{ groupInfo.name }}</h1>
                <p class="location-text">位置：{{ groupInfo.location_name }}</p>
            </div>
            <el-button type="primary" @click="onLeaveGroup">返回主页</el-button>
        </div>

        <!-- 消息区域 -->
        <el-scrollbar class="message-area" ref="scrollbar" @scroll="checkScrollToBottom">
            <div class="message-list">
                <div v-for="msg in messages" :key="msg.message_id" :class="[
                    'message-item',
                    isCurrentUser(msg.user_id) ? 'message-self' : 'message-other'
                ]">
                    <div :class="[
                        'message-bubble',
                        isCurrentUser(msg.user_id) ? 'message-bubble-self' : 'message-bubble-other'
                    ]">
                        <p class="message-sender">{{ msg.nickname }}</p>
                        <p class="message-content">{{ msg.content }}</p>
                        <div class="message-meta">
                            <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <div v-if="showScrollButton" class="scroll-button">
            <el-button type="primary" circle @click="scrollToBottom" class="scroll-button-inner">
                <el-icon>
                    <ArrowDown />
                </el-icon>
            </el-button>
        </div>
        <!-- 发送消息区域 -->
        <div class="input-area">
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
import { sendMessageToGroup, queryMessageFromGroup, leaveGroup, queryGroupById } from '@/utils/api'
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

// 获取群组信息
const groupInfo = ref<{
    name: string;
    location_name: string;
}>({
    name: '搁乐儿',
    location_name: '搁哩拐弯'
})

// 加载群组信息
const loadGroupInfo = async () => {
    try {
        const data = await queryGroupById({
            group_id: groupId.value
        })
        groupInfo.value = {
            name: data.resp_data.name,
            location_name: data.resp_data.location_name
        }
    } catch (error) {
        ElMessage.error('获取群组信息失败')
    }
}

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
        scrollToBottom()
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
    loadGroupInfo()
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

<style scoped>
.chat-container {
    /* 保持fixed定位 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.chat-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: white;
    min-height: 4rem;
}

.group-title {
    font-size: 1.25rem;
    font-weight: bold;
    word-break: break-word;
}

.location-text {
    color: #6b7280;
    font-size: 0.875rem;
    word-break: break-word;
}

.message-area {
    flex: 1;
    padding: 1rem;
    background-color: #f9fafb;
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.message-item {
    display: flex;
}

.message-self {
    justify-content: flex-end;
}

.message-other {
    justify-content: flex-start;
}

.message-bubble {
    max-width: 70%;
    border-radius: 0.5rem;
    padding: 0.75rem;
    word-break: break-word;
}

.message-bubble-self {
    background-color: #dbeafe;
}

.message-bubble-other {
    background-color: white;
}

.message-sender {
    color: #1f2937;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
}

.message-content {
    color: #1f2937;
}

.message-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.message-time {
    font-size: 0.75rem;
    color: #6b7280;
}

.scroll-button {
    position: fixed;
    bottom: 5rem;
    right: 1.5rem;
    z-index: 10;
}

.scroll-button-inner {
    opacity: 0.8;
    transition: opacity 0.3s;
}

.scroll-button-inner:hover {
    opacity: 1;
}

.input-area {
    border-top: 1px solid #e5e7eb;
    padding: 1rem;
    background-color: white;
    min-height: 4rem;
    max-height: 8rem;
}

/* 针对手机竖屏模式的优化 */
@media (max-aspect-ratio: 2/3) {
    .chat-header {
        padding: 0.75rem;
        min-height: 3.5rem;
    }

    .group-title {
        font-size: 1.125rem;
    }

    .message-area {
        padding: 0.75rem;
    }

    .message-bubble {
        max-width: 85%;
        padding: 0.5rem;
    }

    .input-area {
        padding: 0.75rem;
        min-height: 3.5rem;
    }

    .scroll-button {
        bottom: 4.5rem;
        right: 1rem;
    }
}

/* 针对小屏幕设备的优化 */
@media (max-height: 500px) {
    .chat-header {
        min-height: 3rem;
        padding: 0.5rem;
    }

    .input-area {
        min-height: 3rem;
        padding: 0.5rem;
    }

    .message-list {
        gap: 0.5rem;
    }
}
</style>