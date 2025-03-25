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
                <div v-if="loading" class="loading-indicator">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>加载消息中...</span>
                </div>
                <div v-for="(msg, index) in messages" :key="msg.message_id" :class="[
                    'message-item',
                    isCurrentUser(msg.user_id) ? 'message-self' : 'message-other',
                    msg.isNew ? 'message-new' : ''
                ]">
                    <!-- 新消息分隔线 -->
                    <div v-if="index === firstNewMessageIndex" class="new-message-divider">
                        <span>新消息</span>
                    </div>
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
                <div v-if="messages.length === 0 && !loading" class="empty-message">
                    <p>暂无消息，发送第一条消息吧</p>
                </div>
            </div>
        </el-scrollbar>
        <div v-if="showScrollButton" class="scroll-button">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0">
                <el-button type="primary" circle @click="scrollToBottom" class="scroll-button-inner">
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </el-button>
            </el-badge>
        </div>
        <!-- 发送消息区域 -->
        <div class="input-area">
            <el-input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" :maxlength="200"
                show-word-limit clearable>
                <template #append>
                    <el-button @click="sendMessage" type="primary" :loading="sending">发送</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowDown, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendMessageToGroup, queryMessageFromGroup, leaveGroup, queryGroupById } from '@/utils/api'
import type { GroupMessage } from '@/types'
import dayjs from 'dayjs'
import { useNuxtApp } from '#app'

const { $storage } = useNuxtApp()

const route = useRoute()
const groupId = ref("")
groupId.value = route.query.group_id as string
const messages = ref<(GroupMessage & { isNew?: boolean })[]>([])
const newMessage = ref('')
const scrollbar = ref()
const showScrollButton = ref(false)
const getOlderMessageIntervalId = ref<NodeJS.Timeout | null>(null)
const getLatestMessageIntervalId = ref<NodeJS.Timeout | null>(null)
const loading = ref(true)
const sending = ref(false)
const isAtBottom = ref(true)
const unreadCount = ref(0)
const firstNewMessageIndex = ref(-1)
const lastReadMessageId = ref('')

// 获取群组信息
const groupInfo = ref<{
    name: string;
    location_name: string;
}>({
    name: '加载中...',
    location_name: '加载中...'
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
const mergeNewMessages = (msg_recived: GroupMessage[]) => {
    if (msg_recived.length === 0) return false;

    // 记录当前是否在底部
    updateScrollPosition()

    // 标记新消息
    const newMessages = msg_recived.filter(
        (msg) => !messages.value.some((m) => m.message_id === msg.message_id)
    ).map(msg => ({
        ...msg,
        isNew: true
    }))

    if (newMessages.length > 0) {
        // 保存当前最后一条消息的ID，用于标记新消息
        if (messages.value.length > 0 && lastReadMessageId.value === '') {
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        }

        // 合并消息并排序
        messages.value = [...messages.value, ...newMessages].sort((a, b) => {
            return dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
        })

        // 查找第一条新消息的索引
        if (lastReadMessageId.value && firstNewMessageIndex.value === -1) {
            const lastReadIndex = messages.value.findIndex(m => m.message_id === lastReadMessageId.value)
            if (lastReadIndex !== -1) {
                firstNewMessageIndex.value = lastReadIndex + 1
            }
        }

        // 如果在底部，自动滚动，否则更新未读数
        if (isAtBottom.value) {
            scrollToBottom()
            // 已读所有消息
            unreadCount.value = 0
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
            firstNewMessageIndex.value = -1
        } else {
            // 更新未读消息数
            const myUserId = $storage.getItem('user_id')
            const newUnreadMessages = newMessages.filter(msg => msg.user_id !== myUserId)
            unreadCount.value += newUnreadMessages.length
            showScrollButton.value = true
        }
        
        return true
    }
    return false
}

// 获取消息历史
const loadHistoryMessage = async () => {
    if (loading.value) return
    
    loading.value = true
    try {
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            limit: -20
        })
        const hasNewMessages = mergeNewMessages(data.resp_data)
        
        // 首次加载后滚动到底部
        if (messages.value.length > 0 && hasNewMessages) {
            nextTick(() => {
                scrollToBottom()
                // 初始加载完成后，清除新消息标记
                messages.value.forEach(msg => msg.isNew = false)
                unreadCount.value = 0
                lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
                firstNewMessageIndex.value = -1
            })
        }
    } catch (error) {
        ElMessage.error('获取消息失败')
    } finally {
        loading.value = false
    }
}

// 获取最新的消息
const loadLatestMessage = async () => {
    try {
        const lastMessageId = messages.value.length > 0 
            ? messages.value[messages.value.length - 1].message_id 
            : undefined
            
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            message_id: lastMessageId,
            limit: 20
        })
        mergeNewMessages(data.resp_data)
    } catch (error) {
        console.error('获取最新消息失败', error)
    }
}

// 更新滚动位置状态
const updateScrollPosition = () => {
    if (!scrollbar.value?.wrapRef) return
    
    const scrollTop = scrollbar.value.wrapRef.scrollTop
    const scrollHeight = scrollbar.value.wrapRef.scrollHeight
    const clientHeight = scrollbar.value.wrapRef.clientHeight
    
    // 如果滚动位置在底部附近（允许20px的误差），视为在底部
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 20
}

// 发送消息 
const sendMessage = async () => {
    if (!newMessage.value.trim() || sending.value) return

    sending.value = true
    try {
        await sendMessageToGroup({
            group_id: groupId.value,
            content: newMessage.value.trim()
        })
        newMessage.value = ''
        
        // 发送后立即加载新消息以看到自己发送的内容
        await loadLatestMessage()
        scrollToBottom()
        
        // 确保我的消息不会被计为未读
        unreadCount.value = 0
        lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        firstNewMessageIndex.value = -1
    } catch (error) {
        ElMessage.error('发送消息失败')
    } finally {
        sending.value = false
    }
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        scrollbar.value?.setScrollTop(scrollbar.value?.wrapRef?.scrollHeight || 0)
        showScrollButton.value = false
        
        // 滚动到底部时重置未读计数
        unreadCount.value = 0
        
        // 标记所有消息为已读
        messages.value.forEach(msg => msg.isNew = false)
        
        // 清除新消息分隔线
        if (messages.value.length > 0) {
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        }
        firstNewMessageIndex.value = -1
    })
}

// 监控滚动情况，如果用户已经滚动到底部，则隐藏滚动按钮
const checkScrollToBottom = () => {
    updateScrollPosition()
    
    if (isAtBottom.value) {
        showScrollButton.value = false
        unreadCount.value = 0
        
        // 标记所有消息为已读
        messages.value.forEach(msg => msg.isNew = false)
        
        // 清除新消息分隔线
        if (messages.value.length > 0) {
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        }
        firstNewMessageIndex.value = -1
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
    
    // 设置轮询间隔
    getLatestMessageIntervalId.value = setInterval(() => {
        loadLatestMessage()
    }, 3000)
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
    position: relative;
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

.message-new .message-bubble {
    animation: highlight 2s ease-out;
}

@keyframes highlight {
    0% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
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

.new-message-divider {
    width: 100%;
    text-align: center;
    margin: 0.5rem 0;
    position: relative;
    height: 20px;
}

.new-message-divider span {
    display: inline-block;
    background-color: #ef4444;
    color: white;
    padding: 0.15rem 1rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    color: #6b7280;
    gap: 0.5rem;
}

.empty-message {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
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