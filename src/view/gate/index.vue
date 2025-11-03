<template>
  <DamLayout :key="$route.fullPath" />
</template>

<script setup>
import DamLayout from './DamLayout.vue';
</script>

// 库闸管理父组件，仅作为路由容器