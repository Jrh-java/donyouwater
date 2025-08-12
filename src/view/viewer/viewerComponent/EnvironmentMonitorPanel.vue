<template>
  <div v-if="show" class="environment-monitor-panel-overlay" @click.self="$emit('close')">
    <div class="environment-monitor-panel">
    <div class="panel-header">
      <h3>环境监测 - {{ deviceData?.name || '未知设备' }}</h3>
      <el-button @click="$emit('close')" type="text" class="close-btn">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    
    <!-- 指标卡片区域 -->
    <div class="indicator-cards">
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#3A47D4" size="28">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 3C7.03 3 3 7.03 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7zm0-12c-2.76 0-5 2.24-5 5 0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5z"/>
          </svg>
        </el-icon>
        <div class="card-title">风速</div>
        <div class="card-value">{{ envOverviewData.windSpeed.value }}m/s</div>
      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#409EFF" size="28">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
        </el-icon>
        <div class="card-title">气压</div>
        <div class="card-value">{{ envOverviewData.pressure.value }}kPa</div>
      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#FFB300" size="28">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 10.45l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 8a4 4 0 100 8 4 4 0 000-8zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm5.24-13.16l1.8-1.79-1.41-1.41-1.79 1.8 1.4 1.4z"/>
          </svg>
        </el-icon>
        <div class="card-title">气温</div>
        <div class="card-value">{{ envOverviewData.temperature.value }}°C</div>
      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#67C23A" size="28">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.66 8.93l-1.41-1.41-4.24 4.24-2.12-2.12-1.41 1.41 3.53 3.53z"/>
          </svg>
        </el-icon>
        <div class="card-title">湿度</div>
        <div class="card-value">{{ envOverviewData.humidity.value }}%</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="chart-item">
        <div class="chart-title">温/湿度监测
          <span style="margin-left:auto;display:flex;align-items:center;">
            <span style="margin-right:6px;">分析时间:</span>
            <el-select :teleported='false' v-model="selectedTempHumidTime" class="chart-select" @change="onTempHumidTimeChange">
              <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </div>
        <v-chart class="chart" :option="tempHumidOption" />
      </div>
      <div class="chart-item">
        <div class="chart-title">降水量监测
          <span style="margin-left:auto;display:flex;align-items:center;">
            <span style="margin-right:6px;">分析时间:</span>
            <el-select :teleported='false' v-model="selectedRainTime" class="chart-select" @change="onRainTimeChange">
              <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </div>
        <v-chart class="chart" :option="rainfallOption" />
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ElIcon, ElSelect, ElOption, ElButton, ElDivider } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { getEnvMcvTitleCollect, getTemperatureHumidityMcsAnalyse, getPrecipitationMcsAnalyse } from '@/api/reservoir';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  deviceData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

