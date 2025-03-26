<template>
  <div>
    <div class="menu-backdrop" v-show="active" @click="closeMenu" :class="{ 'backdrop-active': active }"></div>

    <div class="float-menu-container" :class="{ 'active': active, 'dragging': isDragging && isLongPress }" 
         :style="{ top: position.y + 'px', left: position.x + 'px' }"
         @mousedown="handleMouseDown" @touchstart.passive="handleTouchStart">
      
      <!-- 拖拽指示器 -->
      <div class="drag-indicator" v-show="isDragging && isLongPress">
        <span>拖动中...</span>
      </div>
      
      <!-- 主按钮 -->
      <div class="float-menu-button" :class="{ 'menu-active': active }" @click="toggleMenu"
           @touchstart.stop="handleButtonTouchStart">
        <el-icon v-if="!active" class="menu-icon">
          <Plus />
        </el-icon>
        <el-icon v-else class="menu-icon close-icon">
          <Close />
        </el-icon>
      </div>

      <!-- 菜单项 - 放在主按钮后面，以确保在DOM中后渲染，层级更高 -->
      <div v-for="(item, index) in items" :key="item.id" class="solar-menu-item" :class="{ 'active': active }"
        :style="menuItemStyles[index] || {}" @click="handleMenuItemClick(item)"
        @touchstart.stop="() => handleMenuItemTouchStart(item)">
        <div class="menu-item-inner" :class="`menu-icon-${item.id}`">
          <el-icon :size="24">
            <component :is="item.icon"></component>
          </el-icon>
          <span class="menu-item-text">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Close } from '@element-plus/icons-vue'
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useDraggable } from '~/composables/useDraggable'

defineOptions({
  name: 'FloatingMenu'
})

interface MenuItem {
  id: string
  label: string
  icon: string
}

const props = defineProps<{
  items: MenuItem[]
  initialX?: number
  initialY?: number
}>()

const emit = defineEmits<{
  'menu-item-click': [item: MenuItem]
}>()

// 菜单状态
const active = ref(false)

// 记录按钮触摸状态
const buttonTouched = ref(false)
const touchedMenuItem = ref<MenuItem | null>(null)

// 初始位置
const initialPosition = {
  x: props.initialX || 0,
  y: props.initialY || 0
}

// 存储每个菜单项的样式
const menuItemStyles = ref<Array<{transform: string, transitionDelay: string}>>([])

// 在客户端环境中更新默认位置
onMounted(() => {
  if (typeof window !== 'undefined' && !props.initialX && !props.initialY) {
    initialPosition.x = window.innerWidth / 2
    initialPosition.y = window.innerHeight - 120
  }
  
  // 初始化并更新菜单项样式
  updateMenuItemStyles()
})

// 使用useDraggable组合式函数管理拖拽
const { 
  position, 
  isDragging, 
  isLongPress,
  dragDistance, 
  handleMouseDown,
  handleTouchStart 
} = useDraggable(initialPosition)

// 监听位置变化，更新菜单项样式
watch([position, active], () => {
  if (typeof window !== 'undefined') {
    updateMenuItemStyles()
  }
}, { deep: true })

// 计算菜单项样式的函数（仅在客户端执行）
const updateMenuItemStyles = () => {
  if (typeof window === 'undefined') return

  const itemCount = props.items.length
  const radius = 100 // 菜单半径
  
  // 判断菜单按钮是否靠近屏幕边缘
  const isNearLeft = position.x < 100
  const isNearRight = position.x > (window.innerWidth - 100)
  const isNearTop = position.y < 100
  const isNearBottom = position.y > (window.innerHeight - 100)
  
  // 基于位置调整角度范围
  let startAngle = -Math.PI / 2 // 默认从顶部开始
  let endAngle = startAngle + 2 * Math.PI // 默认做一个完整的圆
  
  // 根据边缘位置调整角度范围
  if (isNearLeft && isNearTop) {
    // 左上角：只在右下方显示 (0 to PI/2)
    startAngle = 0
    endAngle = Math.PI / 2
  } else if (isNearRight && isNearTop) {
    // 右上角：只在左下方显示 (PI/2 to PI)
    startAngle = Math.PI / 2
    endAngle = Math.PI
  } else if (isNearRight && isNearBottom) {
    // 右下角：只在左上方显示 (PI to 3PI/2)
    startAngle = Math.PI
    endAngle = 3 * Math.PI / 2
  } else if (isNearLeft && isNearBottom) {
    // 左下角：只在右上方显示 (3PI/2 to 2PI)
    startAngle = 3 * Math.PI / 2
    endAngle = 2 * Math.PI
  } else if (isNearLeft) {
    // 左侧：只在右侧显示 (-PI/2 to PI/2)
    startAngle = -Math.PI / 2
    endAngle = Math.PI / 2
  } else if (isNearRight) {
    // 右侧：只在左侧显示 (PI/2 to 3PI/2)
    startAngle = Math.PI / 2
    endAngle = 3 * Math.PI / 2
  } else if (isNearTop) {
    // 顶部：只在下方显示 (0 to PI)
    startAngle = 0
    endAngle = Math.PI
  } else if (isNearBottom) {
    // 底部：只在上方显示 (PI to 2PI)
    startAngle = Math.PI
    endAngle = 2 * Math.PI
  }
  
  // 计算所有菜单项样式
  const styles = props.items.map((_, index) => {
    // 计算每个菜单项的角度
    const angleRange = endAngle - startAngle
    const angleStep = angleRange / itemCount
    const angle = startAngle + index * angleStep
    
    // 计算菜单项位置
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    
    // 菜单项过渡延迟
    const delay = index * 0.05
    
    return {
      transform: `translate(${x}px, ${y}px)`,
      transitionDelay: `${delay}s`
    }
  })
  
  menuItemStyles.value = styles
}

