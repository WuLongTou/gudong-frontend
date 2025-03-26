import { ref, onMounted, onUnmounted } from 'vue'

// 创建全局单例
let width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
let height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)
let listeners = 0

// 更新窗口尺寸的函数
const updateSize = () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

export function useWindowSize() {
  // 在组件挂载时添加事件监听
  onMounted(() => {
    if (listeners === 0) {
      // 初始更新一次尺寸
      updateSize()
      window.addEventListener('resize', updateSize)
    }
    listeners++
  })

  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    listeners--
    if (listeners === 0) {
      window.removeEventListener('resize', updateSize)
    }
  })

  return {
    width,
    height
  }
} 