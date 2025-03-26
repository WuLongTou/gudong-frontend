<template>
  <div 
    class="wx-avatar" 
    :class="[
      `wx-avatar-${size}`,
      { 'wx-avatar-clickable': clickable }
    ]"
    @click="handleClick"
  >
    <img v-if="src" :src="src" :alt="alt" @error="handleError">
    <div v-else class="wx-avatar-fallback">
      <span v-if="text">{{ formatText }}</span>
      <el-icon v-else>
        <User />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

defineOptions({
  name: 'WxAvatar'
})

const props = defineProps<{
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  clickable?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
  error: [event: Event]
}>()

const imgError = ref(false)

const handleError = (event: Event) => {
  imgError.value = true
  emit('error', event)
}

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const formatText = computed(() => {
  if (!props.text) return ''
  // 取首字母或中文第一个字
  return props.text.charAt(0).toUpperCase()
})
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.wx-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: v.$border-radius-round;
  background-color: v.$background-color-light;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.wx-avatar-clickable {
    cursor: pointer;
    transition: transform v.$transition-fast;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .wx-avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: v.$text-color-secondary;
    font-weight: v.$font-weight-medium;
    background-color: v.$background-color-light;
  }
  
  &.wx-avatar-sm {
    width: v.$space-xl;
    height: v.$space-xl;
    
    .el-icon {
      font-size: v.$font-size-lg;
    }
    
    .wx-avatar-fallback span {
      font-size: v.$font-size-md;
    }
  }
  
  &.wx-avatar-md {
    width: v.$space-xl + v.$space-sm;
    height: v.$space-xl + v.$space-sm;
    
    .el-icon {
      font-size: v.$font-size-xl;
    }
    
    .wx-avatar-fallback span {
      font-size: v.$font-size-lg;
    }
  }
  
  &.wx-avatar-lg {
    width: v.$space-xl * 2;
    height: v.$space-xl * 2;
    
    .el-icon {
      font-size: v.$font-size-xl * 1.75;
    }
    
    .wx-avatar-fallback span {
      font-size: v.$font-size-xl * 1.3;
    }
  }
  
  &.wx-avatar-xl {
    width: v.$space-xl * 2.5;
    height: v.$space-xl * 2.5;
    
    .el-icon {
      font-size: v.$font-size-xl * 2.2;
    }
    
    .wx-avatar-fallback span {
      font-size: v.$font-size-xl * 1.65;
    }
  }
}
</style> 