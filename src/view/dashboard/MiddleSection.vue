<template>
  <div class="middle-section">
    <div class="card-container">
      <!-- 环境监测指标卡片 -->
      <div class="card environment-indicators">
        <div class="card-title">
          环境监测
          <el-select 
            v-model="selectedDeviceCode" 
            placeholder="请选择设备" 
            @change="onDeviceChange"
            style="width: 200px; margin-left: auto;"
            size="small"
            :teleported="false"
            :loading="deviceLoading"
          >
            <el-option
              v-for="device in deviceList"
              :key="device.deviceCode"
              :label="device.deviceName"
              :value="device.deviceCode"
            />
          </el-select>
        </div>
        <div class="card-content">
          <div class="indicator-cards">
            <div class="indicator-card">
              <el-icon class="indicator-icon" color="#3A47D4" size="24"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.03 3 3 7.03 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7zm0-12c-2.76 0-5 2.24-5 5 0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5z"/></svg></el-icon>
              <div class="card-title">风速</div>
              <div class="card-value">{{ envData.windSpeed }}m/s</div>
              <el-button type="primary" size="small" @click="openDetailDialog('windSpeed')" class="view-btn">查看</el-button>
            </div>
     
            <div class="indicator-card">
              <el-icon class="indicator-icon" color="#409EFF" size="24"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></el-icon>
              <div class="card-title">气压</div>
              <div class="card-value">{{ envData.pressure }}kPa</div>
              <el-button type="primary" size="small" @click="openDetailDialog('pressure')" class="view-btn">查看</el-button>
            </div>
     
            <div class="indicator-card">
              <el-icon class="indicator-icon" color="#FFB300" size="24"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 10.45l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 8a4 4 0 100 8 4 4 0 000-8zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm5.24-13.16l1.8-1.79-1.41-1.41-1.79 1.8 1.4 1.4z"/></svg></el-icon>
              <div class="card-title">气温</div>
              <div class="card-value">{{ envData.temperature }}°C</div>
              <el-button type="primary" size="small" @click="openDetailDialog('temperature')" class="view-btn">查看</el-button>
            </div>
     
            <div class="indicator-card">
              <el-icon class="indicator-icon" color="#67C23A" size="24"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.66 8.93l-1.41-1.41-4.24 4.24-2.12-2.12-1.41 1.41 3.53 3.53z"/></svg></el-icon>
              <div class="card-title">湿度</div>
              <div class="card-value">{{ envData.humidity }}%</div>
              <el-button type="primary" size="small" @click="openDetailDialog('humidity')" class="view-btn">查看</el-button>
            </div>
     
            <div class="indicator-card">
              <el-icon class="indicator-icon" color="#1890FF" size="24"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1.1 0 2 .9 2 2 0 .74-.4 1.38-1 1.72v2.78c0 .55-.45 1-1 1s-1-.45-1-1V5.72c-.6-.34-1-.98-1-1.72 0-1.1.9-2 2-2zm4.24 7.17c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L16.24 9.17zM11 14.5V9c0-.55.45-1 1-1s1 .45 1 1v5.5c1.21-.91 2-2.37 2-4 0-2.76-2.24-5-5-5s-5 2.24-5 5c0 1.63.79 3.09 2 4z"/></svg></el-icon>
              <div class="card-title">降水量</div>
              <div class="card-value">{{ envData.rainfall }}mm</div>
              <el-button type="primary" size="small" @click="openDetailDialog('rainfall')" class="view-btn">查看</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="card flood-monitoring">
        <!-- 渗流监测卡片 -->
        <div class="card-title">渗流监测</div>
        <div class="card-content seepage-monitoring-content">
          <div class="progress-item">
            <span>流量计1</span>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: 0%;"></div>
            </div>
            <span>- m³/s</span>
          </div>
          <div class="progress-item">
            <span>流量计2</span>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: 0%;"></div>
            </div>
            <span>- m³/s</span>
          </div>
          <div class="progress-item">
            <span>流量计3</span>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: 0%;"></div>
            </div>
            <span>- m³/s</span>
          </div>
        </div>
      </div>
      <div class="card displacement-monitoring">
        <!-- 位移监测卡片 -->
        <div class="card-title">位移监测</div>
        <div class="card-content">
          <div ref="displacementMonitoringChartRef" style="width: 100%; height: 200px;"></div>
        </div>
      </div>
    </div>
    
    <!-- 环境监测详情弹窗 -->
    <EnvironmentDetailDialog 
      v-model:visible="dialogVisible"
      :data-type="currentDataType"
      :device-code="selectedDeviceCode"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { ElIcon, ElDivider, ElButton, ElSelect, ElOption } from 'element-plus'
