<template>
  <div class="viewer-layout-container">
    <ViewerHeader @switch-panel="handlePanelSwitch" />
    <DamStatisticsRow />
    <div class="main-content-area">
      <div v-if="currentPanelType === 'mainViewer'" class="side-panel-container left">
        <MainViewerLeftPanel />
      </div>
      <div v-if="currentPanelType === 'monitor'" class="side-panel-container left">
        <MonitorLeftPanel />
      </div>

      <div class="cesium-viewer-wrapper">
        <CesiumViewer />
      </div>

      <div v-if="currentPanelType === 'mainViewer'" class="side-panel-container right">
        <MainViewerRightPanel />
      </div>
      <div v-if="currentPanelType === 'monitor'" class="side-panel-container right">
        <MonitorRightPanel />
      </div>
    </div>
    <!-- 根据条件渲染 FooterPanel -->
    <FooterPanel v-if="currentPanelType === 'monitor'" />
    <div class="mask"></div>
    
    <!-- 历史告警表格弹窗 -->
    <HistoricalAlarmsTable 
      v-if="showHistoricalAlarmsTable" 
      :show="showHistoricalAlarmsTable"
      @close="closeHistoricalAlarmsTable"
      @show-detail="showAlarmDetail"
    />
    
    <!-- 告警详情弹窗 -->
    <AlarmDetailModal 
      v-if="showAlarmDetailModal" 
      :show="showAlarmDetailModal"
      :alarm-id="currentAlarmId"
      @close="closeAlarmDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue';
import CesiumViewer from './Viewer.vue'; // The main Cesium viewer component
import ViewerHeader from './header.vue'; // The header with switch buttons
import DamStatisticsRow from './mainViewer/common/DamStatisticsRow.vue';

// Panels for '态势总览'
import MainViewerLeftPanel from './mainViewer/LeftPanel.vue';
import MainViewerRightPanel from './mainViewer/RightPanel.vue';

// Panels for '监测告警'
import MonitorLeftPanel from './monitor/LeftPanel.vue';
import MonitorRightPanel from './monitor/RightPanel.vue';
import FooterPanel from './monitor/footerPanel.vue'; // 引入 FooterPanel

// 历史告警相关组件
import HistoricalAlarmsTable from './mainViewer/rightComponent/HistoricalAlarmsTable.vue';
import AlarmDetailModal from './mainViewer/rightComponent/AlarmDetailModal.vue';

const currentPanelType = ref('mainViewer'); // Default to '态势总览'

// 计算 FooterPanel 的高度，这里假设其固定为 250px，如果 FooterPanel 高度不固定，需要更复杂逻辑
const footerPanelHeight = computed(() => {
  return currentPanelType.value === 'monitor' ? 250 : 0;
});

const handlePanelSwitch = (panelType) => {
  currentPanelType.value = panelType;
};

// 历史告警表格弹窗控制
const showHistoricalAlarmsTable = ref(false);
const showAlarmDetailModal = ref(false);
const currentAlarmId = ref(0);

// 打开历史告警表格弹窗
const openHistoricalAlarmsTable = () => {
  showHistoricalAlarmsTable.value = true;
};

// 关闭历史告警表格弹窗
const closeHistoricalAlarmsTable = () => {
  showHistoricalAlarmsTable.value = false;
};

// 打开告警详情弹窗
const showAlarmDetail = (alarmId) => {
  currentAlarmId.value = alarmId;
  showAlarmDetailModal.value = true;
  // 如果历史告警表格弹窗是打开的，则关闭它
  if (showHistoricalAlarmsTable.value) {
    showHistoricalAlarmsTable.value = false;
  }
};

// 关闭告警详情弹窗
const closeAlarmDetailModal = () => {
  showAlarmDetailModal.value = false;
};

// 将弹窗控制函数提供给子组件
provide('alarmsModalControls', {
  openHistoricalAlarmsTable,
  closeHistoricalAlarmsTable,
  showAlarmDetail,
  closeAlarmDetailModal
});
</script>

<style scoped>
.viewer-layout-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column; /* Header on top, content below */
  overflow: hidden; /* Prevent scrollbars on the layout itself */
}
.mask{
  position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-image: url(/src/assets/mask.png);
    pointer-events: none;
}
.main-content-area {
  flex-grow: 1; /* Takes remaining height */
  display: flex;
  position: relative; /* For absolute positioning of viewer if needed */
  /* 为 FooterPanel 预留空间, 假设 FooterPanel 的高度为 250px */
  margin-bottom: v-bind("currentPanelType === 'monitor' ? footerPanelHeight + 'px' : '0'"); 
}

.cesium-viewer-wrapper {
  flex-grow: 1; /* Viewer takes the central space */
  height: 100%;
  position: relative; /* Context for Cesium viewer */
}

.side-panel-container {
  width: 300px; /* Adjust width as needed */
  height: calc(100% - 60px); /* Full height minus header */
  overflow-y: auto;
  position: absolute; /* Positioned over the viewer or alongside */
  top: 60px; /* Below the header */
  z-index: 1000; /* Above Cesium viewer but below header popups if any */
  transition: transform 0.3s ease-in-out;
}

.side-panel-container.left {
  left: 0;
}

.side-panel-container.right {
  right: 0;
}


</style>