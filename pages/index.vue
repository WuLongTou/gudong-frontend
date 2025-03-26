<template>
  <!-- 这是一个简单的重定向页面 -->
  <div class="redirect-container">
    <p>正在跳转到主页...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

onMounted(() => {
  // 如果用户已登录，则重定向到主页，否则重定向到登录页
  const path = userStore.isLoggedIn ? '/home' : '/login';
  navigateTo(path);
});
</script>

<style lang="scss" scoped>
.redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--wx-text-secondary);
  font-size: 14px;
}
</style>
