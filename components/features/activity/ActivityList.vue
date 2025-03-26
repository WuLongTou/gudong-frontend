<template>
  <div class="activities-list">
    <client-only>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="activities && activities.length > 0">
        <ActivityCard 
          v-for="(item, index) in activities" 
          :key="index" 
          :activity="item"
          @click="$emit('activity-click', item)"
        />
      </div>
      <div v-else-if="error" class="error-message">
        <el-alert :title="error" type="error" show-icon />
      </div>
      <div v-else class="no-activities">
        {{ emptyText }}
      </div>
      <template #fallback>
        <div class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import ActivityCard from './ActivityCard.vue'

defineOptions({
  name: 'ActivityList'
})

withDefaults(defineProps<{
  activities: any[]
  loading?: boolean
  error?: string
  emptyText?: string
}>(), {
  loading: false,
  error: '',
  emptyText: '附近暂无活动，来创建第一个活动吧！'
})

defineEmits<{
  'activity-click': [activity: any]
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;

.activities-list {
  display: flex;
  flex-direction: column;
}

.loading-container {
  padding: v.$space-md;
}

.error-message {
  padding: v.$space-md;
}

.no-activities {
  padding: v.$space-md;
  text-align: center;
  color: v.$text-color-secondary;
  font-size: v.$font-size-md;
}
</style> 