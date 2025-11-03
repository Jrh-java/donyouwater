<template>
  <div class="workbench-container">
    <TopSection />
    <MiddleSection />
    <BottomSection />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import TopSection from './TopSection.vue';
import MiddleSection from './MiddleSection.vue';
import BottomSection from './BottomSection.vue';

const route = useRoute();
</script>

<style scoped>
.workbench-container {
  padding: 20px;
  /* background-color: #f5f7fa; */
  /* min-height: 100%; */
}
</style>