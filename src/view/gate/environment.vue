<template>
  <div class="environment-container">
    <!-- 设备选择区域 -->
    <div class="device-selector-card">
      <div class="device-selector">
        <label class="device-label">选择设备：</label>
        <el-select
          v-model="selectedDeviceCode"
          placeholder="请选择设备"
          @change="onDeviceChange"
          :loading="deviceLoading"
          :teleported="false"
        >
          <el-option
            v-for="device in deviceList"
            :key="device.deviceCode"
            :label="device.deviceName"
            :value="device.deviceCode"
          />
        </el-select>
      </div>
    </div>
    
    <!-- 指标卡片区域 -->
    <div class="indicator-cards">
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#3A47D4" size="28"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.03 3 3 7.03 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7zm0-12c-2.76 0-5 2.24-5 5 0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5z"/></svg></el-icon>
        <div class="card-title">风速</div>
        <div class="card-value">{{ envOverviewData.windSpeed.value }}m/s</div>

      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#409EFF" size="28"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></el-icon>
        <div class="card-title">气压</div>
        <div class="card-value">{{ envOverviewData.pressure.value }}kPa</div>

      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#FFB300" size="28"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 10.45l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 8a4 4 0 100 8 4 4 0 000-8zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm5.24-13.16l1.8-1.79-1.41-1.41-1.79 1.8 1.4 1.4z"/></svg></el-icon>
        <div class="card-title">气温</div>
        <div class="card-value">{{ envOverviewData.temperature.value }}°C</div>

      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#67C23A" size="28"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.66 8.93l-1.41-1.41-4.24 4.24-2.12-2.12-1.41 1.41 3.53 3.53z"/></svg></el-icon>
        <div class="card-title">湿度</div>
        <div class="card-value">{{ envOverviewData.humidity.value }}%</div>

      </div>
      <el-divider direction="vertical" />
      <div class="indicator-card">
        <el-icon class="indicator-icon" color="#1890FF" size="28"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1.1 0 2 .9 2 2 0 .74-.4 1.38-1 1.72v2.78c0 .55-.45 1-1 1s-1-.45-1-1V5.72c-.6-.34-1-.98-1-1.72 0-1.1.9-2 2-2zm4.24 7.17c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L16.24 9.17zM11 14.5V9c0-.55.45-1 1-1s1 .45 1 1v5.5c1.21-.91 2-2.37 2-4 0-2.76-2.24-5-5-5s-5 2.24-5 5c0 1.63.79 3.09 2 4z"/></svg></el-icon>
        <div class="card-title">降水量</div>
        <div class="card-value">{{ envOverviewData.rainfall.value }}mm</div>

      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
           <div class="chart-item">
        <div class="chart-title">温/湿度监测
          <span style="margin-left:auto;display:flex;align-items:center;">
            <span style="margin-right:6px;">分析时间:</span>
            <el-select :teleported='false' v-model="selectedTempHumidTime"   class="chart-select" @change="onTempHumidTimeChange">
              <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </div>
        <v-chart class="chart" :option="tempHumidOption" />
      </div>
      <div class="chart-item">
        <div class="chart-title">水位监测
          <span style="margin-left:auto;display:flex;align-items:center;">
            <span style="margin-right:6px;">分析时间:</span>
            <el-select :teleported='false' v-model="selectedWaterTime"   class="chart-select" @change="onWaterTimeChange">
              <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </div>
        <v-chart class="chart" :option="waterLevelOption" />
      </div>
      <div class="chart-item">
        <div class="chart-title">降水量监测
          <span style="margin-left:auto;display:flex;align-items:center;">
            <span style="margin-right:6px;">分析时间:</span>
            <el-select :teleported='false' v-model="selectedRainTime"   class="chart-select" @change="onRainTimeChange">
              <el-option v-for="item in analysisTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </div>
        <v-chart class="chart" :option="rainfallOption" />
      </div>
 
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
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
import { ElIcon, ElSelect, ElOption } from 'element-plus';
import { useStore } from '@/store/pinia';
import { getEnvMcvTitleCollect, getWaterLevelMcsAnalyse, getTemperatureHumidityMcsAnalyse, getPrecipitationMcsAnalyse, getCurrentPrecipitation } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';
import { getAlertRulePage } from '@/api/alert';

