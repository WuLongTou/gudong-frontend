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
        <el-scrollbar class="message-area" ref="scrollbar" @scroll="handleScroll">
            <div class="message-list-container">
                <!-- 加载更早消息指示器 -->
                <div v-if="loadingOlder" class="loading-indicator loading-indicator-small">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>加载更早消息...</span>
                </div>

                <!-- 没有更多消息提示 -->
                <div v-if="!hasMoreMessages && messages.length > 0 && !loadingOlder" class="no-more-messages">
                    没有更早的消息了
                </div>

                <!-- 主加载状态 -->
                <div v-if="loading && !loadingOlder && messages.length === 0" class="loading-indicator">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>加载消息中...</span>
                </div>

                <div class="message-list">
                    <!-- 消息列表 -->
                    <template v-for="(msg, index) in messages" :key="msg.message_id">
                        <!-- 新消息分隔线 -->
                        <div v-if="index === firstNewMessageIndex" class="new-message-divider">
                            <span>新消息</span>
                        </div>
                        
                        <!-- 消息项 -->
                        <div :class="[
                            'message-item',
                            isCurrentUser(msg.user_id) ? 'message-self' : 'message-other',
                            msg.isNew ? 'message-new' : ''
                        ]">
                            <div :class="[
                                'message-bubble',
                                isCurrentUser(msg.user_id) ? 'message-bubble-self' : 'message-bubble-other'
                            ]">
                                <p class="message-content">
                                    <span class="message-sender-inline">{{ msg.nickname }}：</span>
                                    {{ msg.content }}
                                </p>
                                <div class="message-meta">
                                    <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                
                <!-- 空消息提示 -->
                <div v-if="messages.length === 0 && !loading" class="empty-message">
                    <p>暂无消息，发送第一条消息吧</p>
                </div>
            </div>
        </el-scrollbar>
        
        <!-- 返回底部按钮 -->
        <div v-if="showScrollButton" class="scroll-button">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
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
                show-word-limit clearable @focus="handleFocus" @blur="handleBlur">
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
const getLatestMessageIntervalId = ref<NodeJS.Timeout | null>(null)
const loading = ref(true)
const loadingOlder = ref(false)
const sending = ref(false)
const isAtBottom = ref(true)
const unreadCount = ref(0)
const firstNewMessageIndex = ref(-1)
const lastReadMessageId = ref('')
const oldestMessageId = ref('')
const hasMoreMessages = ref(true)
const isScrollingUp = ref(false)
const lastScrollTop = ref(0)
const scrollPositionBeforeLoad = ref(0)

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
const mergeNewMessages = (msg_received: GroupMessage[], prepend = false) => {
    // 空消息检查
    if (!msg_received || msg_received.length === 0) {
        if (prepend) {
            hasMoreMessages.value = false;
        }
        return false;
    }

    // 使用Set高效去重（简化旧的复杂逻辑）
    const existingMessageIds = new Set(messages.value.map(m => m.message_id));
    const newMessages = msg_received.filter(
        msg => !existingMessageIds.has(msg.message_id)
    ).map(msg => ({
        ...msg,
        isNew: !prepend
    }));

    if (newMessages.length === 0) return false;

    // 记录滚动位置，用于滚动恢复
    if (prepend && scrollbar.value?.wrapRef) {
        scrollPositionBeforeLoad.value = scrollbar.value.wrapRef.scrollTop;
    } else {
        updateScrollPosition();
    }

    // 更新最后读取的消息ID
    if (messages.value.length > 0 && lastReadMessageId.value === '' && !prepend) {
        lastReadMessageId.value = messages.value[messages.value.length - 1].message_id;
    }

    // 直接添加到数组前面或后面，避免不必要的排序操作
    if (prepend) {
        messages.value = [...newMessages, ...messages.value];
        // 更新最早的消息ID
        oldestMessageId.value = newMessages[0].message_id;
    } else {
        messages.value = [...messages.value, ...newMessages];
    }

    // 只在需要时更新新消息指示器
    if (lastReadMessageId.value && firstNewMessageIndex.value === -1 && !prepend) {
        const lastReadIndex = messages.value.findIndex(m => m.message_id === lastReadMessageId.value);
        if (lastReadIndex !== -1) {
            firstNewMessageIndex.value = lastReadIndex + 1;
        }
    }

    // 处理滚动和未读计数
    if (isAtBottom.value && !prepend) {
        // 使用requestAnimationFrame优化滚动性能
        requestAnimationFrame(scrollToBottom);
        
        // 已读所有消息
        unreadCount.value = 0;
        lastReadMessageId.value = messages.value[messages.value.length - 1].message_id;
        firstNewMessageIndex.value = -1;
    } else if (!prepend) {
        // 更新未读消息数
        const myUserId = $storage.getItem('user_id');
        unreadCount.value += newMessages.filter(msg => msg.user_id !== myUserId).length;
        showScrollButton.value = true;
    }
    
    // 恢复滚动位置
    if (prepend) {
        nextTick(() => {
            if (scrollbar.value?.wrapRef) {
                requestAnimationFrame(() => {
                    scrollbar.value.setScrollTop(scrollPositionBeforeLoad.value + 10);
                });
            }
        });
    }
    
    return true;
};

