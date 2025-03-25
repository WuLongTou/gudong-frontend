<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// 处理移动端视口高度
const updateViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

onMounted(() => {
  // 初始化视口高度
  updateViewportHeight();
  
  // 监听视口变化
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', updateViewportHeight);
  window.removeEventListener('orientationchange', updateViewportHeight);
});

// 添加viewport-fit=cover元标签
useHead({
  meta: [
    { 
      name: 'viewport', 
      content: 'width=device-width, initial-scale=1, viewport-fit=cover' 
    }
  ]
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  /* 移动端滚动优化 */
  -webkit-overflow-scrolling: touch;
}

/* 确保所有固定高度的容器都正确使用视口高度 */
:root {
  --vh: 1vh;
}

/* 防止iOS橡皮筋效果 */
html {
  position: fixed;
  height: 100%;
  overflow: hidden;
}

body {
  overflow: auto;
  height: 100%;
  /* 增加底部安全区域 */
  padding-bottom: env(safe-area-inset-bottom);
}

/* 针对iOS键盘弹出时的处理 */
input, textarea {
  font-size: 16px; /* 防止iOS自动缩放 */
}
</style>