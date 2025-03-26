<template>
  <div class="page-container" :class="{ 'has-bottom-nav': hasBottomNav, 'has-top-bar': hasTopBar }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PageContainer'
})

withDefaults(defineProps<{
  hasBottomNav?: boolean
  hasTopBar?: boolean
}>(), {
  hasBottomNav: true,
  hasTopBar: true
})
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.page-container {
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  position: relative;
  background-color: v.$background-color-light;
  overflow: hidden;
  
  &.has-top-bar {
    padding-top: v.$header-height;
  }
  
  &.has-bottom-nav {
    padding-bottom: v.$footer-height;
    padding-bottom: calc(#{v.$footer-height} + env(safe-area-inset-bottom, 0px));
  }
}
</style> 