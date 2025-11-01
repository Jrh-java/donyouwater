<template>
  <SubtitleFrame>
    <template #title>
      <p style="font-size: 16px; font-weight: bold; color: white; margin-bottom: 5px;">水雨情监测分析</p>
    </template>
    <template #subtitle>
      <!-- <span style="font-size: 12px; color: #a9b7c3;">更新时间: 2025-06-07 16:01:01</span> -->
    </template>
    <template #content>
      <!-- 设备选择下拉框 -->
      <div class="device-selector">
        <el-select 
          v-model="selectedDeviceCode" 
          placeholder="请选择设备" 
          @change="onDeviceChange"
          style="width: 100%; margin-bottom: 15px;"
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
      <div class="water-monitor-content">
        <!-- 数据概览部分 -->
        <div class="water-data-grid">
          <div class="water-data-item" v-for="(item, index) in waterDataList" :key="index">
            <div class="data-icon">
              <img :src="item.icon" :alt="item.label" />
            </div>
            <div class="data-info">
              <div class="data-label">{{ item.label }}</div>
              <div class="data-value">{{ item.value }}{{ item.value !== '--' ? item.unit : '' }}</div>
            </div>
          </div>
        </div>
        
        <!-- ECharts折线图部分 -->
        <div class="chart-container">
       
          <div class="chart-content">
            <div ref="chartRef" class="echarts-container"></div>
          </div>
        </div>
      </div>
    </template>
  </SubtitleFrame>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElSelect, ElOption } from 'element-plus';
import SubtitleFrame from '@/components/subtitleFrame.vue';
import { getCurrentPrecipitation, getEnvMcvTitleCollect, getPrecipitationMcsAnalyseDailyAvg } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';

// 引入图标
import img1 from '@/assets/viewer/waterMonitor/img1.png';
import img2 from '@/assets/viewer/waterMonitor/img2.png';
import img3 from '@/assets/viewer/waterMonitor/img3.png';
import img4 from '@/assets/viewer/waterMonitor/img4.png';
import img5 from '@/assets/viewer/waterMonitor/img5.png';
import img6 from '@/assets/viewer/waterMonitor/img6.png';

const chartRef = ref(null);
let chartInstance = null;

// 设备相关数据
const deviceList = ref([]);
const selectedDeviceCode = ref('');

// 降水和环境监测数据
const waterDataList = ref([
  { label: '累计降水', value: '--', icon: img1, unit: 'mm' },
  { label: '当前降水', value: '--', icon: img2, unit: 'mm' },
  { label: '瞬时降水', value: '--', icon: img3, unit: 'mm' },
  { label: '日雨量', value: '--', icon: img4, unit: 'mm' },
  { label: '风速', value: '--', icon: img5, unit: 'm/s' },
  { label: '气压', value: '--', icon: img6, unit: 'kPa' }
]);

// 折线图数据
const chartData = ref({
  dates: [],
  values: []
});

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response = await getDeviceManagementPage({
      page: 1,
      limit: 100,
      mcsType: 'env'
    });
    
    if (response && response.list) {
      deviceList.value = response.list;
      // 如果有设备，默认选择第一个
      if (deviceList.value.length > 0) {
        selectedDeviceCode.value = deviceList.value[0].deviceCode;
        fetchData();
      }
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
  }
};

// 设备变化处理
const onDeviceChange = () => {
  if (selectedDeviceCode.value) {
    fetchData();
  }
};

// 获取降水和环境监测数据
const fetchData = async () => {
  try {
    if (!selectedDeviceCode.value) {
      console.warn('未选择设备');
      return;
    }
    
    // 获取降水数据
    const precipitationData = await getCurrentPrecipitation({ id: selectedDeviceCode.value });
    
    // 获取环境监测数据 - 使用选中的设备编码
    const envData = await getEnvMcvTitleCollect({ id: selectedDeviceCode.value });
    
    // 获取降水量趋势数据
    const chartResponse = await getPrecipitationMcsAnalyseDailyAvg({
      deviceCode: selectedDeviceCode.value
    });
    
    // 更新降水数据 - 兼容 null 返回值
    if (precipitationData && precipitationData !== null) {
      waterDataList.value[0].value = precipitationData.totalPrecipitation || '--';
      waterDataList.value[1].value = precipitationData.currentPrecipitation || '--';
      waterDataList.value[2].value = precipitationData.momentRainfall || '--';
      waterDataList.value[3].value = precipitationData.dailyRainfall || '--';
    } else {
      // 当接口返回 null 时，设置默认值
      waterDataList.value[0].value = '--';
      waterDataList.value[1].value = '--';
      waterDataList.value[2].value = '--';
      waterDataList.value[3].value = '--';
    }
    
    // 更新环境监测数据 - 兼容 null 返回值
    if (envData && envData !== null) {
      waterDataList.value[4].value = envData.windSpeed || '--';
      waterDataList.value[5].value = envData.airPressure || '--';
    } else {
      // 当接口返回 null 时，设置默认值
      waterDataList.value[4].value = '--';
      waterDataList.value[5].value = '--';
    }
    
    // 更新图表数据
    if (chartResponse && Array.isArray(chartResponse)) {
      chartData.value = {
        dates: chartResponse.map(item => {
          // 提取日期，格式化为 MM-DD
          const date = new Date(item.mcsTime);
          return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }),
        values: chartResponse.map(item => item.dailyRainfall || 0)
      };
    } else {
      // 如果接口返回 null 或空数组，使用默认数据
      chartData.value = {
        dates: ['06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07'],
        values: [0, 0, 0, 0, 0, 0, 0]
      };
    }
    
    // 更新图表
    updateChart();
  } catch (error) {
    console.error('获取数据失败:', error);
    // 发生错误时，重置所有数据为默认值
    waterDataList.value.forEach(item => {
      item.value = '--';
    });
    // 重置图表数据
    chartData.value = {
      dates: ['06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07'],
      values: [0, 0, 0, 0, 0, 0, 0]
    };
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance) return;
  
  const option = {
    xAxis: {
      data: chartData.value.dates
    },
    series: [{
      data: chartData.value.values
    }]
  };
  
  chartInstance.setOption(option);
};

