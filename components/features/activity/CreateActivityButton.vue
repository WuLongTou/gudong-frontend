<template>
  <div class="create-activity-btn" @click="$emit('click')">
    <el-icon>
      <Edit />
    </el-icon>
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'

defineOptions({
  name: 'CreateActivityButton'
})

withDefaults(defineProps<{
  text?: string
}>(), {
  text: '发布动态'
})

defineEmits<{
  click: []
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;

.create-activity-btn {
  position: absolute;
  bottom: v.$space-lg;
  right: v.$space-md;
  width: 120px;
  height: 40px;
  background-color: v.$primary-color;
  color: white;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 5;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(7, 193, 96, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style> 