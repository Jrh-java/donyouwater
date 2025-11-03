<template>
  <div class="side-panel auxiliary-panel-monitor">
    <DisplacementMonitor />
    <StressStrainMonitor />
    <SeepageFlowMonitor />
    <!-- <p>内容已移至左侧面板</p> -->
  </div>
</template>

<script setup>
import DisplacementMonitor from './rightComponent/DisplacementMonitor.vue';
import StressStrainMonitor from './rightComponent/StressStrainMonitor.vue';
import SeepageFlowMonitor from './rightComponent/SeepageFlowMonitor.vue';
// import EnvironmentMonitor from './rightComponent/EnvironmentMonitor.vue';
</script>

<style scoped>
.auxiliary-panel-monitor{
  background-image: url('@/assets/viewer/panel_background.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 20px;
  height: calc(100% - 50px); /* 保持原有高度计算，可能需要根据实际内容调整 */
  box-sizing: border-box;
  margin-top:50px;
  width: 380px;
  position: fixed;
  right: 20px;
  z-index: 100;
  padding: 8px 7px 0px 12px;
  overflow-y: hidden; /* 允许内容滚动 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列组件 */
  gap: 16px; /* 组件之间的间距 */
}
.side-panel p {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
</style>