<template>
  <button
    class="wx-button"
    :class="[
      `btn-${type}`,
      { 'btn-block': block, 'btn-round': round, 'btn-disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <el-icon v-if="icon" class="btn-icon">
      <component :is="icon"></component>
    </el-icon>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WxButton'
})

const props = defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  icon?: string
  round?: boolean
  block?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.wx-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: white;
  color: v.$text-color-primary;
  font-size: v.$font-size-md;
  border-radius: v.$border-radius-md;
  padding: 8px 16px;
  transition: all 0.3s ease;
  font-weight: 500;
  
  .btn-icon {
    margin-right: 6px;
  }
  
  &.btn-block {
    display: flex;
    width: 100%;
  }
  
  &.btn-round {
    border-radius: 20px;
  }
  
  &.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.btn-primary {
    background-color: v.$primary-color;
    color: white;
    
    &:hover:not(.btn-disabled) {
      background-color: v.$primary-color-dark;
    }
    
    &:active:not(.btn-disabled) {
      background-color: v.$primary-color-darker;
    }
  }
  
  &.btn-success {
    background-color: v.$success-color;
    color: white;
    
    &:hover:not(.btn-disabled) {
      background-color: v.$success-color-dark;
    }
  }
  
  &.btn-warning {
    background-color: v.$warning-color;
    color: white;
    
    &:hover:not(.btn-disabled) {
      background-color: v.$warning-color-dark;
    }
  }
  
  &.btn-danger {
    background-color: v.$danger-color;
    color: white;
    
    &:hover:not(.btn-disabled) {
      background-color: v.$danger-color-dark;
    }
  }
  
  &.btn-info {
    background-color: v.$info-color;
    color: white;
    
    &:hover:not(.btn-disabled) {
      background-color: v.$info-color-dark;
    }
  }
  
  &.btn-default {
    background-color: white;
    color: v.$text-color-primary;
    border: 1px solid v.$border-color;
    
    &:hover:not(.btn-disabled) {
      border-color: v.$primary-color;
      color: v.$primary-color;
    }
  }
}
</style> 