// 获取消息历史（初始加载）
const loadHistoryMessage = async () => {    
    loading.value = true;
    
    try {
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            limit: -30  // 一次加载更多消息，减少后续加载频率
        });
        
        const hasMessages = mergeNewMessages(data.resp_data);
        
        if (hasMessages) {
            nextTick(() => {
                scrollToBottom();
                if (messages.value.length > 0) {
                    // 更新最早的消息ID (优化初始加载后的状态)
                    oldestMessageId.value = messages.value[0].message_id;
                }
            });
        }
    } catch (error) {
        console.error('获取消息失败', error);
        ElMessage.error('获取消息失败');
    } finally {
        loading.value = false;
    }
};

// 加载更早的消息 (简化版本)
const loadOlderMessages = async () => {
    if (loadingOlder.value || !hasMoreMessages.value || !oldestMessageId.value) return;
    
    loadingOlder.value = true;
    
    try {
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            message_id: oldestMessageId.value,
            limit: -20
        });
        
        const hasOlderMessages = mergeNewMessages(data.resp_data, true);
        
        if (!hasOlderMessages || data.resp_data.length < 5) {
            hasMoreMessages.value = false;
        }
    } catch (error) {
        console.error('获取更早消息失败', error);
    } finally {
        // 直接关闭加载状态，不使用延迟
        loadingOlder.value = false;
    }
};

// 获取最新的消息 (简化版本)
const loadLatestMessage = async () => {
    if (messages.value.length === 0) {
        return loadHistoryMessage();
    }
    
    try {
        const lastMessageId = messages.value[messages.value.length - 1].message_id;
        
        const data = await queryMessageFromGroup({
            group_id: groupId.value,
            message_id: lastMessageId,
            limit: 10
        });
        
        mergeNewMessages(data.resp_data);
    } catch (error) {
        console.error('获取最新消息失败', error);
    }
};

// 防抖函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;
    return function(this: any, ...args: Parameters<T>) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
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
    } else {
        showScrollButton.value = true
    }
}

// 使用防抖优化滚动检测
const debouncedCheckScrollToBottom = debounce(checkScrollToBottom, 100);

