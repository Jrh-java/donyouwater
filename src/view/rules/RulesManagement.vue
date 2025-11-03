<template>
  <div class="rules-container">
    <h2>{{ route.meta.title }}</h2>
    <p>当前路由: {{ route.path }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped>
.rules-container {
  padding: 20px;
}
</style>