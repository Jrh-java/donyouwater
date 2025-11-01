<template>
  <div class="side-panel left-panel-main-viewer">
    <DamOverview />
    <DamDistribution />
    <WaterMonitor style="margin-top: 15px;" />
  </div>
</template>

<script setup>
import DamOverview from './leftComponent/DamOverview.vue';
import DamDistribution from './leftComponent/DamDistribution.vue';
import WaterMonitor from './leftComponent/WaterMonitor.vue';
</script>

<style scoped>
.left-panel-main-viewer {
  background-image: url('@/assets/viewer/panel_background.png');
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 20px;
  height: calc(100% - 50px);
  box-sizing: border-box;
  margin-top: 50px;
  width: 380px;
  position: fixed;
  background-size: 100% 100%;
  left: 20px;
  z-index: 100;
  padding: 8px 7px 0px 12px;
}
</style>