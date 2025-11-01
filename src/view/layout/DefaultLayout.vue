<template>
  <div class="default-layout">
    <div class="layout-header">
      <h2>{{ currentTitle }}</h2>
    </div>
    <div class="layout-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentTitle = computed(() => {
  return route.meta?.title || '页面'
})
</script>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.layout-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e9e9e9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 500;
  }
}

.layout-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
</style> 