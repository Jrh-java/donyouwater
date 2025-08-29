<template>
  <SubtitleFrame>
    <template #title>
      <p style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 5px;">水闸站概览</p>
    </template>
    <template #subtitle>
      <span style="font-size: 12px; color: #a9b7c3;">更新时间: {{ updateTime }}</span>
    </template>
    <template #content>
      <div class="statistics-content">
        <div class="statistic-item" @click="showDevicePanel">
          <img src="@/assets/viewer/statistic.png" alt="statistic icon" class="statistic-icon" />
          <div class="statistic-text">
            <p class="statistic-label">水闸站总量</p>
            <p class="statistic-value">{{ totalGateStations }} <span class="statistic-unit">座</span></p>
          </div>
        </div>
        <div class="statistic-item">
          <img src="@/assets/viewer/statistic.png" alt="statistic icon" class="statistic-icon" />
          <div class="statistic-text">
            <p class="statistic-label">在线监测</p>
            <p class="statistic-value">{{ onlineGateStations }} <span class="statistic-unit">座</span></p>
          </div>
        </div>
        <!-- <div class="statistic-item">
          <img src="@/assets/viewer/statistic.png" alt="statistic icon" class="statistic-icon" />
          <div class="statistic-text">
            <p class="statistic-label">待接入</p>
            <p class="statistic-value">3 <span class="statistic-unit">座</span></p>
          </div>
        </div> -->
        <div class="statistic-item">
          <img src="@/assets/viewer/statistic.png" alt="statistic icon" class="statistic-icon" />
          <div class="statistic-text">
            <p class="statistic-label">风险告警</p>
            <p class="statistic-value risk-warning">{{ riskAlerts }} <span class="statistic-unit">座</span></p>
          </div>
        </div>
      </div>
    </template>
  </SubtitleFrame>
  
  <!-- 闸门站设备管理弹窗 -->
  <GateStationDevicePanel :show="showDevicePanelFlag" @close="closeDevicePanel" />
</template>

<script setup>
import SubtitleFrame from '@/components/subtitleFrame.vue';
import GateStationDevicePanel from './GateStationDevicePanel.vue';
import { ref, onMounted } from 'vue';
import { getDamDirectoryListApi } from '@/api/reservoir';

// 获取当前时间格式化为yyyy-MM-dd HH:mm:ss
const updateTime = ref(formatDateTime(new Date()));

// 闸站统计数据
const totalGateStations = ref(0);
const onlineGateStations = ref(0);
const riskAlerts = ref(2); // 风险告警数量暂时保持固定值

// 弹窗控制
const showDevicePanelFlag = ref(false);

// 显示设备管理弹窗
const showDevicePanel = () => {
  showDevicePanelFlag.value = true;
};

// 关闭设备管理弹窗
const closeDevicePanel = () => {
  showDevicePanelFlag.value = false;
};

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取闸站统计数据
const fetchGateStationStats = async () => {
  try {
    const response = await getDamDirectoryListApi();
    
    let totalCount = 0;
    let onlineCount = 0;
    
    // 遍历所有省份、城市、区域、镇、水库，统计闸站数量
    response.forEach((provinceData) => {
      provinceData.envMcsCityVOS.forEach((cityData) => {
        cityData.envMcsAreaVOS.forEach((areaData) => {
          areaData.envMcsTownVOS.forEach((townData) => {
            townData.reservoirInfoVOS.forEach((reservoir) => {
              if (reservoir.deviceGateStationInfoNodeVOS) {
                const gateStations = reservoir.deviceGateStationInfoNodeVOS;
                totalCount += gateStations.length;
                // 假设所有闸站都在线，实际项目中可能需要根据闸站状态字段判断
                onlineCount += gateStations.length;
              }
            });
          });
        });
      });
    });
    
    totalGateStations.value = totalCount;
    onlineGateStations.value = onlineCount;
    
    // 更新时间
    updateTime.value = formatDateTime(new Date());
    
  } catch (error) {
    console.error('获取闸站统计数据失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchGateStationStats();
});
</script>

<style scoped>
.statistics-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 10px;
  padding: 5px 0;
}

.statistic-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.statistic-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.statistic-text {
  display: flex;
  flex-direction: column;
}

.statistic-label {
  font-size: 14px;
  color: #a9b7c3;
  margin-bottom: 2px;
}

.statistic-value {
  font-size: 22px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.statistic-unit {
  font-size: 12px;
  color: #a9b7c3;
  margin-left: 3px;
  font-weight: normal;
}

.risk-warning {
  color: #ff4d4f;
}

p {
  margin: 0;
}
</style>