const store = useStore();

// 警戒线数据
const alertRules = ref({
  waterLevel: null,
  precipitation: null
});

// 时间选项配置
const analysisTimeOptions = [
  { label: '近24小时', value: '24h', xAxis: Array.from({length:24},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近12小时', value: '12h', xAxis: Array.from({length:12},(_,i)=>`${i.toString().padStart(2,'0')}:00`) },
  { label: '近6小时', value: '6h', xAxis: Array.from({length:6},(_,i)=>`${i.toString().padStart(2,'0')}:00`) }
];

// 选中的时间类型
const selectedWaterTime = ref('24h');
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
  },
  rainfall: {
    value: 0,
    state: 'normal'
  }
});

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

// 定时器引用
const envDataTimer = ref(null);

// 设备管理相关
const deviceList = ref([]);
const selectedDeviceCode = ref('');
const deviceLoading = ref(false);
const envDataLoading = ref(false);

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    deviceLoading.value = true;
    const response = await getDeviceManagementPage({
      page: 1,
      limit: 100,
      key: '',
      mcsType: 'env'
    });
    if (response && response.list) {
      deviceList.value = response.list;
      // 如果有设备，默认选择第一个
      if (deviceList.value.length > 0) {
        selectedDeviceCode.value = deviceList.value[0].deviceCode;
      }
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
  } finally {
    deviceLoading.value = false;
  }
};

// 设备变化处理
const onDeviceChange = async () => {
  if (selectedDeviceCode.value && selectedDamNode.value) {
    try {
      envDataLoading.value = true;
      await fetchEnvironmentOverviewData(selectedDamNode.value);
      // 设备变化时也要更新温湿度数据
      await fetchTemperatureHumidityData(selectedDamNode.value.id, selectedTempHumidTime.value);
      // 设备变化时也要更新降水量数据
      await fetchPrecipitationData(selectedDamNode.value.id, selectedRainTime.value);
    } catch (error) {
      console.error('设备变化时获取数据失败:', error);
    } finally {
      envDataLoading.value = false;
    }
  }
};

// 获取告警规则数据
const fetchAlertRules = async () => {
  try {
    const response = await getAlertRulePage({
      page: 1,
      limit: 100,
      warnType: 'env'
    });
    
    if (response && response.list) {
      // 查找水位监测规则（取第一个）
      const waterLevelRule = response.list.find(rule => rule.ruleName === '水位监测');
      if (waterLevelRule) {
        alertRules.value.waterLevel = parseFloat(waterLevelRule.warnValue);
      }
      
      // 查找降水量监测规则（取第一个）
      const precipitationRule = response.list.find(rule => rule.ruleName === '降水量监测');
      if (precipitationRule) {
        alertRules.value.precipitation = parseFloat(precipitationRule.warnValue);
      }
      
      // 更新图表警戒线
      updateAlertLines();
    }
  } catch (error) {
    console.error('获取告警规则失败:', error);
  }
};

// 更新图表警戒线
const updateAlertLines = () => {
  // 更新水位图表警戒线
  if (alertRules.value.waterLevel !== null) {
    waterLevelOption.value.series[0].markLine.data = [{
      name: '警戒线',
      yAxis: alertRules.value.waterLevel,
      lineStyle: { color: '#ff4d4f', type: 'dashed' },
      label: { formatter: '警戒线', position: 'insideEndTop' }
    }];
  } else {
    waterLevelOption.value.series[0].markLine.data = [];
  }
  
  // 更新降水量图表警戒线
  if (alertRules.value.precipitation !== null) {
    rainfallOption.value.series[0].markLine.data = [{
      name: '警戒线',
      yAxis: alertRules.value.precipitation,
      lineStyle: { color: '#ff4d4f', type: 'dashed' },
      label: { formatter: '警戒线', position: 'insideEndTop' }
    }];
  } else {
    rainfallOption.value.series[0].markLine.data = [];
  }
};