// 初始化ECharts
const initChart = () => {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '5%',
      right: '5%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.dates,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: '#a9b7c3',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '单位：mm',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        align: 'right',
        padding: [0, -25, 0, 0]
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'solid'
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#a9b7c3',
        fontSize: 11
      }
      
    },
    series: [
      {
        data: chartData.value.values,
        type: 'line',
        smooth: true,
        symbol: 'none', // 隐藏节点
        lineStyle: {
          color: '#00BFFF',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 191, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(0, 191, 255, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#00BFFF',
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 191, 255, 0.9)',
      borderColor: 'rgba(0, 191, 255, 0.9)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      formatter: function(params) {
        const point = params[0];
        return `${point.name}<br/>降水量: ${point.value}mm`;
      }
    }
  };
  
  chartInstance.setOption(option);
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
};

onMounted(async () => {
  await nextTick();
  initChart();
  fetchDeviceList();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', () => {
    chartInstance?.resize();
  });
});
</script>

<style scoped>
.device-selector {
  /* margin-bottom: 15px; */
}

.device-selector .el-select {
  width: 100%;
}

/* 新增 el-select 样式调整 - 兼容 Element Plus 2.7.7 */
.device-selector :deep(.el-select) {
  --el-select-input-color: #E0F2F7;
  --el-select-border-color-hover: #007E99;
}

.device-selector :deep(.el-select .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #007E99 inset !important;
  border: none !important;
}

.device-selector :deep( .el-select__wrapper) {
  background-color: transparent !important;
}

.device-selector :deep(.el-select .el-input__inner) {
  color: #E0F2F7 !important;
}

.device-selector :deep(.el-select .el-input__placeholder) {
  color: rgba(224, 242, 247, 0.6) !important;
}

.device-selector :deep(.el-select__selected-item span),
.device-selector :deep(.el-select__placeholder span) {
  color: #fff !important;
}

.device-selector :deep(.el-select .el-select__caret) {
  color: #00CFFF !important;
}

.device-selector :deep(.el-select .el-select__suffix) {
  color: #00CFFF !important;
}

/* 下拉框样式 - 由于设置了 teleported="false"，下拉框会在当前组件内 */
.device-selector :deep(.el-select-dropdown) {
  background-color: rgba(11, 27, 51, 0.95) !important;
  border: 1px solid #1E3F66 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.device-selector :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #E0F2F7 !important;
  background-color: transparent !important;
}

.device-selector :deep(.el-select-dropdown .el-select-dropdown__item.hover),
.device-selector :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(0, 126, 153, 0.3) !important;
  color: #E0F2F7 !important;
}

.device-selector :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  color: #00CFFF !important;
  font-weight: bold;
  background-color: rgba(0, 207, 255, 0.1) !important;
}

/* 确保下拉框在组件内部时的 z-index */
.device-selector :deep(.el-popper) {
  z-index: 2000 !important;
}

.water-monitor-content {
  width: 100%;
  color: white;
}

.water-data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  /* margin-bottom: 15px; */
}

.water-data-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-icon {
  width: 35px;
  height: 35px;
  flex-shrink: 0;
}

.data-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.data-info {
  flex: 1;
  min-width: 0;
}

.data-label {
  font-size: 11px;
  color: #a9b7c3;
  margin-bottom: 2px;
  white-space: nowrap;
}

.data-value {
  font-size: 16px;
  font-weight: bold;
  color: #00BFFF;
  line-height: 1;
}

.chart-container {
  /* margin-top: 15px; */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #a9b7c3;
}

.chart-date {
  color: #00BFFF;
}

.chart-content {
  background: transparent;
  border-radius: 8px;
  padding: 5px 0;
}

.echarts-container {
  width: 100%;
  height: 200px;
}
</style>