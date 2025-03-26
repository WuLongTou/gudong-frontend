<template>
  <div class="activity-item" :class="activityClass">
    <div class="activity-avatar">
      <img :src="activity?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
        :alt="activity?.nickname || '用户'">
    </div>
    <div class="activity-info">
      <div class="activity-user">{{ activity?.nickname || '匿名用户' }}</div>
      <div class="activity-desc">
        <el-icon v-if="activityTypeIcon" class="activity-type-icon">
          <component :is="activityTypeIcon" />
        </el-icon>
        {{ activity?.activity_details || formatActivityType(activity?.activity_type) || '未知活动' }}
      </div>
      <div class="activity-meta">
        <span class="activity-distance">{{ formatDistance(activity?.distance || 0) }}</span>
        <span class="activity-time">{{ formatRelativeTime(activity?.created_at || '') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { UserFilled, ChatRound, House, ArrowRight, Bell } from '@element-plus/icons-vue'
import { useFormatters } from '~/composables/useFormatters'
import { useActivity } from '~/composables/useActivity'

defineOptions({
  name: 'ActivityCard'
})

const props = defineProps<{
  activity: any
}>()

const { formatDistance, formatRelativeTime } = useFormatters()
const { formatActivityType } = useActivity()

// 根据活动类型返回对应的图标
const activityTypeIcon = computed(() => {
  const type = props.activity?.activity_type
  if (!type) return null

  // 对应活动类型返回不同图标
  switch (type) {
    case 'USER_ONLINE':
    case 'USER_CHECKIN':
      return markRaw(UserFilled)
    case 'GROUP_CREATE':
      return markRaw(House)
    case 'GROUP_JOIN':
      return markRaw(ArrowRight)
    case 'GROUP_LEAVE':
      return markRaw(ArrowRight)
    case 'MESSAGE_SENT':
      return markRaw(ChatRound)
    default:
      return markRaw(Bell)
  }
})

// 根据活动类型返回样式类
const activityClass = computed(() => {
  const type = props.activity?.activity_type
  if (!type) return ''

  if (type.startsWith('USER_')) return 'user-activity'
  if (type.startsWith('GROUP_')) return 'group-activity'
  if (type.startsWith('MESSAGE_')) return 'message-activity'
  return ''
})
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.activity-item {
  padding: v.$space-sm v.$space-md;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid v.$border-color-extra-light;

  &:last-child {
    border-bottom: none;
  }

  &.user-activity .activity-type-icon {
    color: v.$text-color-primary;
  }

  &.group-activity .activity-type-icon {
    color: v.$text-color-primary;
  }

  &.message-activity .activity-type-icon {
    color: v.$text-color-primary;
  }
}

.activity-avatar {
  width: v.$space-xl + v.$space-sm;
  height: v.$space-xl + v.$space-sm;
  border-radius: v.$border-radius-round;
  overflow: hidden;
  margin-right: v.$space-sm;
  flex-shrink: 0;
  background-color: v.$background-color-light;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-user {
  font-weight: v.$font-weight-medium;
  color: v.$text-color-primary;
  font-size: v.$font-size-md;
  margin-bottom: v.$space-xs;
  @include m.text-ellipsis;
}

.activity-desc {
  color: v.$text-color-regular;
  font-size: v.$font-size-sm;
  margin-bottom: v.$space-xs;
  @include m.text-ellipsis(2);
  display: flex;
  align-items: center;
}

.activity-type-icon {
  margin-right: v.$space-xs;
  font-size: v.$font-size-sm;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time,
.activity-distance {
  color: v.$text-color-secondary;
  font-size: v.$font-size-xs;
}
</style>