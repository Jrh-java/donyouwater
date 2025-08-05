<template>
  <div class="bottom-section">
    <div class="card-container">
      <div class="card seepage-monitoring" style="flex: 1;">
        <!-- 渗压监测卡片 -->
        <div class="card-title">渗压监测</div>
        <div class="card-content">
          <div class="seepage-chart-container">
            <div 
              ref="seepagePressureChartRef" 
              class="seepage-chart"
              v-loading="seepageLoading"
            ></div>
          </div>
        </div>
      </div>
      <div class="card inspection-records" style="flex: 2;">
        <!-- 巡查记录卡片 -->
         <div style="display: flex;justify-content: space-between;padding:5px 20px;">
        <div class="card-title">巡查记录</div>
        <a class="card-more" @click="gotoTask" style="cursor: pointer;">更多</a>
      </div>
        <div class="card-content">
          <el-table :data="inspectionRecords" style="width: 100%" :border="false" v-loading="loading">
            <el-table-column prop="taskName" label="任务名称"  />
            <el-table-column prop="taskType" label="任务类型">
              <template #default="scope">
                {{ getTaskTypeLabel(scope.row.taskType) }}
              </template>
            </el-table-column>
            <el-table-column prop="excutorName" label="执行人员"  />
            <el-table-column label="执行日期" width="180">
              <template #default="scope">
                {{ scope.row.startTime }}
              </template>
            </el-table-column>
            <el-table-column prop="completionProgress" label="任务状态" >
              <template #default="scope">
                <el-tag
                  :type="getStatusType(scope.row.completionProgress)"
                  effect="light"
                >
                  {{ getStatusLabel(scope.row.completionProgress) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Phone } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getTaskPage } from '@/api/task'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getOsmoticPressureWeekMaxApi } from '@/api/reservoir'
import { useStore } from '@/store/pinia'
const router = useRouter()
const store = useStore()

// 渗压监测相关数据
const seepagePressureChartRef = ref(null)
let seepagePressureChart = null
const seepageData = ref([])
const seepageLoading = ref(false)

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode)

// 巡查记录数据
const inspectionRecords = ref([])
const loading = ref(false)

// 获取任务类型标签
const getTaskTypeLabel = (type) => {
  const typeMap = {
    '1': '日常巡检',
    '2': '年度巡检', 
    '3': '特别巡检',
    '4': '维修',
    '5': '保养'
  }
  return typeMap[type] || type
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    '1': '待处理',
    '2': '进行中',
    '3': '已完成'
  }
  return statusMap[status] || status
}

// 加载巡查记录数据
const loadInspectionRecords = async () => {
  loading.value = true
  try {
    const response = await getTaskPage({
      page: 1,
      limit: 5 // 只显示最近5条记录
    })
    inspectionRecords.value = response.list || []
  } catch (error) {
    console.error('获取巡查记录失败:', error)
    ElMessage.error('获取巡查记录失败')
  } finally {
    loading.value = false
  }
}

// 根据状态获取标签类型
const getStatusType = (status) => {
  const typeMap = {
    '1': 'warning',  // 待处理
    '2': 'primary',  // 进行中
    '3': 'success'   // 已完成
  }
  return typeMap[status] || 'info'
}

// 获取渗压数据
const fetchSeepageData = async () => {
  try {
    seepageLoading.value = true
    const gateStationCode = 'FJ.JODY.FH01.Z01.STATION'
    const data = await getOsmoticPressureWeekMaxApi(gateStationCode)
    seepageData.value = data || []
    updateSeepagePressureChart(data)
  } catch (error) {
    console.error('获取渗压数据失败:', error)
    ElMessage.error('获取渗压数据失败')
    seepageData.value = []
  } finally {
    seepageLoading.value = false
  }
}

// 更新渗压图表
const updateSeepagePressureChart = (data) => {
  if (!seepagePressureChart) return
  
  // 如果没有数据，显示暂无数据
  if (!data || data.length === 0) {
    const option = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: { lineStyle: { color: '#999' } },
        axisTick: { show: false },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        data: [],
        type: 'line'
      }]
    }
    seepagePressureChart.setOption(option)
    return
  }
  
  // 处理数据：提取日期（MM-DD格式）和渗压值
  const dates = data.map(item => {
    const date = new Date(item.daily)
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  })
  const pressureValues = data.map(item => item.maxWaterPressure)
  
  const option = {
    title: {
      text: '',
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' },
      formatter: function(params) {
        return `${params[0].name}<br/>渗压值: ${params[0].value}kPa`
      }
    },
    grid: { top: 20, right: 20, bottom: 40, left: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#999' } },
      axisTick: { show: false },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#666' }
    },
    series: [{
      data: pressureValues,
      type: 'line',
      smooth: true,
      itemStyle: { color: '#409eff' },
      lineStyle: { color: '#409eff', width: 2 },
      symbol: 'circle',
      symbolSize: 6
    }]
  }
  
  seepagePressureChart.setOption(option)
}

// 初始化渗压图表
const initSeepagePressureChart = () => {
  if (seepagePressureChartRef.value) {
    seepagePressureChart = echarts.init(seepagePressureChartRef.value)
    
    // 初始化空图表
    const option = {
      title: {
        text: '加载中...',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: { lineStyle: { color: '#999' } },
        axisTick: { show: false },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        data: [],
        type: 'line'
      }]
    }
    
    seepagePressureChart.setOption(option)
  }
}
const gotoTask = () => {
  router.push('/main/task/list')
}

// 组件挂载时加载数据
onMounted(() => {
  loadInspectionRecords()
  initSeepagePressureChart()
  fetchSeepageData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (seepagePressureChart) {
      seepagePressureChart.resize()
    }
  })
})

// 组件卸载时清理
onUnmounted(() => {
  if (seepagePressureChart) {
    seepagePressureChart.dispose()
  }
  window.removeEventListener('resize', () => {
    if (seepagePressureChart) {
      seepagePressureChart.resize()
    }
  })
})
</script>

<style scoped>
.bottom-section {
  width: 100%;
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
}

.card-content {
  min-height: 150px;
}

/* 渗压监测样式 */
.seepage-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.seepage-chart {
  width: 100%;
  height: 200px;
  min-height: 200px;
}

/* 巡查记录卡片样式 */
:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table th) {
  font-weight: bold;
  color: #606266;
  padding: 8px 0;
}

:deep(.el-table--small) {
  font-size: 13px;
}

:deep(.el-table td),
:deep(.el-table th) {
  padding: 8px 0;
  text-align: center;
}

:deep(.el-tag--light.el-tag--success) {
  color: #67c23a;
  background-color: #f0f9eb;
}

:deep(.el-tag--light.el-tag--warning) {
  color: #e6a23c;
  background-color: #fdf6ec;
}

:deep(.el-tag--light.el-tag--info) {
  color: #909399;
  background-color: #f4f4f5;
}
</style>