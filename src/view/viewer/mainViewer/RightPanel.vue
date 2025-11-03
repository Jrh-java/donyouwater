<template>
  <div class="side-panel right-panel-main-viewer">
    <InspectionStatsChart />
    <SubtitleFrame>
      <template #title>
        <p>监测设备统计</p>
      </template>
      <template #subtitle>
        <p>更新时间: {{ updateTime }}</p>
      </template>
      <template #content>
        <DeviceStatsChart />
      </template>
    </SubtitleFrame>

    <SubtitleFrame>
      <template #title>
        <p>风险告警</p>
      </template>
      <template #content>
        <RiskWarningChart />
      </template>
    </SubtitleFrame>

  </div>
</template>

<script setup>
import InspectionStatsChart from './rightComponent/InspectionStatsChart.vue';
import DeviceStatsChart from './rightComponent/DeviceStatsChart.vue';
import RiskWarningChart from './rightComponent/RiskWarningChart.vue';
import SubtitleFrame from '@/components/SubtitleFrame.vue';
import { ref } from 'vue';

// 获取当前时间格式化为yyyy-MM-dd HH:mm:ss
const updateTime = ref(formatDateTime(new Date()));

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>
.right-panel-main-viewer {
  background-image: url('@/assets/viewer/panel_background.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 20px;
  height: calc(100% - 50px);
  box-sizing: border-box;
  margin-top:50px;
  width: 380px;
    position: fixed;


    right: 20px;
    z-index: 100;
    padding: 8px 7px 0px 12px;
}

</style>