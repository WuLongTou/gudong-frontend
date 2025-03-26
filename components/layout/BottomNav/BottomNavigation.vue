<template>
  <div class="bottom-nav">
    <div 
      v-for="item in items" 
      :key="item.key" 
      class="nav-item" 
      :class="{ 'active': activeKey === item.key }"
      @click="handleNavClick(item)"
    >
      <el-icon class="nav-icon">
        <component :is="item.icon"></component>
      </el-icon>
      <span class="nav-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BottomNavigation'
})

interface NavItem {
  key: string
  text: string
  icon: string
  route?: string
}

const props = defineProps<{
  items: NavItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  'nav-click': [item: NavItem]
}>()

const handleNavClick = (item: NavItem) => {
  emit('nav-click', item)
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;
@use '~/assets/scss/mixins' as m;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: v.$footer-height;
  background-color: v.$background-color-white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: v.$shadow-sm;
  z-index: v.$z-index-fixed;
  padding-bottom: env(safe-area-inset-bottom, 0);
  
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: v.$space-sm 0;
    cursor: pointer;
    
    .nav-icon {
      font-size: v.$font-size-xl;
      color: v.$text-color-secondary;
      margin-bottom: v.$space-xs;
      transition: color v.$transition-fast;
    }
    
    .nav-text {
      font-size: v.$font-size-sm;
      color: v.$text-color-secondary;
      transition: color v.$transition-fast;
    }
    
    &.active {
      .nav-icon,
      .nav-text {
        color: v.$primary-color;
      }
    }
    
    &:hover {
      .nav-icon,
      .nav-text {
        color: v.$primary-color;
      }
    }
  }
}
</style> 