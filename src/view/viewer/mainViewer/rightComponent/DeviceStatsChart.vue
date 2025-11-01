<template>
  <div ref="chartDom" style="width: 95%;height: 280px;"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted, ref, reactive } from 'vue';
import { getDeviceManagementPage } from '@/api/device';

var chartDom = ref(null);
var myChart: echarts.ECharts;
var option: any;

// 设备监测数据
const deviceData = reactive({
  categories: ['环境', '应力', '位移', '渗压', '渗流'],
  counts: [0, 0, 0, 0, 0],
});

var maxValue = 30;
// 创建外壳数据
var shellData = deviceData.counts.map(() => maxValue);

// 设备类型映射
const deviceTypeMap = {
  'env': 0,      // 环境
  'stress': 1,   // 应力
  'displacement': 2, // 位移
  'pressure': 3, // 渗压
  'seepage': 4   // 渗流
};

// 获取设备统计数据
const fetchDeviceStats = async () => {
  try {
    const params = {
      limit: 1000,
      page: 1
    };
    
    const response: any = await getDeviceManagementPage(params);
    
    // 重置计数
    deviceData.counts = [0, 0, 0, 0, 0];
    
    // 统计各类型设备数量
    if (response && response.list) {
      response.list.forEach((device: any) => {
        const typeIndex = deviceTypeMap[device.mcsType as keyof typeof deviceTypeMap];
        if (typeIndex !== undefined) {
          deviceData.counts[typeIndex]++;
        }
      });
    }
    
    // 更新最大值
    const maxCount = Math.max(...deviceData.counts);
    maxValue = Math.max(30, Math.ceil(maxCount * 1.2));
    
    // 更新外壳数据
    shellData = deviceData.counts.map(() => maxValue);
    
    // 更新图表
    updateChart();
  } catch (error) {
    console.error('获取设备数据失败:', error);
  }
};

// 更新图表配置
const updateChart = () => {
  if (!myChart) return;
  
  const newOption = {
    ...option,
    yAxis: [{
      ...option.yAxis[0],
      max: maxValue,
      interval: Math.ceil(maxValue / 6)
    }],
    series: [
      {
        ...option.series[0],
        data: deviceData.counts
      },
      {
        ...option.series[1],
        data: shellData
      }
    ]
  };
  
  myChart.setOption(newOption);
};

option = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params: any) {
      const barParam = params.find((p: any) => p.seriesType === 'bar' && p.seriesIndex === 0);
      if (barParam) {
        const dataIndex = barParam.dataIndex;
        return `${deviceData.categories[dataIndex]}<br/>数量: ${barParam.value} 个`;
      }
      return '';
    }
  },
  grid: {
    top: '20%',
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: deviceData.categories,
      axisPointer: {
        type: 'shadow'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
          width: 1
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        interval: 0,
        rotate: 0
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '设备(个)',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        align: 'right',
        padding: [0, -25, 0, 0]
      },
      min: 0,
      max: maxValue,
      interval: 5,
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '{value}',
        color: 'rgba(255, 255, 255, 0.8)'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(155, 226, 255, 0.6)'
        }
      }
    }
  ],
  series: [
    {
      name: '设备数量',
      type: 'bar',
      barWidth: '40%',
      data: deviceData.counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          0, 0, 0, 1,
          [
            { offset: 0, color: 'rgba(20,197,255,1)' },
            { offset: 1, color: 'rgba(20,197,255,0.7)' }
          ]
        ),
        borderRadius: [3, 3, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    {
      data: shellData,
      type: 'bar',
      barGap: '-120%',
      barWidth: '60%',
      itemStyle: {  
        color: 'rgba(0, 150, 213, 0.15)',
      },
      z: -1
    }
  ]
};

onMounted(async () => {
  myChart = echarts.init(chartDom.value);
  option && myChart.setOption(option);
  
  // 获取设备统计数据
  await fetchDeviceStats();
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize();
  });
});
</script>

<style scoped></style>