import { useStore } from '@/store/pinia'
import { getEnvMcvTitleCollect, getForwardDisplaceAvgList, getCurrentPrecipitation } from '@/api/reservoir'
import { getDeviceManagementPage } from '@/api/device'
import EnvironmentDetailDialog from './EnvironmentDetailDialog.vue'

const store = useStore()

// 图表引用
const displacementMonitoringChartRef = ref(null)

// 图表实例
let displacementMonitoringChart = null

// 设备相关数据
const deviceList = ref([])
const selectedDeviceCode = ref('')
const deviceLoading = ref(false)

// 环境监测数据
const envData = ref({
  windSpeed: 0,
  pressure: 0,
  temperature: 0,
  humidity: 0,
  rainfall: 0
})

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode)

// 定时器引用
const envDataTimer = ref(null)
const displacementDataTimer = ref(null)

// 位移数据状态
const forwardChartData = ref({
  mvcTime: [],
  moveNum: []
})

const backwardChartData = ref({
  mvcTime: [],
  moveNum: []
})

// 弹窗相关状态
const dialogVisible = ref(false)
const currentDataType = ref('temperature')

// 更新位移图表
const updateDisplacementChart = () => {
  if (!displacementMonitoringChart) return
  
  // 合并时间轴（使用正向数据的时间轴，如果为空则使用负向的）
  const timeAxis = forwardChartData.value.mvcTime.length > 0 
    ? forwardChartData.value.mvcTime 
    : backwardChartData.value.mvcTime
  
  // 准备数据系列
  const series = []
  
  // 添加正向位移数据（正值）
  if (forwardChartData.value.moveNum.length > 0) {
    series.push({
      name: '顺河向位移',
      type: 'line',
      data: forwardChartData.value.moveNum,
      smooth: true,
      lineStyle: {
        color: '#67C23A',
        width: 2
      },
      itemStyle: {
        color: '#67C23A'
      }
    })
  }
  
  // 添加负向位移数据（负值）
  if (backwardChartData.value.moveNum.length > 0) {
    series.push({
      name: '逆河向位移',
      type: 'line',
      data: backwardChartData.value.moveNum.map(val => -Math.abs(val)), // 确保为负值
      smooth: true,
      lineStyle: {
        color: '#E6A23C',
        width: 2
      },
      itemStyle: {
        color: '#E6A23C'
      }
    })
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          result += param.marker + param.seriesName + ': ' + Math.abs(param.value) + 'mm<br/>'
        })
        return result
      }
    },
    legend: {
      data: series.map(s => s.name),
      textStyle: {
        color: '#333'
      },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeAxis,
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
       min: -100,
       max: 100,
       axisLine: {
         show: false
       },
       axisLabel: {
         color: '#666',
         formatter: '{value}mm'
       },
       splitLine: {
         lineStyle: {
           color: '#eee'
         }
       }
     },
    series: series
  }
  
  displacementMonitoringChart.setOption(option)
 }

