import { ref, reactive, onUnmounted, onMounted } from 'vue'
import { useWindowSize } from './useWindowSize'

export function useDraggable(initialPosition = { x: 20, y: 500 }, elementSize = 60) {
  // 获取窗口尺寸
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  
  // 元素位置
  const position = reactive({
    x: initialPosition.x,
    y: initialPosition.y
  })
  
  // 拖拽状态
  const isDragging = ref(false)
  const isLongPress = ref(false)
  const longPressTimer = ref<number | null>(null)
  const LONG_PRESS_DURATION = 500 // 长按触发时间（毫秒）
  
  // 记录拖拽距离
  const dragDistance = ref(0)
  const dragStartPosition = reactive({ x: 0, y: 0 })
  
  // 限制元素在视口内
  const constrainToViewport = () => {
    // 由于元素使用transform: translate(-50%, -50%)定位，
    // 需要考虑半宽/半高来防止元素超出视口
    const halfSize = elementSize / 2
    
    // 限制坐标不超出视窗
    position.x = Math.max(halfSize, Math.min(windowWidth.value - halfSize, position.x))
    position.y = Math.max(halfSize, Math.min(windowHeight.value - halfSize, position.y))
  }
  
  // 初始化位置
  onMounted(() => {
    // 由于元素使用transform: translate(-50%, -50%)定位，
    // 需要考虑半宽/半高来防止元素超出视口
    const halfSize = elementSize / 2
    
    // 设置默认位置并确保在视口内
    position.x = Math.max(halfSize, Math.min(windowWidth.value - halfSize, initialPosition.x))
    position.y = Math.max(halfSize, Math.min(windowHeight.value - halfSize, initialPosition.y))
  })

  // 清除长按定时器
  const clearLongPressTimer = () => {
    if (longPressTimer.value !== null) {
      window.clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  }

  // 处理长按开始
  const startLongPress = () => {
    isLongPress.value = true
    isDragging.value = true
  }
  
  // 向后兼容的鼠标事件
  const handleMouseDown = (e: MouseEvent) => {
    dragStartPosition.x = position.x
    dragStartPosition.y = position.y
    dragDistance.value = 0
    
    // 设置长按定时器
    clearLongPressTimer()
    longPressTimer.value = window.setTimeout(() => {
      startLongPress()
    }, LONG_PRESS_DURATION)
    
    const moveHandler = (e: MouseEvent) => {
      // 只有长按触发后才能拖动
      if (isLongPress.value) {
        // 计算新位置
        position.x = e.clientX
        position.y = e.clientY
        
        // 计算拖拽距离
        const dx = position.x - dragStartPosition.x
        const dy = position.y - dragStartPosition.y
        dragDistance.value = Math.sqrt(dx * dx + dy * dy)
        
        // 限制元素在视口内
        constrainToViewport()
      }
      
      e.preventDefault()
    }
    
    const upHandler = () => {
      // 清除长按定时器
      clearLongPressTimer()
      
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
      
      // 重置状态
      setTimeout(() => {
        isDragging.value = false
        isLongPress.value = false
      }, 0)
    }
    
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
    
    e.preventDefault()
  }
  
  // 触摸设备的拖拽实现
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return
    
    dragStartPosition.x = position.x
    dragStartPosition.y = position.y
    dragDistance.value = 0
    
    // 设置长按定时器
    clearLongPressTimer()
    longPressTimer.value = window.setTimeout(() => {
      startLongPress()
      
      // 提供视觉/触觉反馈
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50) // 短震动反馈
      }
    }, LONG_PRESS_DURATION)
    
    const touchMoveHandler = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      
      // 只有长按触发后才能拖动
      if (isLongPress.value) {
        // 计算新位置
        const touch = e.touches[0]
        position.x = touch.clientX
        position.y = touch.clientY
        
        // 计算拖拽距离
        const dx = position.x - dragStartPosition.x
        const dy = position.y - dragStartPosition.y
        dragDistance.value = Math.sqrt(dx * dx + dy * dy)
        
        // 限制元素在视口内
        constrainToViewport()
        
        e.preventDefault() // 阻止滚动
      } else if (longPressTimer.value !== null) {
        // 如果用户开始移动但还没触发长按，取消长按定时器
        const touch = e.touches[0]
        const dx = touch.clientX - dragStartPosition.x
        const dy = touch.clientY - dragStartPosition.y
        const moveDistance = Math.sqrt(dx * dx + dy * dy)
        
        // 如果移动超过一定距离，取消长按
        if (moveDistance > 10) {
          clearLongPressTimer()
        }
      }
    }
    
    const touchEndHandler = () => {
      // 清除长按定时器
      clearLongPressTimer()
      
      document.removeEventListener('touchmove', touchMoveHandler)
      document.removeEventListener('touchend', touchEndHandler)
      
      // 重置状态
      setTimeout(() => {
        isDragging.value = false
        isLongPress.value = false
      }, 0)
    }
    
    document.addEventListener('touchmove', touchMoveHandler, { passive: false })
    document.addEventListener('touchend', touchEndHandler)
  }
  
  // 组件卸载时清理事件
  onUnmounted(() => {
    clearLongPressTimer()
  })
  
  return {
    position,
    isDragging,
    isLongPress,
    dragDistance,
    handleMouseDown,
    handleTouchStart,
    constrainToViewport
  }
} 