// 滚动处理
const handleScroll = () => {
    if (!scrollbar.value?.wrapRef) return;
    
    const scrollTop = scrollbar.value.wrapRef.scrollTop;
    
    // 检测滚动方向
    isScrollingUp.value = scrollTop < lastScrollTop.value;
    lastScrollTop.value = scrollTop;
    
    // 用户滚动到顶部时自动加载更早消息（优化阈值和检测条件）
    if (scrollTop < 50 && isScrollingUp.value && hasMoreMessages.value && !loadingOlder.value) {
        loadOlderMessages();
    }
    
    // 使用防抖处理滚动到底部检测，提高性能
    debouncedCheckScrollToBottom();
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
    if (!scrollbar.value?.wrapRef) return;
    
    // 使用requestAnimationFrame优化性能
    requestAnimationFrame(() => {
        scrollbar.value.setScrollTop(scrollbar.value.wrapRef.scrollHeight || 0)
        showScrollButton.value = false
        
        // 滚动到底部时重置未读计数
        unreadCount.value = 0
        
        // 标记所有消息为已读，使用高效的方式
        if (messages.value.some(msg => msg.isNew)) {
            messages.value.forEach(msg => msg.isNew = false)
        }
        
        // 清除新消息分隔线
        if (messages.value.length > 0) {
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        }
        firstNewMessageIndex.value = -1
    });
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

// 处理iOS键盘弹出问题
const handleFocus = () => {
    // 键盘弹出时，滚动到底部
    setTimeout(() => {
        scrollToBottom();
    }, 300);
}

// 处理iOS键盘收起问题
const handleBlur = () => {
    // 键盘收起时，重新调整视图
    setTimeout(() => {
        if (isAtBottom.value) {
            scrollToBottom();
        }
    }, 300);
}

onMounted(() => {
    // 立即加载消息，不使用Promise.all(这会导致等待两个请求都完成)
    loadHistoryMessage();
    loadGroupInfo();
    
    // 使用合理的轮询间隔 (3秒，便于测试)
    getLatestMessageIntervalId.value = setInterval(() => {
        if (!loadingOlder.value && !loading.value) {
            loadLatestMessage();
        }
    }, 3000);
    
    // 监听窗口大小变化，以优化在不同设备上的显示
    window.addEventListener('resize', handleResize);
    handleResize();
})

onUnmounted(() => {
    if (getLatestMessageIntervalId.value) {
        clearInterval(getLatestMessageIntervalId.value)
    }
    // 记得移除事件监听器
    window.removeEventListener('resize', handleResize);
})

// 处理窗口大小变化
const handleResize = () => {
    // 解决移动端100vh问题
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 如果在底部，保持在底部
    if (isAtBottom.value) {
        nextTick(() => {
            scrollToBottom();
        });
    }
}
</script>

<style scoped>
.chat-container {
    /* 使用CSS变量而不是100vh，避免在移动端出现问题 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: 100vh; /* 回退方案 */
    height: calc(var(--vh, 1vh) * 100); /* 使用CSS变量 */
    overflow: hidden;
    /* 增加安全区域的支持 */
    padding-bottom: env(safe-area-inset-bottom);
    background-color: #f5f7fa;
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
    background-color: #f5f7fa;
    /* 确保内容可滚动，避免iOS弹性滚动问题 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.message-list-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.5rem;
}

.message-item {
    display: flex;
    position: relative;
    animation: message-fade-in 0.3s ease-out;
}

@keyframes message-fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-bubble-self {
    background-color: #dbeafe;
    border-bottom-right-radius: 0.1rem;
}

.message-bubble-other {
    background-color: white;
    border-bottom-left-radius: 0.1rem;
}

.message-new .message-bubble {
    animation: highlight 2s ease-out;
}

@keyframes highlight {
    0% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
    100% { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
}

.message-sender {
    color: #1f2937;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
}

.message-sender-inline {
    font-weight: 500;
    color: #4b5563;
    margin-right: 4px;
}

.message-content {
    color: #1f2937;
    line-height: 1.4;
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
    right: 1%;
    bottom: 80px;
    z-index: 10;
    transform: translateY(-50%);
    transition: opacity 0.2s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.scroll-button-inner {
    opacity: 0.9;
    transition: all 0.3s;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: scale(1);
}

.scroll-button-inner:hover {
    opacity: 1;
    transform: scale(1.05);
}

.input-area {
    border-top: 1px solid #e5e7eb;
    padding: 1rem;
    background-color: white;
    min-height: 4rem;
    max-height: 8rem;
    /* 添加安全底部距离，避免被底部菜单遮挡 */
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
    /* 确保输入区域不会被浏览器底部导航栏遮挡 */
    position: relative;
    z-index: 10;
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

.loading-indicator-small {
    padding: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.8;
    animation: fade-in 0.3s ease-in-out;
}

.no-more-messages {
    text-align: center;
    color: #9ca3af;
    font-size: 0.75rem;
    padding: 0.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.8;
    animation: fade-in 0.5s ease-in-out;
    user-select: none;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 0.8;
    }
}

.empty-message {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    margin: auto 0;
    user-select: none;
}

/* 添加触摸优化 */
@media (hover: none) and (pointer: coarse) {
    .message-bubble {
        /* 增加触摸目标大小 */
        padding: 0.85rem;
    }
    
    .scroll-button-inner {
        width: 46px;
        height: 46px;
    }
    
    /* 优化滑动手感 */
    .message-area {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        overscroll-behavior-y: contain;
    }
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
        /* 更新安全距离 */
        padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
    }

    .scroll-button {
        right: 4%;
        bottom: 76px;
    }
    
    .scroll-button-inner {
        width: 38px;
        height: 38px;
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
        /* 更新安全距离 */
        padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
    }

    .message-list {
        gap: 0.5rem;
    }
}

/* 针对虚拟键盘弹出的情况 */
@media (max-height: 400px) {
    .chat-header {
        min-height: 2.5rem;
        padding: 0.25rem 0.5rem;
    }
    
    .group-title {
        font-size: 1rem;
    }
    
    .location-text {
        font-size: 0.75rem;
    }
    
    .scroll-button {
        bottom: 3.5rem;
    }
}
</style>