// 获取位移数据
const fetchDisplacementData = async (isForward = true) => {
  try {
    const params = {
      analyseTimeType: '24h',
      isForward: isForward,
      gateStationCode: 'FJ.JODY.FH01.Z01.STATION',
      displaceName: ''
    }

    const response = await getForwardDisplaceAvgList(params)
    
    if (response) {
      let chartData
      
      // 检查数据是否为空
      if (response.length === 0) {
        chartData = {
          mvcTime: [],
          moveNum: []
        }
      } else {
        chartData = {
          mvcTime: response.map(item => {
            // 提取时间中的小时部分，如"2025-07-04 09:00:00" -> "9点"
            const date = new Date(item.mvcTime)
            return date.getHours() + '点'
          }),
          moveNum: response.map(item => item.displaceRealValue)
        }
      }

      if (isForward) {
        forwardChartData.value = chartData
      } else {
        backwardChartData.value = chartData
      }
      
      // 当有数据时就更新图表
      updateDisplacementChart()
    }
  } catch (error) {
    console.error('获取位移数据失败:', error)
  }
}

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response = await getDeviceManagementPage({
      page: 1,
      limit: 100,
      mcsType: 'env'
    })
    
    if (response && response.list) {
      deviceList.value = response.list
      // 如果有设备，默认选择第一个
      if (deviceList.value.length > 0) {
        selectedDeviceCode.value = deviceList.value[0].deviceCode
      }
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

// 设备变化处理
const onDeviceChange = async () => {
  if (selectedDeviceCode.value && selectedDamNode.value) {
    deviceLoading.value = true
    try {
      await fetchEnvironmentData(selectedDamNode.value)
    } finally {
      deviceLoading.value = false
    }
  }
}

// 获取环境监测数据
const fetchEnvironmentData = async (reservoirNode) => {
  try {
    // 获取基础环境数据 - 使用选中的设备编码
    let res = null;
    if (selectedDeviceCode.value) {
      res = await getEnvMcvTitleCollect({
        id: selectedDeviceCode.value
      });
    }
    console.log('MiddleSection页面: 获取环境监测数据', res)
    
    // 处理环境监测数据，如果接口返回 null 或数据为空，则显示 0
    if (res) {
      envData.value.windSpeed = res.windSpeed || 0
      envData.value.pressure = res.airPressure || 0
      envData.value.temperature = res.temperature || 0
      envData.value.humidity = res.humidity || 0
    } else {
      // 接口返回 null 时，所有数据显示为 0
      envData.value.windSpeed = 0
      envData.value.pressure = 0
      envData.value.temperature = 0
      envData.value.humidity = 0
    }
    
    // 获取降水量数据 - 使用选中的设备编码
    if (selectedDeviceCode.value) {
      const precipitationRes = await getCurrentPrecipitation({
        id: selectedDeviceCode.value
      })
      console.log('MiddleSection页面: 获取降水量数据', precipitationRes)
      
      // 处理降水量数据，如果接口返回 null 或数据为空，则显示 0
      if (precipitationRes) {
        envData.value.rainfall = precipitationRes.dailyRainfall || 0
      } else {
        // 接口返回 null 时，降水量显示为 0
        envData.value.rainfall = 0
      }
    } else {
      // 没有选中设备时，降水量显示为 0
      envData.value.rainfall = 0
    }
  } catch (error) {
    console.error('获取环境监测数据失败:', error)
    // 发生错误时，所有数据显示为 0
    envData.value.windSpeed = 0
    envData.value.pressure = 0
    envData.value.temperature = 0
    envData.value.humidity = 0
    envData.value.rainfall = 0
  }
}

// 启动环境数据定时器
const startEnvironmentDataTimer = (reservoirNode) => {
  // 清除现有定时器
  if (envDataTimer.value) {
    clearInterval(envDataTimer.value)
  }
  
  // 立即获取一次数据
  fetchEnvironmentData(reservoirNode)
  
  // 设置定时器，每30秒获取一次
  envDataTimer.value = setInterval(() => {
    fetchEnvironmentData(reservoirNode)
  }, 30000)
}

// 停止环境数据定时器
const stopEnvironmentDataTimer = () => {
  if (envDataTimer.value) {
    clearInterval(envDataTimer.value)
    envDataTimer.value = null
  }
}

// 启动位移数据定时器
const startDisplacementDataTimer = () => {
  // 清除现有定时器
  if (displacementDataTimer.value) {
    clearInterval(displacementDataTimer.value)
  }
  
  // 立即获取一次数据
  fetchDisplacementData(true)  // 正向
  fetchDisplacementData(false) // 负向
  
  // 设置定时器，每30秒获取一次
  displacementDataTimer.value = setInterval(() => {
    fetchDisplacementData(true)  // 正向
    fetchDisplacementData(false) // 负向
  }, 30000)
}

// 停止位移数据定时器
const stopDisplacementDataTimer = () => {
  if (displacementDataTimer.value) {
    clearInterval(displacementDataTimer.value)
    displacementDataTimer.value = null
  }
}

// 打开详情弹窗
const openDetailDialog = (dataType) => {
  currentDataType.value = dataType
  dialogVisible.value = true
}

// 监听选中节点变化
watch(selectedDamNode, (newNode) => {
  if (newNode && newNode.reservoirCode) {
    console.log('MiddleSection页面: 检测到选中节点变化', newNode)
    startEnvironmentDataTimer(newNode)
  }
}, { immediate: true })



// 初始化位移监测图表
const initDisplacementMonitoringChart = () => {
  if (displacementMonitoringChartRef.value) {
    displacementMonitoringChart = echarts.init(displacementMonitoringChartRef.value)
    
    // 初始化空图表，等待数据加载
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        textStyle: {
          color: '#333'
        },
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [],
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
        min: -100,
        max: 100,
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          formatter: '{value}mm'
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series: []
    }
    
    displacementMonitoringChart.setOption(option)
  }
}

