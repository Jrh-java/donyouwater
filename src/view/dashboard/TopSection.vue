<template>
  <div class="top-section">
    <div class="card-container">
      <div class="card reservoir-overview">
        <!-- 水库概况卡片 -->
        <div class="card-title">流域概况</div>
        <div class="card-content">
          <div class="reservoir-info-grid">
            <div class="info-item">
              <div class="icon-wrapper ">
                <el-icon><Box /></el-icon>
              </div>
              <div class="info-label">流域位置</div>
              <div class="info-value">{{ stats.watershedCount }}</div>
            </div>
            <div class="info-item">
              <div class="icon-wrapper ">
                <el-icon><Operation /></el-icon>
              </div>
              <div class="info-label">闸站数量</div>
              <div class="info-value">{{ stats.gateStationCount }}</div>
            </div>
            <div class="info-item">
              <div class="icon-wrapper ">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="info-label">闸门数量</div>
              <div class="info-value">{{ stats.gateCount }}</div>
            </div>
            <div class="info-item">
              <div class="icon-wrapper medium-blue">
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="info-label">设备总数</div>
              <div class="info-value">{{ stats.deviceCount }}</div>
            </div>
            <div class="info-item">
              <div class="icon-wrapper ">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="info-label">告警总数</div>
              <div class="info-value">{{ stats.alertCount }}</div>
            </div>
            <div class="info-item">
              <div class="icon-wrapper light-blue">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="info-label">已处理告警数</div>
              <div class="info-value">{{ stats.processedAlertCount }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card gate-status">
        <!-- 闸站闸门状态卡片 -->
        <div class="card-title">闸站闸门状态</div>
        <div class="card-content">
          <div class="gate-status-container">
            <div class="progress-chart">
              <el-progress type="dashboard" :percentage="gateStatusData.rate" :width="120" :stroke-width="10" :show-text="false" />
              <div class="progress-info">
                <div class="progress-value">
                  <div style='font-size:14px;color:black;'>占比</div>
                  <div>{{ gateStatusData.rate }}%</div>
                </div>
              </div>
              <div class="capacity-value">当前开启闸门数量: {{ gateStatusData.openCount }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card device-statistics">
        <!-- 设备统计卡片 -->
        <div class="card-title">设备统计</div>
        <div class="card-content">
          <div class="device-stats-container">
            <div class="chart-container" ref="pieChartRef"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { Monitor, Box, Odometer, Histogram, TrendCharts, DataLine } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDeviceManagementPage } from '@/api/device'
import { getGateStatusRate } from '@/api/reservoir'

const pieChartRef = ref(null)

// 数据统计
const stats = ref({
  watershedCount: '东游镇', // 流域数量 - 静态数据
  gateStationCount: 0, // 闸站数量
  gateCount: 0, // 闸门数量
  deviceCount: 0, // 设备总数
  alertCount: 0, // 告警总数 - 静态数据
  processedAlertCount: 0 // 已处理告警数 - 静态数据
})

// 闸门状态数据
const gateStatusData = ref({
  rate: 0, // 开启比率
  openCount: 0 // 开启数量
})

// 设备统计数据
const deviceStats = ref([])

// 设备类型字典
const deviceTypeDict = {
  'env': '环境监测',
  'stress': '应力监测',
  'displacement': '位移监测',
  'pressure': '渗压监测',
  'seepage': '渗流监测',
  'safemvs': '安防监测',
  'gate': '闸门管理',
  'gateStation': '闸站管理'
}

// 获取闸站数量
const getGateStationCount = async () => {
  try {
    const res = await getDeviceManagementPage({
      page: 1,
      limit: 10,
      mcsType: 'gateStation'
    })
    stats.value.gateStationCount = res.totalCount || 0
  } catch (error) {
    console.error('获取闸站数量失败:', error)
  }
}

// 获取闸门数量
const getGateCount = async () => {
  try {
    const res = await getDeviceManagementPage({
      page: 1,
      limit: 10,
      mcsType: 'gate'
    })
    stats.value.gateCount = res.totalCount || 0
  } catch (error) {
    console.error('获取闸门数量失败:', error)
  }
}

// 获取设备总数
const getDeviceCount = async () => {
  try {
    const res = await getDeviceManagementPage({
      page: 1,
      limit: 10
    })
    stats.value.deviceCount = res.totalCount || 0
  } catch (error) {
    console.error('获取设备总数失败:', error)
  }
}

// 获取闸门状态数据
const getGateStatusData = async () => {
  try {
    const res = await getGateStatusRate()
    gateStatusData.value.rate = parseFloat(res.rate) || 0
    gateStatusData.value.openCount = res.openCount || 0
  } catch (error) {
    console.error('获取闸门状态数据失败:', error)
  }
}

// 获取设备统计数据
const getDeviceStats = async () => {
  try {
    const res = await getDeviceManagementPage({
      page: 1,
      limit: 1000
    })
    
    // 统计各类型设备数量
    const typeCount = {}
    res.list?.forEach(device => {
      const type = device.mcsType
      if (type && deviceTypeDict[type]) {
        typeCount[type] = (typeCount[type] || 0) + 1
      }
    })
    
    // 转换为饼图数据格式
    deviceStats.value = Object.entries(typeCount).map(([key, value]) => ({
      name: deviceTypeDict[key],
      value: value
    }))
  } catch (error) {
    console.error('获取设备统计数据失败:', error)
  }
}

// 加载统计数据
const loadStats = async () => {
  await Promise.all([
    getGateStationCount(),
    getGateCount(),
    getDeviceCount(),
    getGateStatusData(),
    getDeviceStats()
  ])
}

onMounted(async () => {
  // 加载统计数据
  await loadStats()
  
  if (pieChartRef.value) {
    const chart = echarts.init(pieChartRef.value)
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']
    
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          fontSize: 11,
          color: '#666'
        }
      },
      series: [{
        name: '设备统计',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: deviceStats.value,
        itemStyle: {
          color: function(params) {
            return colors[params.dataIndex % colors.length]
          }
        }
      }]
    })
    
    window.addEventListener('resize', () => {
      chart.resize()
    })
  }
})
</script>

<style scoped>
.top-section {
  width: 100%;
  margin-bottom: 20px;
}

.card-container {
  display: flex;
  gap: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.reservoir-overview {
  flex: 2;
}

.gate-status {
  flex: 1;
}

.device-statistics {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.card-content {
  min-height: 150px;
}

/* 水库概况卡片样式 */
.reservoir-info-grid {
  display: flex;
  justify-content: space-between;
  gap: 22px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 8px;
  gap: 8px;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: #0a90f8;
  font-size: 30px;
}



.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 闸站闸门状态卡片样式 */
.gate-status-container {
  display: flex;
  gap: 20px;
  height: 100%;
  margin-top: 50px;
  position: relative;
}

.progress-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.progress-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
  flex-direction: column;
}

.progress-label {
  font-size: 12px;
  color: #909399;
}

.capacity-value {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
  text-align: center;
}

/* 设备统计卡片样式 */
.device-stats-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-container {
  flex: 1;
  min-height: 200px;
}
</style>