// 获取环境监测概览数据
const fetchEnvironmentOverviewData = async (reservoirNode) => {
  if (!selectedDeviceCode.value) {
    console.warn('未选择设备');
    return;
  }
  
  try {
    const res = await getEnvMcvTitleCollect({
      id: selectedDeviceCode.value
    });
    console.log('Environment页面: 获取环境监测数据', res);
    
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
    
    // 获取降水量数据 - 使用选中的设备编码
    const precipitationRes = await getCurrentPrecipitation({
      id: selectedDeviceCode.value
    });
    console.log('Environment页面: 获取降水量数据', precipitationRes);
    
    // 处理降水量数据，如果接口返回 null 或数据为空，则显示 0
    if (precipitationRes) {
      envOverviewData.value.rainfall.value = precipitationRes.dailyRainfall || 0;
    } else {
      // 接口返回 null 时，降水量显示为 0
      envOverviewData.value.rainfall.value = 0;
    }
  } catch (error) {
    console.error('获取环境监测概览数据失败:', error);
    // 发生错误时，设置默认值为 0
    envOverviewData.value.pressure.value = 0;
    envOverviewData.value.windSpeed.value = 0;
    envOverviewData.value.temperature.value = 0;
    envOverviewData.value.humidity.value = 0;
    envOverviewData.value.rainfall.value = 0;
  }
};

// 启动环境数据定时器
const startEnvironmentDataTimer = (reservoirNode) => {
  // 清除现有定时器
  if (envDataTimer.value) {
    clearInterval(envDataTimer.value);
  }
  
  // 立即获取一次数据
  setTimeout(() => {
    fetchEnvironmentOverviewData(reservoirNode);
  }, 100);
  
  // 设置定时器，每30秒获取一次
  envDataTimer.value = setInterval(() => {
    fetchEnvironmentOverviewData(reservoirNode);
  }, 30000);
};

// 停止环境数据定时器
const stopEnvironmentDataTimer = () => {
  if (envDataTimer.value) {
    clearInterval(envDataTimer.value);
    envDataTimer.value = null;
  }
};

// 根据选中的水库加载环境监测数据
const loadEnvironmentDataForReservoir = (reservoirNode) => {
  console.log('Environment页面: 为水库加载环境监测数据', reservoirNode);
  
  // 启动环境数据定时器
  startEnvironmentDataTimer(reservoirNode);
  
  // 更新图表数据
  updateChartsData(reservoirNode);
};

