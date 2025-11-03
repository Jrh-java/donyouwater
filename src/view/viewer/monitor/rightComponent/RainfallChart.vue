<template>
  <div class="rainfall-chart-container">
    <div class="water-overview">
      <div class="water-overview-item" v-for="item in rainfallOverviewData" :key="item.title">
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
        <el-select v-model="selectedRainTime" size="small" class="chart-select" @change="onRainTimeChange">
          <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </span>
    </div>
    <div ref="chartDom" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import levelIcon from '@/assets/viewer/level.png'; // Added icon import

const chartDom = ref(null);
let myChart = null;

const analysisTimeOptions = [
  { label: '近24小时', value: '24h', xAxis: Array.from({length:24},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近12小时', value: '12h', xAxis: Array.from({length:12},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近6小时', value: '6h', xAxis: Array.from({length:6},(_,i)=>`${i.toString().padStart(2,'0')}:00`) }
];

const rainfallOverviewData = ref([
  {
    title: '今日降雨',
    value: '6.6 mm',
    icon: levelIcon, // Use unified icon
    statusClass: 'value-normal' // Example class, adjust as needed
  },
  {
    title: '降雨状态',
    value: '小雨',
    icon: levelIcon, // Use unified icon
    statusClass: 'status-normal' // Example class, adjust as needed
  }
]);

const selectedRainTime = ref('24h');

const rainfallOption = ref({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
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
    data: analysisTimeOptions.find(opt => opt.value === selectedRainTime.value).xAxis,
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
    name: '降水量(mm)',
    nameTextStyle: {
      color: 'rgba(255, 255, 255, 0.7)',
      padding: [0, 30, 0, 0]
    },
    max: 50,
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
    name: '降水量',
    type: 'bar',
    barWidth: 18,
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#409EFF' },
        { offset: 1, color: '#64B5F6' }
      ])
    },
    data: [25, 0, 28, 0, 0, 0, 8, 30, 25, 0, 0, 0, 0, 25, 28].slice(0, analysisTimeOptions.find(opt => opt.value === selectedRainTime.value).xAxis.length),
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
          yAxis: 45,
          lineStyle: { color: '#ff4d4f', type: 'dashed' },
          label: { formatter: '红色警戒线', position: 'insideEndTop' }
        },
        {
          name: '橙色警戒线',
          yAxis: 35,
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
    myChart.setOption(rainfallOption.value);
  }
}

function resizeChart() {
  if (myChart) {
    myChart.resize();
  }
}

function onRainTimeChange(val) {
  const option = analysisTimeOptions.find(item => item.value === val);
  if(option && myChart) {
    rainfallOption.value.xAxis.data = option.xAxis;
    rainfallOption.value.series[0].data = [25, 0, 28, 0, 0, 0, 8, 30, 25, 0, 0, 0, 0, 25, 28].slice(0, option.xAxis.length);
    myChart.setOption(rainfallOption.value, true);
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
.rainfall-chart-container {
  width: 100%;
  height: 280px; /* Adjusted height to match WaterLevelChart */
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1); /* Example, ensure consistent background */
  padding: 5px;
  border-radius: 4px;
}

/* Styles from WaterLevelChart.vue for overview section */
.water-overview {
  display: flex;
  justify-content: space-around;
  padding: 5px 0px 10px 0px; /* Adjusted padding */
  margin-bottom: 5px; /* Added margin */
}

.water-overview-item {
  display: flex;
  align-items: center; /* Vertically center icon and text */
  padding: 5px 10px; /* Add some padding */
  border-radius: 3px;
}
.overview-icon-img {
  width: 55px; /* Adjust icon size as needed */
  height: 55px; /* Adjust icon size as needed */
  margin-right: 15px; /* Space between icon and text */
}

.overview-text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start; /* Align text to the left */
}

.overview-title {
  font-size: 12px; /* Adjusted font size */
  color: #B0BEC5; /* Softer color for title */
  margin-bottom: 2px; /* Space between title and value */
}

.overview-value {
  font-size: 18px; /* Adjusted font size */
  font-weight: bold;
  color: #E0F2F7; /* Default value color */
}

.value-highlight {
  color: #40E0D0; /* Highlight color for specific values if ·needed */
}

.status-normal {
  color: #66BB6A; /* Green color for normal status */
}

.value-normal {
  color: #66BB6A;
}
/* End of styles from WaterLevelChart.vue */

.chart-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 5px 5px 5px; /* Adjusted padding */
}

.chart-select {
  width: 100px; /* Adjust width as needed */
}

.chart {
  width: 100%;
  flex-grow: 1; /* Allow chart to take remaining space */
  height: 180px; /* Explicit height for the chart itself */
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(3,27,56,0.8) !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
  box-shadow: none !important;
}
:deep(.el-select .el-input__inner) {
  color: #E0F2F7 !important;
}
:deep(.el-select .el-input .el-select__caret) {
  color: #E0F2F7 !important;
}

/* Ensure dropdown panel also matches dark theme */
.el-select-dropdown {
  background-color: rgba(3,27,56,0.95) !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
}

.el-select-dropdown__item {
  color: rgba(3,27,56,0.95)  !important;
  background-color: transparent !important;
}

.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: rgba(0,122,255,0.3) !important;
}

.el-select-dropdown__item.selected {
  color: #409EFF !important; /* Or your preferred highlight color */
  background-color: rgba(0,122,255,0.2) !important;
}
</style> 