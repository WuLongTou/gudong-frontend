<template>
  <div class="top-info-bar">
    <div class="top-info-container">
      <!-- 左侧位置信息 -->
      <div class="top-location-info">
        <el-icon class="location-icon">
          <Location />
        </el-icon>
        <span class="location-name">{{ locationName }}</span>
      </div>
      
      <!-- 右侧用户信息 -->
      <div class="top-user-info" @click="onUserClick">
        <span class="username">{{ nickname }}</span>
        <el-avatar :src="avatar" class="user-avatar" />
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { Location, User } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useUserStore } from '~/stores/user'

defineOptions({
  name: 'TopInfoBar'
})

const props = defineProps<{
  locationName: string
}>()

const emit = defineEmits<{
  'user-click': []
}>()

// 使用用户状态
const userStore = useUserStore()
const nickname = computed(() => userStore.nickname || '游客')
const avatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 处理用户头像点击
function onUserClick() {
  emit('user-click')
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

/* 
 * 使用深度选择器和更具体的CSS选择器来提高样式优先级
 * 避免使用!important标记
 */
.top-info-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: v.$background-color-white;
  box-shadow: v.$shadow-sm;
  z-index: v.$z-index-fixed;
  
  .top-info-container {
    min-height: v.$header-height;
    padding: 0 v.$space-md;
    display: flex;
    align-items: center;
    flex-wrap: wrap; // 默认允许换行
    gap: v.$space-xs; // 元素间距
  }
  
  .top-location-info {
    display: flex;
    align-items: center;
    gap: v.$space-sm;
    min-width: 0; // 避免溢出
    
    .location-icon {
      color: v.$primary-color;
      font-size: v.$font-size-xl;
      flex-shrink: 0;
    }
    
    .location-name {
      font-size: v.$font-size-lg;
      font-weight: v.$font-weight-medium;
      color: v.$text-color-primary;
      @include m.text-ellipsis(1);
    }
  }
  
  .top-user-info {
    display: flex;
    align-items: center;
    gap: v.$space-sm;
    cursor: pointer;
    padding: v.$space-xs v.$space-md;
    transition: background-color v.$transition-fast;
    border-radius: v.$border-radius-lg;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .username {
      font-size: v.$font-size-md;
      color: v.$text-color-primary;
      font-weight: v.$font-weight-medium;
      @include m.text-ellipsis(1);
      max-width: 120px; // 固定值，确保布局一致性
    }
    
    .user-avatar {
      flex-shrink: 0;
      width: v.$space-lg;
      height: v.$space-lg;
    }
  }
}

/* 使用深度选择器与全局类选择器提高特异性 */
:deep(.home-page-top-bar) {
  .top-info-bar {
    .top-info-container {
      justify-content: space-between;
      
      .top-location-info {
        max-width: 60%;
      }
      
      .top-user-info {
        margin-left: auto;
      }
    }
  }
}

/* 移动端样式 - 使用嵌套选择器提高优先级 */
@include m.mobile {
  .top-info-bar {
    .top-info-container {
      padding: v.$space-xs v.$space-sm;
      flex-direction: column; // a垂直排列
      justify-content: center;
    }
    
    .top-location-info {
      width: 100%;
      justify-content: center;
      margin-top: v.$space-xs;
      
      .location-icon {
        font-size: v.$font-size-lg;
      }
      
      .location-name {
        font-size: v.$font-size-md;
        max-width: 140px; // 限制最大宽度避免溢出
      }
    }
    
    .top-user-info {
      width: 100%;
      justify-content: center;
      margin: v.$space-xs 0;
      
      .username {
        max-width: 80px; // 保持固定
        font-size: v.$font-size-sm;
      }
    }
  }
}

/* 较宽屏幕样式 - 使用mixins中的断点 */
@include m.desktop {
  .top-info-bar {
    .top-info-container {
      flex-direction: row; // 水平排列
      flex-wrap: nowrap; // 不换行
      justify-content: space-between; // 两端对齐
    }
    
    .top-location-info {
      flex: 1; // 允许伸缩
      max-width: 70%; // 保持百分比限制
    }
    
    .top-user-info {
      margin-left: auto; // 确保靠右
    }
  }
}

/* 平板设备样式 */
@include m.tablet {
  .top-info-bar {
    .top-info-container {
      flex-direction: row;
      flex-wrap: nowrap;
    }
    
    .top-location-info {
      flex: 1;
      max-width: 60%; // 保持百分比限制
    }
    
    .top-user-info {
      margin-left: auto;
    }
  }
}

/* 超小屏幕特殊处理 - 使用媒体查询增加优先级 */
@media (max-width: v.$screen-xs) {
  .top-info-bar .top-user-info .username {
    display: none; // 隐藏用户名
  }
}
</style> 