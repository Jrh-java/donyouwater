<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="800px"
    :lock-scroll="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div class="dialog-content">
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElDialog } from 'element-plus'
import { getEnvMcvTitleCollectDaily, getPrecipitationMcsAnalyseDailyAvg } from '@/api/reservoir'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    default: 'temperature' // temperature, humidity, windSpeed, pressure, rainfall
  },
  deviceCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible'])

const chartRef = ref(null)
let chart = null

// 数据类型映射
const dataTypeMap = {
  temperature: { title: '七日平均气温趋势', unit: '°C', field: 'temperature', color: '#FFB300' },
  humidity: { title: '七日平均湿度趋势', unit: '%', field: 'humidity', color: '#67C23A' },
  windSpeed: { title: '七日平均风速趋势', unit: 'm/s', field: 'windSpeed', color: '#3A47D4' },
  pressure: { title: '七日平均气压趋势', unit: 'kPa', field: 'airPressure', color: '#409EFF' },
  rainfall: { title: '七日平均降水量趋势', unit: 'mm', field: 'dailyRainfall', color: '#1890FF' }
}

// 弹窗标题
const dialogTitle = computed(() => {
  return dataTypeMap[props.dataType]?.title || '环境监测趋势'
})

// 图表数据
const chartData = ref({
  dates: [],
  values: []
})

// 获取数据
const fetchData = async () => {
  try {
    // 使用传入的设备编码或默认编码
    const deviceCodeToUse = props.deviceCode || 'FJ.JODY.FH01'

    let response
    if (props.dataType === 'rainfall') {
      // 降水量使用独立接口
      response = await getPrecipitationMcsAnalyseDailyAvg({
        deviceCode: deviceCodeToUse
      })
    } else {
      // 其他环境数据使用通用接口
      response = await getEnvMcvTitleCollectDaily({
        id: deviceCodeToUse
      })
    }

    if (response && Array.isArray(response)) {
      const fieldName = dataTypeMap[props.dataType]?.field
      
      chartData.value = {
        dates: response.map(item => {
          // 提取日期，格式化为 MM-DD
          const date = new Date(item.mcsTime)
          return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }),
        values: response.map(item => item[fieldName] || 0)
      }
      
      updateChart()
    }
  } catch (error) {
    console.error('获取环境监测数据失败:', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart) return
  
  const config = dataTypeMap[props.dataType]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const param = params[0]
        return `${param.name}<br/>${param.marker}${config.title}: ${param.value}${config.unit}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.dates,
      axisLine: {
        lineStyle: {
          color: '#eee'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#666',
        formatter: `{value}${config.unit}`
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [{
      name: config.title,
      type: 'line',
      data: chartData.value.values,
      smooth: true,
      lineStyle: {
        color: config.color,
        width: 3
      },
      itemStyle: {
        color: config.color
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: config.color + '40' // 透明度40%
          }, {
            offset: 1,
            color: config.color + '10' // 透明度10%
          }]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    
    // 窗口大小改变时重新调整图表大小
    const handleResize = () => {
      chart && chart.resize()
    }
    window.addEventListener('resize', handleResize)
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chart && chart.dispose()
    })
  }
}

// 处理弹窗关闭
const handleClose = (value) => {
  // 如果传入了value参数，使用该值，否则默认为false
  const newValue = typeof value === 'boolean' ? value : false
  emit('update:visible', newValue)
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 弹窗打开时初始化图表并获取数据
    setTimeout(() => {
      initChart()
      fetchData()
    }, 100) // 延迟确保DOM已渲染
  }
})

// 监听数据类型变化
watch(() => props.dataType, () => {
  if (props.visible) {
    fetchData()
  }
})

// 监听设备编码变化
watch(() => props.deviceCode, () => {
  if (props.visible) {
    fetchData()
  }
})
</script>

<style scoped>
.dialog-content {
  padding: 20px 0;
}
</style>