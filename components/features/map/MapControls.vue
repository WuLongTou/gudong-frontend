<template>
  <div class="map-controls">
    <div class="map-control-btn zoom-in" @click="$emit('control', 'zoomIn')">
      <el-icon>
        <Plus />
      </el-icon>
    </div>
    <div class="map-control-btn zoom-out" @click="$emit('control', 'zoomOut')">
      <el-icon>
        <Minus />
      </el-icon>
    </div>
    <div class="map-control-btn locate-me" @click="$emit('control', 'locateMe')">
      <el-icon>
        <Aim />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Minus, Aim } from '@element-plus/icons-vue'

defineOptions({
  name: 'MapControls'
})

defineEmits<{
  control: [type: 'zoomIn' | 'zoomOut' | 'locateMe']
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.map-controls {
  position: absolute;
  right: v.$space-lg;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  z-index: 5;
  border-radius: v.$border-radius-lg;
  overflow: hidden;
  box-shadow: v.$shadow-md;

  .map-control-btn {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: v.$background-color-white;
    cursor: pointer;
    transition: all v.$transition-fast;
    
    .el-icon {
      font-size: 22px;
      color: v.$text-color-primary;
    }

    &:hover {
      background-color: v.$background-color-light;
      
      .el-icon {
        color: v.$primary-color;
        transform: scale(1.05);
      }
    }

    &:active {
      background-color: v.$background-color-base;
      transform: scale(0.98);
    }

    & + .map-control-btn {
      border-top: 1px solid v.$border-color-light;
    }
    
    &.locate-me {
      .el-icon {
        color: v.$primary-color;
      }
      
      &:hover .el-icon {
        color: v.$primary-color-dark;
      }
    }
  }
}

// 响应式调整
@include m.mobile {
  .map-controls {
    right: v.$space-md;
    top: 50%;
    
    .map-control-btn {
      width: 42px;
      height: 42px;
      
      .el-icon {
        font-size: 20px;
      }
    }
  }
}
</style> 