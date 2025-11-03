<!-- Content from src/view/viewer/monitor/rightComponent/WaterLevelChart.vue -->
<template>
  <div class="water-level-chart-container">
    <div class="water-overview">
      <div class="water-overview-item" v-for="item in waterOverviewData" :key="item.title">
         <img src="@/assets/viewer/level.png" :alt="item.title" class="overview-icon-img">
         <div class="overview-text-content">
           <div class="overview-title">{{ item.title }}</div>
           <div :class="['overview-value', item.statusClass]">{{ item.value }}</div>
         </div>
      </div>
    </div>
    <div class="chart-header">
      <span style="margin-left:auto;display:flex;align-items:center;">
        <span style="margin-right:6px;color:#E0F2F7;">分析时间:</span>
        <el-select v-model="selectedWaterTime"   class="chart-select" :teleported="false" @change="onWaterTimeChange">
          <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </span>
    </div>
    <div ref="chartDom" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import levelIcon from '@/assets/viewer/level.png';

const chartDom = ref(null);
let myChart = null;

// const monitorStore = useMonitorStore(); // 初始化store

// watch(() => monitorStore.selectedDamId, (newDamId, oldDamId) => {
//   if (newDamId && newDamId !== oldDamId) {
//     console.log(`WaterLevelChart: Detected damId change to ${newDamId}. Reloading chart data.`);
//     // 在这里根据 newDamId 重新获取或更新图表数据
//     if (myChart) {
//       // 示例: waterLevelOption.value.series[0].data = getNewDataForDam(newDamId); 
//           myChart.setOption(waterLevelOption.value, true);
//       console.log('WaterLevelChart: Chart would be updated here.');
//     }
//   }
// });

const analysisTimeOptions = [
  { label: '近24小时', value: '24h', xAxis: Array.from({length:24},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近12小时', value: '12h', xAxis: Array.from({length:12},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近6小时', value: '6h', xAxis: Array.from({length:6},(_,i)=>`${i.toString().padStart(2,'0')}:00`) }
];

const waterOverviewData = ref([
  {
    title: '当前水位',
    value: '- m',
    icon: levelIcon,
    statusClass: 'value-highlight'
  },
  {
    title: '水位状态',
    value: '正常',
    icon: levelIcon, 
    statusClass: 'status-normal'
  }
]);

const selectedWaterTime = ref('24h');

const waterLevelOption = ref({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line'
    }
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '8%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: analysisTimeOptions.find(opt => opt.value === selectedWaterTime.value).xAxis,
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.7)'
    }
  },
  yAxis: {
    type: 'value',
    name: '水位(m)',
    inverse: false, // Adjusted based on typical water level charts, original was true
    nameLocation: 'end',
    nameTextStyle: {
      color: 'rgba(255, 255, 255, 0.7)',
      padding: [0, 30, 0, 0]
    },
    min: 0,
    max: 16, // Example range, adjust as needed
    axisLine: {
      show: true,
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.7)'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
        type: 'dashed'
      }
    }
  },
  series: [{
    name: '水位',
    type: 'line',
    smooth: true,
    symbol: 'none', 
    lineStyle: {
      color: '#00E5FF',
      width: 2
    },
    itemStyle: {
      color: '#00E5FF'
    },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: 'rgba(0, 229, 255, 0.5)'
        },
        {
          offset: 1,
          color: 'rgba(0, 229, 255, 0)'
        }
      ])
    },
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, analysisTimeOptions.find(opt => opt.value === selectedWaterTime.value).xAxis.length),
    markLine: {
      symbol: 'none',
      label: { 
        show: true,
        color: 'rgba(255, 255, 255, 0.7)',
        formatter: '{b}',
      },
      data: [
        {
          name: '红色警戒线',
          yAxis: 14, // Example value, adjust based on actual data range
          lineStyle: { color: '#ff4d4f', type: 'dashed' },
          label: { formatter: '红色警戒线', position: 'insideEndTop' }
        },
        {
          name: '橙色警戒线',
          yAxis: 12, // Example value, adjust based on actual data range
          lineStyle: { color: '#faad14', type: 'dashed' },
          label: { formatter: '橙色警戒线', position: 'insideEndTop' }
        }
      ]
    }
  }]
});

function initChart() {
  if (chartDom.value && !myChart) { 
    myChart = echarts.init(chartDom.value);
    myChart.setOption(waterLevelOption.value);
  }
}

function resizeChart() {
  if (myChart) {
    myChart.resize();
  }
}

function onWaterTimeChange(val) {
  const option = analysisTimeOptions.find(item => item.value === val);
  if(option && myChart) {
    waterLevelOption.value.xAxis.data = option.xAxis;
    // Ensure data slicing matches new xAxis length
    waterLevelOption.value.series[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, option.xAxis.length);
    myChart.setOption(waterLevelOption.value, true);
  }
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null; 
  }
  window.removeEventListener('resize', resizeChart);
});

</script>

<style scoped>
.water-level-chart-container {
  width: 100%;
  /* height: 280px;  */
  display: flex;
  flex-direction: column;
  background-color: rgba(0,0,0,0.1); /* Consistent with other charts */
  padding: 5px;
  border-radius: 4px;
}

.water-overview {
  display: flex;
  justify-content: space-around; 
  padding: 5px 0px 10px 0px;
  margin-bottom: 5px;
}

.water-overview-item {
  display: flex;
  align-items: center;
  flex: 1; 
  justify-content: center;
  padding: 5px 10px;
  border-radius: 3px;
}

.overview-icon-img {
  width: 55px;
  height: 55px;
  margin-right: 15px;
}

.overview-text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.overview-title {
  font-size: 12px;
  color: #B0BEC5;
  margin-bottom: 2px;
}

.overview-value {
  font-size: 18px;
  font-weight: bold;
}

.overview-value.value-highlight {
  color: #00E5FF; 
}

.overview-value.status-normal {
  color: #66BB6A;
}

.overview-value.status-warning {
  color: #E6A23C;
}

.overview-value.status-danger {
  color: #F56C6C;
}

.chart-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 5px 5px 5px; 
  margin:20px 0;
}

.chart-select {
  width: 100px;
}

.chart {
  width: 100%;
  flex-grow: 1;
  height: 280px;
}

/* el-select 样式调整 - 兼容 Element Plus 2.7.7 */
.chart-select :deep(.el-select .el-input__wrapper) {
  background-color: transparent !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
  box-shadow: none !important;
}

.chart-select :deep(.el-select__wrapper) {
  background-color: transparent !important;
}

.chart-select :deep(.el-select .el-input__inner) {
  color: #E0F2F7 !important;
}

.chart-select :deep(.el-select .el-input__placeholder) {
  color: rgba(224, 242, 247, 0.6) !important;
}

.chart-select :deep(.el-select__selected-item span),
.chart-select :deep(.el-select__placeholder span) {
  color: #fff !important;
}

.chart-select :deep(.el-select .el-select__caret),
.chart-select :deep(.el-select .el-select__suffix) {
  color: #E0F2F7 !important;
}

/* 下拉框样式 - 由于设置了 teleported="false"，下拉框会在当前组件内 */
.chart-select :deep(.el-select-dropdown) {
  background-color: rgba(3,27,56,0.95) !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
}

.chart-select :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #E0F2F7 !important;
  background-color: transparent !important;
}

.chart-select :deep(.el-select-dropdown .el-select-dropdown__item.hover),
.chart-select :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(0,122,255,0.3) !important;
  color: #E0F2F7 !important;
}

.chart-select :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  color: #409EFF !important;
  background-color: rgba(0,122,255,0.2) !important;
  font-weight: bold;
}
</style> 