<template>
  <details class="recent-activities-card" :open="modelValue">
    <summary class="card-header" @click.prevent="toggleExpand">
      <span class="card-title">{{ title }}</span>
      <el-icon class="toggle-icon" :class="{ 'is-rotate': modelValue }">
        <ArrowUp />
      </el-icon>
    </summary>
    <div class="card-content">
      <el-tabs class="nearby-tabs">
        <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.label">
          <slot :name="tab.name" :data="tab.data"></slot>
        </el-tab-pane>
      </el-tabs>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ArrowUp } from '@element-plus/icons-vue'
import { computed } from 'vue'

defineOptions({
  name: 'ActivitySidebar'
})

const props = withDefaults(defineProps<{
  title?: string
  modelValue?: boolean
  tabs: Array<{
    name: string
    label: string
    data?: any
  }>
}>(), {
  title: '附近动态',
  modelValue: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 使用计算属性来双向同步展开状态
const toggleExpand = (event: MouseEvent) => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.recent-activities-card {
  position: absolute;
  bottom: v.$space-lg;
  left: v.$space-md;
  right: v.$space-md;
  background-color: white;
  border-radius: v.$border-radius-lg;
  overflow: hidden;
  box-shadow: v.$shadow-sm;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
  
  /* 移除details标签的默认样式 */
  &::-webkit-details-marker {
    display: none;
  }
  
  /* 使用CSS动画处理展开/折叠效果 */
  &[open] .card-content {
    max-height: 250px;
    opacity: 1;
  }
  
  &:not([open]) .card-content {
    max-height: 0;
    opacity: 0;
  }

  .card-header {
    padding: v.$space-sm v.$space-md;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    list-style: none;
    
    /* 移除summary标签的默认样式 */
    &::-webkit-details-marker {
      display: none;
    }
  }

  .card-title {
    font-size: v.$font-size-lg;
    font-weight: 600;
    color: v.$text-color-primary;
  }

  .toggle-icon {
    transition: transform 0.3s ease;

    &.is-rotate {
      transform: rotate(180deg);
    }
  }

  .card-content {
    overflow-y: auto;
    transition: max-height 0.3s ease, opacity 0.2s ease;
  }

  // 自定义Tab样式
  .nearby-tabs {
    padding: 0 v.$space-sm;

    :deep(.el-tabs__nav-wrap)::after {
      height: 1px;
      background-color: #f5f5f5;
    }

    :deep(.el-tabs__item) {
      font-size: v.$font-size-md;
      height: 40px;
      line-height: 40px;
    }
  }
}

@include m.mobile {
  .recent-activities-card {
    bottom: v.$space-md;
    left: v.$space-sm;
    right: v.$space-sm;
  }
}
</style> 