// 时间选项配置
const analysisTimeOptions = [
  { label: '近24小时', value: '24h', xAxis: Array.from({length:24},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近12小时', value: '12h', xAxis: Array.from({length:12},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近6小时', value: '6h', xAxis: Array.from({length:6},(_,i)=>`${i.toString().padStart(2,'0')}:00`) }
];

// 选中的时间类型
const selectedRainTime = ref('24h');
const selectedTempHumidTime = ref('24h');

const envOverviewData = ref({
  pressure: {
    value: 0,
    state: 'normal'
  },
  windSpeed: {
    value: 0,
    state: 'normal'
  },
  temperature: {
    value: 0,
    state: 'normal'
  },
  humidity: {
    value: 0,
    state: 'normal'
  }
});

// 获取环境监测概览数据
const fetchEnvironmentOverviewData = async () => {
  if (!props.deviceData?.deviceCode) {
    console.warn('未找到设备编号');
    return;
  }
  
  try {
    const res = await getEnvMcvTitleCollect({
      id: props.deviceData.deviceCode
    });
    console.log('环境监测弹窗: 获取环境监测数据', res);
    
    if (res) {
      envOverviewData.value.pressure.value = res.airPressure || 0;
      envOverviewData.value.windSpeed.value = res.windSpeed || 0;
      envOverviewData.value.temperature.value = res.temperature || 0;
      envOverviewData.value.humidity.value = res.humidity || 0;
    } else {
      // 如果返回 null，设置默认值为 0
      envOverviewData.value.pressure.value = 0;
      envOverviewData.value.windSpeed.value = 0;
      envOverviewData.value.temperature.value = 0;
      envOverviewData.value.humidity.value = 0;
    }
  } catch (error) {
    console.error('获取环境监测概览数据失败:', error);
    // 发生错误时，设置默认值为 0
    envOverviewData.value.pressure.value = 0;
    envOverviewData.value.windSpeed.value = 0;
    envOverviewData.value.temperature.value = 0;
    envOverviewData.value.humidity.value = 0;
  }
};

// 数据补足函数
const fillDataArray = (data, timeType, valueKey) => {
  const targetLength = timeType === '24h' ? 24 : timeType === '12h' ? 12 : 6;
  
  // 创建完整的数据数组，默认值为0
  const filledData = new Array(targetLength).fill(0);
  const filledTimeLabels = new Array(targetLength).fill('');
  
  // 如果有返回数据，处理数据
  if (data && data.length > 0) {
    // 由于接口返回的是降序，需要反转数组
    const reversedData = [...data].reverse();
    
    // 计算实际数据的长度（不超过目标长度）
    const actualDataLength = Math.min(reversedData.length, targetLength);
    
    // 计算需要填充的长度
    const fillLength = targetLength - actualDataLength;
    
    // 获取最早的时间作为起始点
    let startTime;
    if (reversedData[0] && reversedData[0].mcsTime) {
      const timeStr = reversedData[0].mcsTime.split(' ')[1];
      const [hours, minutes] = timeStr.split(':').map(Number);
      startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
    } else {
      // 如果没有时间数据，使用当前时间
      startTime = new Date();
    }
    
    // 先生成填充的时间标签（往前推）
    for (let i = 0; i < fillLength; i++) {
      const fillTime = new Date(startTime);
      fillTime.setHours(startTime.getHours() - (fillLength - i));
      const hours = fillTime.getHours();
      filledTimeLabels[i] = `${hours.toString().padStart(2, '0')}:00`;
    }
    
    // 然后填充实际数据（在后面）
    reversedData.forEach((item, index) => {
      if (index < actualDataLength) {
        const targetIndex = fillLength + index;
        filledData[targetIndex] = item[valueKey] || 0;
        
        // 从mcsTime中提取时间，例如："2025-05-30 11:00:00" -> "11:00"
        if (item.mcsTime) {
          const timeStr = item.mcsTime.split(' ')[1]; // 取时间部分
          const timePart = timeStr.substring(0, 5); // 取"HH:mm"
          filledTimeLabels[targetIndex] = timePart;
        }
      }
    });
  } else {
    // 如果没有数据，生成默认的时间标签（从当前时间往前推）
    const now = new Date();
    for (let i = 0; i < targetLength; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() - (targetLength - 1 - i));
      const hours = time.getHours();
      filledTimeLabels[i] = `${hours.toString().padStart(2, '0')}:00`;
    }
  }
  
  return { data: filledData, timeLabels: filledTimeLabels };
};

// 获取温湿度监测数据
const fetchTemperatureHumidityData = async (analyseTimeType) => {
  try {
    const response = await getTemperatureHumidityMcsAnalyse({
      deviceCode: props.deviceData.deviceCode,
      analyseTimeType
    });
    
    const temperatureResult = fillDataArray(response, analyseTimeType, 'temperature');
    const humidityResult = fillDataArray(response, analyseTimeType, 'humidity');
    const xAxisData = analysisTimeOptions.find(item => item.value === analyseTimeType)?.xAxis || [];
    
    // 使用实际时间标签或默认标签
    const finalXAxisData = temperatureResult.timeLabels.some(label => label) ? temperatureResult.timeLabels : xAxisData;
    
    // 更新温湿度图表
    tempHumidOption.value.xAxis.data = finalXAxisData;
    tempHumidOption.value.series[0].data = temperatureResult.data;
    tempHumidOption.value.series[1].data = humidityResult.data;
    
    console.log('温湿度监测数据:', response, '温度补足后:', temperatureResult.data, '湿度补足后:', humidityResult.data);
  } catch (error) {
    console.error('获取温湿度监测数据失败:', error);
  }
};

// 获取降水量监测数据
const fetchPrecipitationData = async (analyseTimeType) => {
  try {
    const response = await getPrecipitationMcsAnalyse({
      analyseTimeType,
      deviceCode: props.deviceData.deviceCode
    });
    
    const { data, timeLabels } = fillDataArray(response, analyseTimeType, 'dailyRainfall');
    const xAxisData = analysisTimeOptions.find(item => item.value === analyseTimeType)?.xAxis || [];
    
    // 使用实际时间标签或默认标签
    const finalXAxisData = timeLabels.some(label => label) ? timeLabels : xAxisData;
    
    // 更新降水量图表
    rainfallOption.value.xAxis.data = finalXAxisData;
    rainfallOption.value.series[0].data = data;
    
    console.log('降水量监测数据:', response, '补足后:', data);
  } catch (error) {
    console.error('获取降水量监测数据失败:', error);
  }
};

// 时间变化处理
const onTempHumidTimeChange = () => {
  fetchTemperatureHumidityData(selectedTempHumidTime.value);
};

