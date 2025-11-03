<!-- Content from src/view/viewer/monitor/rightComponent/EnvironmentMonitor.vue -->
<template>

  <div class="environment-monitor">
    <subtitle-frame>
      <template #title>
        <p>环境监测</p>
      </template>
      <template #subtitle>
        <p>更新时间: {{ currentTime }}</p>
      </template>

      <template #content>
        <div class="monitor-content">
          <div class="tabs">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'water' }"
              @click="switchTab('water')"
            >
              <span>水位</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'rainfall' }"
              @click="switchTab('rainfall')"
            >
              <span>降雨量</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'tempHumid' }"
              @click="switchTab('tempHumid')"
            >
              <span>温/湿度</span>
            </div>
          </div>
          
          <div class="chart-container">
            <water-level-chart v-if="activeTab === 'water'" :key="waterChartKey" />
            <rainfall-chart v-if="activeTab === 'rainfall'" :key="rainfallChartKey" />
            <temp-humid-chart v-if="activeTab === 'tempHumid'" :key="tempHumidChartKey" />
          </div>

        </div>
      </template>
    </subtitle-frame>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SubtitleFrame from '@/components/subtitleFrame.vue';
import WaterLevelChart from './WaterLevelChart.vue'; // Path already correct for new location
import RainfallChart from './RainfallChart.vue';   // Path already correct for new location
import TempHumidChart from './TempHumidChart.vue';  // Path already correct for new location

const activeTab = ref('water'); 
const currentTime = ref(formatDateTime(new Date()));
let timerID = null;

const waterChartKey = ref(0);
const rainfallChartKey = ref(0);
const tempHumidChartKey = ref(0);
const damOptions = ref([
  { label: '大坝1', value: 'dam1' },
  { label: '大坝2', value: 'dam2' },
  { label: '大坝3', value: 'dam3' },
]);
const selectedDam = ref('dam1');

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function switchTab(tab) {
  activeTab.value = tab;
  if (tab === 'water') {
    waterChartKey.value++;
  } else if (tab === 'rainfall') {
    rainfallChartKey.value++;
  } else if (tab === 'tempHumid') {
    tempHumidChartKey.value++;
  }
}

onMounted(() => {
  timerID = setInterval(() => {
    currentTime.value = formatDateTime(new Date());
  }, 60000);
  if (activeTab.value === 'water') waterChartKey.value++; 
});

onUnmounted(() => {
  if (timerID) {
    clearInterval(timerID);
  }
});
</script>

<style scoped>
.environment-monitor {
  width: 100%;
}

.monitor-content {
  padding: 5px;
  color: white;
}

.tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.tab-item {
  cursor: pointer;
  padding: 5px 15px;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.tab-item:hover {
  background-color: rgba(0, 126, 153, 0.5);
}

.tab-item.active {
  background-color: #00CFFF;
  color: white;
}

.chart-container {
  margin-bottom: 10px;
}

.refresh-btn {
  cursor: pointer;
}
</style> 