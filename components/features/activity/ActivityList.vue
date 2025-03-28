<template>
  <div class="activity-list" :class="{ 'is-loading': loading, 'is-empty': !hasActivities }">
    <div v-if="loading" class="activity-list-loading">
      <el-skeleton :rows="2" animated />
    </div>

    <div v-else-if="hasActivities">
      <div 
        v-for="activity in activities" 
        :key="activity.id || activity.group_id || activity.user_id"
        class="activity-card"
        @click="$emit('activity-click', activity.id || activity.group_id || activity.user_id)" 
      >
        <div class="activity-avatar">
          <img :src="activity.avatar_url || defaultAvatar" :alt="activity.user_name">
        </div>
        
        <div class="activity-content">
          <div class="activity-header">
            <span class="activity-user">{{ activity.user_name }}</span>
          </div>
          
          <div class="activity-body">
            <el-icon v-if="getActivityIcon(activity)" class="activity-icon">
              <component :is="getActivityIcon(activity)" />
            </el-icon>
            
            <span class="activity-desc">
              <strong v-if="activity.group_name">{{ activity.group_name }}:</strong> 
              {{ activity.description || getDefaultDescription(activity) }}
            </span>
          </div>
          
          <div class="activity-footer">
            <span class="activity-distance" v-if="activity.distance !== undefined">
              {{ formatDistance(activity.distance) }}
            </span>
            <span class="activity-time">
              {{ formatRelativeTime(activity.occurred_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="activity-list-empty">
      <el-empty :description="emptyText" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { markRaw } from 'vue'
import { 
  User, House, ArrowRight, ChatLineRound, Location 
} from '@element-plus/icons-vue'
import { ActivityType } from '~/types/api/activity'
import type { ActivityDetail } from '~/types/api/activity'
import { useFormatters } from '~/composables/useFormatters'

defineOptions({
  name: 'ActivityList'
})

const props = withDefaults(defineProps<{
  activities: ActivityDetail[]
  loading?: boolean
  emptyText?: string
}>(), {
  loading: false,
  emptyText: '暂无活动'
})

defineEmits<{
  'activity-click': [id: string]
}>()

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const { formatDistance, formatRelativeTime } = useFormatters()
const hasActivities = computed(() => props.activities && props.activities.length > 0)

function getActivityIcon(activity: ActivityDetail) {
  const icons: Record<string, any> = {
    [ActivityType.UserCheckedIn]: markRaw(Location),
    [ActivityType.GroupCreated]: markRaw(House),
    [ActivityType.UserJoined]: markRaw(ArrowRight),
    [ActivityType.MessageSent]: markRaw(ChatLineRound)
  }
  
  return activity.activity_type ? icons[activity.activity_type] || null : markRaw(User)
}

function getDefaultDescription(activity: ActivityDetail): string {
  if (!activity.activity_type) {
    return `${activity.user_name}在附近活动`
  }
  
  const descriptions: Record<string, string> = {
    [ActivityType.UserCheckedIn]: `${activity.user_name}在附近签到`,
    [ActivityType.GroupCreated]: `${activity.user_name}创建了群组`,
    [ActivityType.UserJoined]: `${activity.user_name}加入了群组`,
    [ActivityType.MessageSent]: `${activity.user_name}发送了一条消息`
  }
  
  return descriptions[activity.activity_type] || `${activity.user_name}有了新动态`
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.activity-list {
  background-color: #fff;
  border-radius: v.$border-radius-md;
  overflow: hidden;
  
  &.is-empty, &.is-loading {
    padding: v.$space-md;
  }
  
  &.is-empty {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.activity-list-loading :deep(.el-skeleton) {
  margin-bottom: v.$space-md;
}

.activity-list-empty {
  width: 100%;
  padding: v.$space-lg 0;
}

.activity-card {
  padding: v.$space-sm v.$space-md;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid v.$border-color-extra-light;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: v.$background-color-light;
  }
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
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

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  margin-bottom: v.$space-xs;
}

.activity-user {
  font-weight: v.$font-weight-medium;
  color: v.$text-color-primary;
  font-size: v.$font-size-md;
  @include m.text-ellipsis;
}

.activity-body {
  color: v.$text-color-regular;
  font-size: v.$font-size-sm;
  margin-bottom: v.$space-xs;
  display: flex;
  align-items: flex-start;
}

.activity-desc {
  @include m.text-ellipsis(2);
  
  strong {
    font-weight: v.$font-weight-medium;
    margin-right: v.$space-xs;
  }
}

.activity-icon {
  margin-right: v.$space-xs;
  font-size: v.$font-size-sm;
  color: v.$text-color-primary;
  margin-top: 2px;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: v.$font-size-xs;
  color: v.$text-color-secondary;
}
</style>