<template>
    <div class="chat-container">
        <!-- 头部 -->
        <div class="chat-header">
            <div>
                <h1 class="group-title">{{ groupInfo.name }}</h1>
                <p class="location-text">位置：{{ groupInfo.location_name }}</p>
            </div>
            <el-button type="primary" @click="onLeaveGroup" round>返回主页</el-button>
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
                        <!-- 时间分隔条 -->
                        <div v-if="shouldShowTimeDivider(msg, index)" class="time-divider">
                            <span>{{ formatters.formatTimeDivider(msg.created_at) }}</span>
                        </div>
                        
                        <!-- 新消息分隔线 -->
                        <div v-if="index === firstNewMessageIndex" class="new-message-divider">
                            <span>新消息</span>
                        </div>
                        
                        <!-- 消息项 -->
                        <div :class="[
                            'message-item',
                            isCurrentUser(msg.user_id) ? 'message-self' : 'message-other',
                            msg.isNew ? 'message-new' : '',
                            shouldGroupWithPrevious(msg, index) ? 'message-grouped' : ''
                        ]">
                            <!-- 头像 -->
                            <div v-if="!isCurrentUser(msg.user_id) && !shouldGroupWithPrevious(msg, index)" class="avatar-container">
                                <div class="avatar" :style="{ backgroundColor: getUserColor(msg.user_id) }">
                                    {{ msg.nickname.charAt(0) }}
                                </div>
                            </div>
                            <div v-else-if="!isCurrentUser(msg.user_id)" class="avatar-placeholder"></div>
                            
                            <div class="message-content-wrapper">
                                <!-- 发送者名称 (仅在群组中的第一条消息显示) -->
                                <div v-if="!isCurrentUser(msg.user_id) && !shouldGroupWithPrevious(msg, index)" 
                                    class="message-sender" 
                                    :style="{ color: getUserColor(msg.user_id) }">
                                    {{ msg.nickname }}
                                </div>
                                
                                <div :class="[
                                    'message-bubble',
                                    isCurrentUser(msg.user_id) ? 'message-bubble-self' : 'message-bubble-other',
                                    shouldGroupWithPrevious(msg, index) ? 'message-bubble-grouped' : ''
                                ]">
                                    <p class="message-text">{{ msg.content }}</p>
                                </div>
                                
                                <div class="message-time-indicator">
                                    <span class="message-time">{{ formatters.formatMessageTime(msg.created_at) }}</span>
                                </div>
                            </div>
                            
                            <!-- 右侧头像占位 -->
                            <div v-if="isCurrentUser(msg.user_id)" class="avatar-placeholder"></div>
                        </div>
                    </template>
                </div>
                
                <!-- 空消息提示 -->
                <div v-if="messages.length === 0 && !loading" class="chat-empty-message">
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
                show-word-limit clearable @focus="handleFocus" @blur="handleBlur" round>
                <template #append>
                    <el-button @click="sendMessage" type="primary" :loading="sending" round>发送</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowDown, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendMessageToGroup, queryMessageFromGroup } from '~/utils/api/modules/message'
import { leaveGroup, queryGroupById } from '~/utils/api/modules/group'
import type { GroupMessage } from '~/types'
import { useUserStore } from '~/stores/user'
import { useFormatters } from '~/composables/useFormatters'

const userStore = useUserStore()
const formatters = useFormatters()

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
const userColorMap = ref<Record<string, string>>({})

// 预定义的头像颜色数组
const avatarColors = [
    '#3498db', '#9b59b6', '#e74c3c', '#1abc9c', 
    '#f1c40f', '#e67e22', '#2ecc71', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#f39c12'
]

// 获取群组信息
const groupInfo = ref<{
    name: string;
    location_name: string;
}>({
    name: '加载中...',
    location_name: '加载中...'
})

// 获取用户的头像颜色
const getUserColor = (userId: string): string => {
    // 如果已经分配了颜色，直接返回
    if (userColorMap.value[userId]) {
        return userColorMap.value[userId]
    }
    
    // 为用户分配新颜色
    const colorIndex = Object.keys(userColorMap.value).length % avatarColors.length
    const color = avatarColors[colorIndex]
    userColorMap.value[userId] = color
    
    return color
}

// 检查是否需要显示时间分隔条
const shouldShowTimeDivider = (currentMsg: GroupMessage, index: number): boolean => {
    // 第一条消息总是显示时间分隔条
    if (index === 0) return true
    
    // 获取前一条消息
    const prevMsg = messages.value[index - 1]
    
    // 使用格式化工具检查时间间隔
    return formatters.isTimeGapGreaterThan(currentMsg.created_at, prevMsg.created_at, 15)
}

// 检查消息是否应该与前一条消息分组显示
const shouldGroupWithPrevious = (currentMsg: GroupMessage, index: number): boolean => {
    // 第一条消息不能与前一条分组
    if (index === 0) return false
    
    // 获取前一条消息
    const prevMsg = messages.value[index - 1]
    
    // 如果发送者不同，不能分组
    if (currentMsg.user_id !== prevMsg.user_id) return false
    
    // 如果中间有时间分隔条，不能分组
    if (shouldShowTimeDivider(currentMsg, index)) return false
    
    // 使用formatters检查时间间隔
    return formatters.isTimeGapGreaterThan(currentMsg.created_at, prevMsg.created_at, 2) === false
}

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
    const existingMessageIds = new Set(messages.value.map((m) => m.message_id));
    const newMessages = msg_received.filter(
        (msg) => !existingMessageIds.has(msg.message_id)
    ).map((msg) => ({
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
        const myUserId = userStore.userId;
        unreadCount.value += newMessages.filter((msg: GroupMessage) => msg.user_id !== myUserId).length;
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
        
        const hasMessages = mergeNewMessages(data.resp_data as GroupMessage[]);
        
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
        
        const hasOlderMessages = mergeNewMessages(data.resp_data as GroupMessage[], true);
        
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
        
        mergeNewMessages(data.resp_data as GroupMessage[]);
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
        if (messages.value.some((msg: GroupMessage & { isNew?: boolean }) => msg.isNew)) {
            messages.value.forEach((msg: GroupMessage & { isNew?: boolean }) => {
                if (msg.isNew) msg.isNew = false;
            });
        }
        
        // 清除新消息分隔线
        if (messages.value.length > 0) {
            lastReadMessageId.value = messages.value[messages.value.length - 1].message_id
        }
        firstNewMessageIndex.value = -1
    });
}

// 判断当前用户（需要根据你的用户系统实现）
const isCurrentUser = (senderId: string) => {
    return senderId === userStore.userId
}

// 离开群组
const onLeaveGroup = async () => {
    try {
        await leaveGroup(groupId.value)
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

<style lang="scss">
@use '~/assets/scss/pages/group-chat';
</style>