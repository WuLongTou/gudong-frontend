<template>
  <div class="wx-empty">
    <el-icon v-if="icon" class="wx-empty-icon">
      <component :is="icon"></component>
    </el-icon>
    <div v-else class="wx-empty-image">
      <slot name="image"></slot>
    </div>
    <div class="wx-empty-message">
      <slot>{{ message || '暂无数据' }}</slot>
    </div>
    <div v-if="$slots.action" class="wx-empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WxEmpty'
})

defineProps<{
  icon?: string
  message?: string
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;

.wx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: v.$space-xl 0;
  text-align: center;
  
  .wx-empty-icon {
    font-size: 48px;
    color: v.$text-color-light;
    margin-bottom: v.$space-md;
  }
  
  .wx-empty-image {
    margin-bottom: v.$space-md;
  }
  
  .wx-empty-message {
    font-size: v.$font-size-md;
    color: v.$text-color-secondary;
    max-width: 300px;
    margin: 0 auto;
    line-height: 1.5;
  }
  
  .wx-empty-action {
    margin-top: v.$space-lg;
  }
}
</style> 