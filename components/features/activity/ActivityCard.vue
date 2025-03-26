<template>
  <div class="activity-item">
    <div class="activity-avatar">
      <img :src="activity?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
        :alt="activity?.nickname || '用户'">
    </div>
    <div class="activity-info">
      <div class="activity-user">{{ activity?.nickname || '匿名用户' }}</div>
      <div class="activity-desc">{{ activity?.activity_details || activity?.activity_type || '未知活动' }}</div>
      <div class="activity-meta">
        <span class="activity-distance">{{ formatDistance(activity?.distance || 0) }}</span>
        <span class="activity-time">{{ formatRelativeTime(activity?.created_at || '') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '~/composables/useFormatters'

defineOptions({
  name: 'ActivityCard'
})

const props = defineProps<{
  activity: any
}>()

const { formatDistance, formatRelativeTime } = useFormatters()
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