// 窗口大小改变时重新调整图表大小
const handleResize = () => {
  displacementMonitoringChart && displacementMonitoringChart.resize()
}

onMounted(() => {
  initDisplacementMonitoringChart()
  window.addEventListener('resize', handleResize)
  
  // 获取设备列表
  fetchDeviceList()
  
  // 在组件挂载时也要确保加载环境数据
  if (selectedDamNode.value && selectedDamNode.value.reservoirCode) {
    startEnvironmentDataTimer(selectedDamNode.value)
  } else {
    startEnvironmentDataTimer({
      // id: reservoirNode.reservoirCode
      reservoirCode: "FJ.JODY.FH01"
    })
  }
  
  // 启动位移数据定时器
  startDisplacementDataTimer()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  displacementMonitoringChart && displacementMonitoringChart.dispose()
  // 清除环境数据定时器
  stopEnvironmentDataTimer()
  // 清除位移数据定时器
  stopDisplacementDataTimer()
})
</script>

<style scoped>
.middle-section {
  width: 100%;
  margin-bottom: 20px;
}

.card-container {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-content {
  min-height: 150px;
}

/* 环境监测指标卡片样式 */
.environment-indicators .card-content {
  padding: 0;
}

.indicator-cards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 30px 0;
  gap: 8px;
}

.indicator-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  flex: 1;
  text-align: center;
}

.indicator-icon {
  margin-bottom: 4px;
}

.indicator-card .card-title {
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  border: none;
  padding: 0;
}

.card-value {
  font-size: 15px;
  /* font-weight: 600; */
  color: #333;
}

.view-btn {
  margin-top: 8px;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
}

.el-divider--vertical {
  height: 60px;
  margin: 0 16px;
}

/* 泄洪监测样式 */
.seepage-monitoring-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.progress-item span {
  width: 80px;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin: 0 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #409EFF;
  border-radius: 4px;
}
</style>