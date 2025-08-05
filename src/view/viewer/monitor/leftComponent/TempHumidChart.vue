<template>
  <div class="temp-humid-chart-container">
    <div class="water-overview">
      <div class="water-overview-item" v-for="item in tempHumidOverviewData" :key="item.title">
         <img :src="item.icon" :alt="item.title" class="overview-icon-img">
         <div class="overview-text-content">
           <div class="overview-title">{{ item.title }}</div>
           <div :class="['overview-value', item.statusClass]">{{ item.value }}</div>
         </div>
      </div>
    </div>
    <div class="chart-header">
      <span style="margin-left:auto;display:flex;align-items:center;">
        <span style="margin-right:6px;color:#E0F2F7;">分析时间:</span>
        <el-select v-model="selectedTempHumidTime"   class="chart-select" :teleported="false" @change="onTempHumidTimeChange">
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

// 假设你有一个Pinia store
// import { useMonitorStore } from '@/store/monitorStore'; // 替换为你的store路径

const chartDom = ref(null);
let myChart = null;

// const monitorStore = useMonitorStore(); // 初始化store

// watch(() => monitorStore.selectedDamId, (newDamId, oldDamId) => {
//   if (newDamId && newDamId !== oldDamId) {
//     console.log(`TempHumidChart: Detected damId change to ${newDamId}. Reloading chart data.`);
//     // 在这里根据 newDamId 重新获取或更新图表数据
//     if (myChart) {
//       // 示例: 
//       // tempHumidOption.value.series[0].data = getNewTempDataForDam(newDamId);
//       // tempHumidOption.value.series[1].data = getNewHumidDataForDam(newDamId);
          // myChart.setOption(tempHumidOption.value, true);
//       console.log('TempHumidChart: Chart would be updated here.');
//     }
//   }
// });

const analysisTimeOptions = [
  { label: '近24小时', value: '24h', xAxis: Array.from({length:24},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近12小时', value: '12h', xAxis: Array.from({length:12},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近6小时', value: '6h', xAxis: Array.from({length:6},(_,i)=>`${i.toString().padStart(2,'0')}:00`) }
];
const tempHumidOverviewData=ref([
  {
    title: '当前温度',
    value: '24 °C',
    icon: levelIcon,
    statusClass: 'value-normal'
  },
  {
    title: '当前湿度',
    value: '75 %',
    icon: levelIcon,
    statusClass: 'value-normal'
  }
]);
const selectedTempHumidTime = ref('24h');

const tempHumidOption = ref({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['温度', '湿度'],
    textStyle: {
      color: 'rgba(255, 255, 255, 0.8)'
    },
    right: 10,
    top: 0,
    itemGap: 10,
    itemWidth: 15,
    itemHeight: 10
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '8%',
    top: '18%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: analysisTimeOptions.find(opt => opt.value === selectedTempHumidTime.value).xAxis,
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.7)'
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '温度(°C)',
      min: 0,
      max: 50,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        padding: [0, 30, 0, 0]
      },
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
    {
      type: 'value',
      name: '湿度(%)',
      min: 0,
      max: 100,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        padding: [0, 0, 0, 30]
      },
      axisLabel: {
        formatter: '{value}%',
        color: 'rgba(255, 255, 255, 0.7)'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '温度',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#FFB300',
        width: 2
      },
      itemStyle: {
        color: '#FFB300'
      },
      data: [8, 8, 8, 9, 9, 9, 10, 11, 12, 12, 12, 11, 11, 12, 13].slice(0, analysisTimeOptions.find(opt => opt.value === selectedTempHumidTime.value).xAxis.length)
    },
    {
      name: '湿度',
      type: 'line',
      smooth: true,
      symbol: 'none',
      yAxisIndex: 1,
      lineStyle: {
        color: '#67C23A',
        width: 2
      },
      itemStyle: {
        color: '#67C23A'
      },
      data: [55, 65, 70, 65, 60, 65, 70, 70, 70, 65, 60, 60, 65, 65, 70].slice(0, analysisTimeOptions.find(opt => opt.value === selectedTempHumidTime.value).xAxis.length)
    }
  ]
});

function initChart() {
  if (chartDom.value && !myChart) {
    myChart = echarts.init(chartDom.value);
    myChart.setOption(tempHumidOption.value);
  }
}

function resizeChart() {
  if (myChart) {
    myChart.resize();
  }
}

function onTempHumidTimeChange(val) {
  const option = analysisTimeOptions.find(item => item.value === val);
  if(option && myChart) {
    tempHumidOption.value.xAxis.data = option.xAxis;
    tempHumidOption.value.series[0].data = [8, 8, 8, 9, 9, 9, 10, 11, 12, 12, 12, 11, 11, 12, 13].slice(0, option.xAxis.length);
    tempHumidOption.value.series[1].data = [55, 65, 70, 65, 60, 65, 70, 70, 70, 65, 60, 60, 65, 65, 70].slice(0, option.xAxis.length);
    myChart.setOption(tempHumidOption.value, true);
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
.temp-humid-chart-container {
  width: 100%;
  /* height: 280px; */
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
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
  color: #E0F2F7;
}

.value-highlight {
  color: #40E0D0;
}

.status-normal {
  color: #66BB6A;
}

.value-normal {
  color: #66BB6A;
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