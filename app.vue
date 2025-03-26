<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// 使用CSS变量处理视口高度问题，不再需要JavaScript
// 在<style>中添加了更现代的解决方案

// 添加viewport-fit=cover元标签
useHead({
  meta: [
    { 
      name: 'viewport', 
      content: 'width=device-width, initial-scale=1, viewport-fit=cover' 
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap'
    }
  ]
});
</script>

<style>
/* 使用纯CSS处理视口高度问题 */
:root {
  --vh: 1vh;
  
  /* ===== 微信风格色彩变量 ===== */
  --wx-primary: #07C160;       /* 微信主色调 */
  --wx-primary-light: #10d86c; /* 主色调亮色 */
  --wx-primary-dark: #04a04f;  /* 主色调暗色 */
  
  --wx-bg-color: #EDEDED;      /* 微信背景色 */
  --wx-card-bg: #FFFFFF;       /* 卡片背景色 */
  
  --wx-text-primary: #333333;  /* 主要文本颜色 */
  --wx-text-regular: #666666;  /* 常规文本颜色 */
  --wx-text-secondary: #999999;/* 次要文本颜色 */
  
  --wx-border-color: #EAEAEA;  /* 边框颜色 */
  --wx-active-color: #F7F7F7;  /* 激活状态颜色 */
  
  /* 阴影 */
  --wx-shadow-light: 0 2px 8px rgba(0, 0, 0, 0.04);
  --wx-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --wx-shadow-dark: 0 4px 16px rgba(0, 0, 0, 0.12);
  
  /* 圆角 */
  --wx-radius-sm: 4px;
  --wx-radius: 8px;
  --wx-radius-lg: 12px;
  --wx-radius-xl: 16px;
  --wx-radius-full: 999px;
  
  /* 间距 */
  --wx-space-xs: 4px;
  --wx-space-sm: 8px;
  --wx-space: 12px;
  --wx-space-md: 16px;
  --wx-space-lg: 24px;
  --wx-space-xl: 32px;
  
  /* 动画 */
  --wx-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  --wx-transition-fast: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  
  /* 字体 */
  --wx-font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

@supports (height: 100dvh) {
  .full-height {
    height: 100dvh; /* 动态视口高度 - 现代浏览器支持 */
  }
}

@supports not (height: 100dvh) {
  .full-height {
    height: 100vh;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: var(--wx-font-family);
  color: var(--wx-text-primary);
  background-color: var(--wx-bg-color);
  /* 移动端滚动优化 */
  -webkit-overflow-scrolling: touch;
  /* 字体平滑 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

/* 全局弹窗样式改进 - 使用更具体的选择器替代!important */
html body .el-dialog {
  border-radius: var(--wx-radius-lg);
  box-shadow: var(--wx-shadow-dark);
  overflow: hidden;
}

html body .el-dialog__header {
  margin: 0;
  padding: var(--wx-space-md) var(--wx-space-lg);
  border-bottom: 1px solid var(--wx-border-color);
}

.el-dialog__title {
  font-weight: 500;
  color: var(--wx-text-primary);
}

html body .el-dialog__body {
  padding: var(--wx-space-lg);
}

html body .el-dialog__footer {
  padding: var(--wx-space-md) var(--wx-space-lg);
  border-top: 1px solid var(--wx-border-color);
}

/* 全局卡片样式改进 - 使用更具体的选择器提高优先级 */
html body .el-card {
  border-radius: var(--wx-radius);
  border: none;
  box-shadow: var(--wx-shadow-light);
  margin-bottom: var(--wx-space-md);
  overflow: hidden;
}

html body .el-card__header {
  padding: var(--wx-space-md) var(--wx-space-lg);
  border-bottom: 1px solid var(--wx-border-color);
}

html body .el-card__body {
  padding: var(--wx-space-md) var(--wx-space-lg);
}

/* 按钮样式优化 - 增加选择器优先级 */
html body .el-button {
  border-radius: var(--wx-radius);
  font-weight: 500;
  transition: var(--wx-transition-fast);
}

html body .el-button--primary {
  background-color: var(--wx-primary);
  border-color: var(--wx-primary);
}

html body .el-button--primary:hover, 
html body .el-button--primary:focus {
  background-color: var(--wx-primary-light);
  border-color: var(--wx-primary-light);
}

html body .el-button--primary:active {
  background-color: var(--wx-primary-dark);
  border-color: var(--wx-primary-dark);
}

/* 输入框样式优化 - 增加选择器优先级 */
html body .el-input__inner {
  border-radius: var(--wx-radius);
}

html body .el-input-group__append,
html body .el-input-group__prepend {
  border-radius: 0 var(--wx-radius) var(--wx-radius) 0;
}

html body .el-input-group__prepend {
  border-radius: var(--wx-radius) 0 0 var(--wx-radius);
}

/* 消息提示样式优化 - 增加选择器优先级 */
html body .el-message {
  border-radius: var(--wx-radius);
  border: none;
  box-shadow: var(--wx-shadow);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 禁用选择 */
.no-select {
  user-select: none;
  -webkit-user-select: none;
}

/* 绝对居中 */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 弹性布局居中 */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 图标通用样式 */
.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* 安全区域适配 */
.safe-padding-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-margin-bottom {
  margin-bottom: env(safe-area-inset-bottom);
}

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-up {
  animation: slideUp 0.3s ease-in-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.scale-in {
  animation: scaleIn 0.3s ease-in-out;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>