// 处理按钮的触摸开始
const handleButtonTouchStart = (e: TouchEvent) => {
  e.stopPropagation()
  buttonTouched.value = true
  
  // 添加一次性触摸结束事件监听
  const touchEndHandler = () => {
    // 如果没有触发拖拽，则视为点击
    if (!isDragging.value) {
      toggleMenu()
    }
    buttonTouched.value = false
    document.removeEventListener('touchend', touchEndHandler)
  }
  
  document.addEventListener('touchend', touchEndHandler, { once: true })
}

// 处理菜单项的触摸开始
const handleMenuItemTouchStart = (item: MenuItem) => {
  touchedMenuItem.value = item
  
  // 添加一次性触摸结束事件监听
  const touchEndHandler = () => {
    if (touchedMenuItem.value && !isDragging.value) {
      handleMenuItemClick(touchedMenuItem.value)
    }
    touchedMenuItem.value = null
    document.removeEventListener('touchend', touchEndHandler)
  }
  
  document.addEventListener('touchend', touchEndHandler, { once: true })
}

// 打开/关闭菜单
const toggleMenu = () => {
  // 如果正在拖拽，不触发菜单
  if (isDragging.value) {
    return
  }
  
  active.value = !active.value
}

// 关闭菜单
const closeMenu = () => {
  active.value = false
}

// 处理菜单项点击
const handleMenuItemClick = (item: MenuItem) => {
  emit('menu-item-click', item)
  closeMenu()
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.float-menu-container {
  position: fixed;
  z-index: v.$z-index-dropdown;
  transform: translate(-50%, -50%);
  touch-action: none;
  transition: none;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  &.dragging {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

.drag-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
}

.solar-menu-item {
  position: absolute;
  width: v.$menu-button-size;
  height: v.$menu-button-size;
  z-index: 15;
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* 重要：设置左上角位置为菜单按钮的中心 */
  top: 50%;
  left: 50%;
  margin-left: calc(-1 * v.$menu-button-size / 2);
  margin-top: calc(-1 * v.$menu-button-size / 2);
  
  &.active {
    transform: scale(1);
    opacity: 1;
    pointer-events: auto;
  }

  .menu-item-inner {
    width: v.$menu-button-size;
    height: v.$menu-button-size;
    border-radius: v.$border-radius-round;
    background-color: v.$background-color-white;
    color: v.$text-color-primary;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: v.$shadow-sm;
    transition: all v.$transition-fast;
    position: relative;

    &:hover {
      transform: scale(1.1);
      box-shadow: v.$shadow-md;
    }
  }

  .menu-item-text {
    font-size: v.$font-size-xs;
    margin-top: v.$space-xs / 2;
  }
}

.menu-icon-user {
  background-color: v.$primary-color;
  color: v.$background-color-white;
}

.menu-icon-chat {
  background-color: v.$success-color;
  color: v.$background-color-white;
}

.menu-icon-location {
  background-color: v.$warning-color;
  color: v.$text-color-primary;
}

.menu-icon-groupSearch {
  background-color: v.$info-color;
  color: v.$background-color-white;
}

.menu-icon-groupCreate {
  background-color: v.$primary-color-dark;
  color: v.$background-color-white;
}

.menu-icon-refresh {
  background-color: v.$info-color;
  color: v.$background-color-white;
}

.menu-icon-settings {
  background-color: v.$text-color-tertiary;
  color: v.$background-color-white;
}

.float-menu-button {
  width: v.$menu-button-size;
  height: v.$menu-button-size;
  border-radius: v.$border-radius-round;
  background-color: v.$primary-color;
  color: v.$background-color-white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all v.$transition-normal;
  position: relative;
  z-index: 10;
  box-shadow: v.$shadow-sm;

  &:hover {
    box-shadow: 0 v.$space-sm v.$space-md rgba(v.$primary-color, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }

  &.menu-active {
    background-color: v.$danger-color;
    transform: rotate(45deg);

    &:hover {
      box-shadow: 0 v.$space-sm v.$space-md rgba(v.$danger-color, 0.4);
    }

    &:active {
      transform: scale(0.95) rotate(45deg);
      box-shadow: 0 v.$space-sm v.$space-xl rgba(v.$danger-color, 0.5);
    }
  }

  .menu-icon {
    font-size: v.$font-size-xl;
    transition: all v.$transition-normal;
  }
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: v.$z-index-dropdown - 1;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color v.$transition-normal;
  pointer-events: none;

  &.backdrop-active {
    pointer-events: auto;
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>