const onRainTimeChange = () => {
  fetchPrecipitationData(selectedRainTime.value);
};

// 注册必需的 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent
]);

const rainfallOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: analysisTimeOptions.find(item => item.value === '24h')?.xAxis || []
  },
  yAxis: {
    type: 'value',
    name: '降水量(mm)',
    max: 50
  },
  series: [{
    name: '降水量',
    type: 'bar',
    barWidth: 18,
    data: [],
    markLine: {
      symbol: 'none',
      label: { show: true },
      data: []
    }
  }]
});

const tempHumidOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  legend: {
    data: ['温度', '湿度'],
    textStyle: {
      color: '#a0cfff',
      fontSize: 16
    }
  },
  xAxis: {
    type: 'category',
    data: analysisTimeOptions.find(item => item.value === '24h')?.xAxis || []
  },
  yAxis: [
    {
      type: 'value',
      name: '温度(°C)',
      position: 'left',
      axisLabel: {
        formatter: '{value} °C'
      }
    },
    {
      type: 'value',
      name: '湿度(%)',
      position: 'right',
      axisLabel: {
        formatter: '{value} %'
      }
    }
  ],
  series: [
    {
      name: '温度',
      type: 'line',
      yAxisIndex: 0,
      smooth: true,
      data: []
    },
    {
      name: '湿度',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      data: []
    }
  ]
});

// 监听设备数据变化，只有在组件显示时才执行
watch(() => [props.show, props.deviceData], ([newShow, newDeviceData]) => {
  if (newShow && newDeviceData && newDeviceData.deviceCode) {
    console.log('环境监测弹窗: 设备数据变化', newDeviceData);
    fetchEnvironmentOverviewData();
    fetchTemperatureHumidityData(selectedTempHumidTime.value);
    fetchPrecipitationData(selectedRainTime.value);
  }
});

// 当组件显示时初始化数据
watch(() => props.show, (newShow) => {
  if (newShow && props.deviceData && props.deviceData.deviceCode) {
    fetchEnvironmentOverviewData();
    fetchTemperatureHumidityData(selectedTempHumidTime.value);
    fetchPrecipitationData(selectedRainTime.value);
  }
});

onMounted(() => {
  // 移除onMounted中的自动执行，改为通过watch控制
});
</script>

<style lang="scss" scoped>
.environment-monitor-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
}

.environment-monitor-panel {
  background-color: #0a214d;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  width: 1200px;
  max-height: 85vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #0a214d;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #1e4a8c;
    border-radius: 4px;
    
    &:hover {
      background: #2a5aa0;
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: #0a214d;
  }
  
  .panel-header {
    background-color: #10306a;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #E0F2F7;
      font-size: 18px;
      font-weight: bold;
    }
    
    .close-btn {
      color: #E0F2F7;
      
      &:hover {
        color: #00CFFF;
      }
    }
  }
  
  .indicator-cards {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0e2a5a;
    border-radius: 8px;
    padding: 20px;
    margin: 0 20px 20px 20px;
    
    .indicator-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      
      .indicator-icon {
        margin-bottom: 8px;
      }
      
      .card-title {
        font-size: 14px;
        color: #a0cfff;
        margin-bottom: 4px;
      }
      
      .card-value {
        font-size: 20px;
        font-weight: bold;
        color: #E0F2F7;
      }
    }
    
    .el-divider {
      height: 60px;
      margin: 0 20px;
      border-color: #1e4a8c;
    }
  }
  
  .charts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    padding: 0 20px 20px 20px;
    overflow-y: auto;
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #0a214d;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #1e4a8c;
      border-radius: 4px;
      
      &:hover {
        background: #2a5aa0;
      }
    }
    
    &::-webkit-scrollbar-corner {
      background: #0a214d;
    }
    
    .chart-item {
      background-color: #0e2a5a;
      border: 1px solid #1e4a8c;
      border-radius: 8px;
      padding: 16px;
      
      .chart-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #E0F2F7;
        
        .chart-select {
          width: 120px;
          
          :deep(.el-input__wrapper) {
            background-color: #071a3b;
            border: 1px solid #1e4a8c;
            
            .el-input__inner {
              background-color: transparent;
              color: white;
            }
            
            .el-input__suffix {
              .el-input__suffix-inner {
                .el-select__caret {
                  color: #a0cfff;
                }
              }
            }
          }
        }
      }
      
      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }
}

// Element Plus 下拉框深色主题
:deep(.el-select-dropdown) {
  background-color: #071a3b !important;
  border: 1px solid #1e4a8c !important;
  
  .el-select-dropdown__item {
    background-color: #071a3b !important;
    color: white !important;
    
    &:hover {
      background-color: #1890ff !important;
    }
    
    &.selected {
      background-color: #1890ff !important;
      color: white !important;
    }
  }
}
</style>