// 更新图表数据
const updateChartsData = (reservoirNode) => {
  // 模拟根据不同水库更新数据
  console.log(`正在更新 ${reservoirNode.reservoirName || reservoirNode.label} 的环境数据`);
  // 这里可以更新 waterLevelOption.value、rainfallOption.value 等
  // 调用各个监测数据接口
  fetchWaterLevelData(reservoirNode.id, selectedWaterTime.value);
  fetchTemperatureHumidityData(reservoirNode.id, selectedTempHumidTime.value);
  fetchPrecipitationData(reservoirNode.id, selectedRainTime.value);
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

// 获取水位监测数据
const fetchWaterLevelData = async (reservoirManagementId, analyseTimeType) => {
  try {
    const response = await getWaterLevelMcsAnalyse({
      analyseTimeType,
      reservoirManagementId
    });
    
    const { data, timeLabels } = fillDataArray(response, analyseTimeType, 'waterLevel');
    const xAxisData = analysisTimeOptions.find(item => item.value === analyseTimeType)?.xAxis || [];
    
    // 使用实际时间标签或默认标签
    const finalXAxisData = timeLabels.some(label => label) ? timeLabels : xAxisData;
    
    // 更新水位图表
    waterLevelOption.value.xAxis.data = finalXAxisData;
    waterLevelOption.value.series[0].data = data;
    
    console.log('水位监测数据:', response, '补足后:', data);
  } catch (error) {
    console.error('获取水位监测数据失败:', error);
  }
};

// 获取温湿度监测数据
const fetchTemperatureHumidityData = async (reservoirManagementId, analyseTimeType) => {
  try {
    const response = await getTemperatureHumidityMcsAnalyse({
      deviceCode: selectedDeviceCode.value,
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
const fetchPrecipitationData = async (reservoirManagementId, analyseTimeType) => {
  try {
    const response = await getPrecipitationMcsAnalyse({
      analyseTimeType,
      deviceCode: selectedDeviceCode.value
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

// 监听选中节点变化
watch(selectedDamNode, (newNode, oldNode) => {
  if (newNode && newNode.id) {
    console.log('Environment页面: 检测到选中节点变化', newNode);
    // 在这里可以根据选中的水库重新加载环境监测数据
    loadEnvironmentDataForReservoir(newNode);
  }
});

// 在组件挂载时也要确保加载数据
onMounted(() => {
  // 先获取告警规则
  fetchAlertRules();
  
  // 获取设备列表
  fetchDeviceList();
  
  // if (selectedDamNode.value && selectedDamNode.value.id) {
  //   loadEnvironmentDataForReservoir(selectedDamNode.value);
  // }
});

// 组件销毁时清除定时器
onUnmounted(() => {
  stopEnvironmentDataTimer();
});

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

const waterLevelOption = ref({
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
    boundaryGap: false,
    data: analysisTimeOptions.find(item => item.value === '24h')?.xAxis || []
  },
  yAxis: {
    type: 'value',
    name: '水位(m)',
    inverse: false,
    //设置name的位置
    nameLocation: 'end',
    min: 0,
    max: 16
  },
  series: [{
    name: '水位',
    type: 'line',
    smooth: true,
    areaStyle: {
      opacity: 1,
      color: {
        type: 'linear',
        x: 1,
        y: 0,
        x2: 0,
        y2: 0,
        colorStops: [{
          offset: 0,
          color: 'rgba(58, 71, 212, 0.6)'
        }, {
          offset: 1,
          color: 'rgba(58, 71, 212, 0.1)'
        }]
      }
    },
    data: [],
    markLine: {
      symbol: 'none',
      label: { show: true },
      data: []
    }
  }]
});

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
    data: ['温度', '湿度']
  },
  xAxis: {
    type: 'category',
    data: analysisTimeOptions.find(item => item.value === '24h')?.xAxis || []
  },
  yAxis: [
    {
      type: 'value',
      name: '温度(°C)',
      min: 0,
      max: 50
    },
    {
      type: 'value',
      name: '湿度(%)',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: [
    {
      name: '温度',
      type: 'line',
      smooth: true,
      data: []
    },
    {
      name: '湿度',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: []
    }
  ]
});

function onWaterTimeChange(val) {
  // 切换时间时重新获取数据
  if (selectedDamNode.value && selectedDamNode.value.id) {
    fetchWaterLevelData(selectedDamNode.value.id, val);
  }
}
function onRainTimeChange(val) {
  // 切换时间时重新获取数据
  if (selectedDamNode.value && selectedDamNode.value.id) {
    fetchPrecipitationData(selectedDamNode.value.id, val);
  }
}
function onTempHumidTimeChange(val) {
  // 切换时间时重新获取数据
  if (selectedDamNode.value && selectedDamNode.value.id) {
    fetchTemperatureHumidityData(selectedDamNode.value.id, val);
  }
}
</script>

<style lang="scss" scoped>
.environment-container {
  // padding: 20px;
  
  .device-selector-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
    
    .device-selector {
      display: flex;
      align-items: center;
      
      .device-label {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-right: 12px;
        white-space: nowrap;
      }
      
      :deep(.el-select) {
        width: 200px;
      }
    }
  }
  
  h1 {
    margin-bottom: 20px;
    font-size: 24px;
    color: #1976d2;
  }

  .indicator-cards {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .indicator-card {
      flex: 1;
      text-align: center;

      .card-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 24px;
        color: #303133;
        margin-bottom: 8px;
      }

      .card-status {
        font-size: 12px;
        &.normal {
          color: #67c23a;
        }
        &.warning {
          color: #e6a23c;
        }
        &.danger {
          color: #f56c6c;
        }
      }
    }
  }

  .charts-container {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;

    .chart-item {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .chart-title {
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .chart-select {
          margin-left: 12px;
          width: 100px;
        }
      }

      .chart {
        height: 300px;
      }
    }
  }
}
</style>