<template>
  <div class="footer-panel-container">
    <DamSurfaceTemperature class="footer-component" />
    <div class="divider"></div>
    <InternalTemperaturePressure class="footer-component" />
  </div>
</template>

<script setup lang="ts">
import DamSurfaceTemperature from './footerComponent/DamSurfaceTemperature.vue';
import InternalTemperaturePressure from './footerComponent/InternalTemperaturePressure.vue';
</script>

<style scoped>
.footer-panel-container {
  display: flex;
  justify-content: space-between; /* 让两个组件左右分布 */
  align-items: flex-start; /* 顶部对齐 */
  width: calc(100% - 1000px); /* 减去左右侧边栏的宽度 */
  height: 250px; /* 根据实际内容调整高度 */
  padding: 10px;
  background-color: rgba(10, 28, 51, 0.4); /* 深蓝色背景，透明度0.8 */
  /* border: 1px solid ; 科技感淡紫色边框 */
  box-sizing: border-box; /* 边框和内边距包含在宽度和高度内 */
  position: absolute;
  bottom: 0;
  left: 500px; /* 避开左侧边栏 */
  z-index: 1; /* 确保在其他内容之上，但在侧边栏之下 */
  border-radius: 10px;
  
}

.footer-component {
  width: calc(50% - 10px); /* 每个组件占据近一半宽度，减去divider宽度和间隙 */
  height: 100%;
  overflow: hidden; /* 防止内容溢出 */
}

.divider {
  width: 1px;
  height: calc(100% - 20px); /* 分割线高度，上下留出一些边距 */
  background-color: rgba(20, 197, 255, 0.3);
  margin: 10px 5px 0 5px; /* 上下边距10px，左右间隙5px */
}
</style>