<template>
  <div 
    class="wx-card" 
    :class="[
      { 'wx-card-hoverable': hoverable, 'wx-card-shadow': shadow }
    ]"
  >
    <div v-if="$slots.header || title" class="wx-card-header">
      <slot name="header">
        <div class="wx-card-title">{{ title }}</div>
      </slot>
    </div>
    <div class="wx-card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="wx-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WxCard'
})

defineProps<{
  title?: string
  hoverable?: boolean
  shadow?: boolean
}>()
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.wx-card {
  background-color: v.$background-color-white;
  border-radius: v.$border-radius-md;
  overflow: hidden;
  margin-bottom: v.$space-md;
  
  &.wx-card-shadow {
    box-shadow: v.$shadow-sm;
  }
  
  &.wx-card-hoverable {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: v.$shadow-md;
      transform: translateY(-2px);
    }
  }
  
  .wx-card-header {
    padding: v.$space-md;
    border-bottom: 1px solid v.$border-color-light;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .wx-card-title {
      font-size: 16px;
      font-weight: v.$font-weight-medium;
      color: v.$text-color-primary;
      margin: 0;
    }
  }
  
  .wx-card-body {
    padding: v.$space-md;
  }
  
  .wx-card-footer {
    padding: v.$space-md;
    border-top: 1px solid v.$border-color-light;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: v.$space-md;
  }
}
</style> 