<template>
    <div class="reservoir-detail">
    <!-- 头部操作区 -->
    <div class="header-actions">
      <el-button @click="handleBack" type="primary" plain style="width:100px;height:50px;">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      
      <!-- 闸站选择 -->
      <div class="gate-station-selector">
        <span class="selector-label">选择闸站：</span>
        <el-tree-select
          v-model="selectedGateStation"
          :data="treeData"
          :props="{ label: 'label', children: 'children', value: 'id' }"
          :loading="loading"
          placeholder="请选择闸站"
          check-strictly
          default-expand-all
          :render-after-expand="false"
          style="width: 600px"
          :teleported="false"
          @change="handleGateStationChange"
        />
      </div>
    </div>

    <!-- 未选择闸站时的提示 -->
    <div v-if="!selectedGateStation" class="no-selection-tip">
      <div class="tip-content">
        <el-icon class="tip-icon"><InfoFilled /></el-icon>
        <span>请先选择闸站以查看详细信息</span>
      </div>
    </div>

    <!-- 第一行：安全概况和任务情况 -->
    <div v-if="selectedGateStation" class="top-section">
      <!-- 安全概况 -->
      <div class="safety-overview">
        <div class="section-title">安全概况</div>
        
        <div class="safety-content">
          <div class="safety-header">
            <div class="reservoir-table">
              <el-table :data="reservoirTableData" border style="width: 100%">
                <el-table-column prop="label" label="项目" width="120" />
                <el-table-column prop="value" label="内容" />
              </el-table>
            </div>
          </div>
          
          <div class="safety-stats">
            <div class="stats-divider"></div>
            <div class="stats-row">
              <div class="stat-item">
                <span class="label">综合安全状态</span>
                <span class="value safe">-</span>
              </div>
              <div class="stat-divider-vertical"></div>
              <div class="stat-item">
                <span class="label">报警数</span>
                <span class="value alert">0</span>
              </div>
              <div class="stat-divider-vertical"></div>
              <div class="stat-item">
                <span class="label">预警数</span>
                <span class="value warning">0</span>
              </div>
            </div>
            
            <div class="stats-divider"></div>
            
            <div class="monitoring-table">
              <DisplacementTable 
                :height="250"
                :show-pagination="false"
                :filter-form="{ timeRange: '24h', direction: 'all' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 任务情况 -->
      <!-- <div class="task-section">
        <div class="section-title">任务情况</div>
        <div class="task-list">
          <div v-if="tasks.length === 0" class="no-data-tip">
            <el-icon class="no-data-icon"><InfoFilled /></el-icon>
            <span>暂无任务数据</span>
          </div>
          <div class="task-item" v-for="(task, index) in tasks" :key="index">
            <div class="task-content">
              <div class="task-title">【任务】{{ task.title }}</div>
              <div class="task-details">
                <span>创建人：{{ task.creator }}</span>
                <span>任务时间：{{ task.time }}</span>
                <span>执行人：{{ task.executor }}</span>
                <span>状态：{{ task.status }}</span>
              </div>
            </div>
            <div class="task-actions">
              <el-button type="primary"  >任务开始</el-button>
              <el-button type="danger"  >任务取消</el-button>
            </div>
          </div>
        </div>
      </div> -->
    </div>


    <!-- 渗压和渗流量监测 -->
    <div v-if="selectedGateStation" class="seepage-section">
      <div class="seepage-cards">
        <div class="seepage-card-with-chart">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="card-icon"><Histogram /></el-icon>
              <span>渗压监测</span>
            </div>
            <el-button type="text" class="detail-btn" @click="gotoSeepage">查看详情</el-button>
          </div>
          <div class="card-content">
            <div class="status-info">

            </div>
            <div class="chart-title">渗压值 (kPa)</div>
            <div ref="seepagePressureChart" class="chart" style="height:300px"></div>
          </div>
        </div>

        <div class="seepage-card-with-chart">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="card-icon"><DataLine /></el-icon>
              <span>渗流量监测</span>
            </div>
            <el-button type="text" class="detail-btn" @click="gotoFlow">查看详情</el-button>
          </div>
          <div class="card-content">
      
            <div class="chart-title">渗流量值 (L/s)</div>
            <div class="no-device-tip" style="display: flex
;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 18px;
    margin-top: 15%;">
              <el-icon class="tip-icon" style="margin-right: 8px; font-size: 20px;"><InfoFilled /></el-icon>
              <span>暂未接入该类型设备</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 环境量监测 -->
    <!-- <div v-if="selectedGateStation" class="environment-section">
      <div class="section-title">环境量监测</div>
      <div class="environment-cards">
        <div class="env-card">
          <div class="env-icon water-level">
            <el-icon><DataBoard /></el-icon>
          </div>
          <div class="env-content">
            <div class="env-title">水位</div>
            <div class="env-value">当前水位 602.6m</div>
            <div class="env-status">水位状态 未超警戒</div>
            <div class="env-forecast">明日预测 602.4m/无预警</div>
          </div>
          <el-button 
            type="text" 
            class="trend-btn"
            @mouseenter="showTrendPopover('water')"
            @mouseleave="hideTrendPopover"
          >
            趋势预报
          </el-button>
        </div>

        <div class="env-card">
          <div class="env-icon rainfall">
            <el-icon><Cloudy /></el-icon>
          </div>
          <div class="env-content">
            <div class="env-title">降水量</div>
            <div class="env-value">今日降水 6.6mm</div>
            <div class="env-status">降水状态 小雨</div>
            <div class="env-forecast">明日预测 4.5mm/无预警</div>
          </div>
          <el-button 
            type="text" 
            class="trend-btn"
            @mouseenter="showTrendPopover('rainfall')"
            @mouseleave="hideTrendPopover"
          >
            趋势预报
          </el-button>
        </div>

        <div class="env-card">
          <div class="env-icon temperature">
            <el-icon><Sunny /></el-icon>
          </div>
          <div class="env-content">
            <div class="env-title">气温</div>
            <div class="env-value">当前气温 24°C</div>
            <div class="env-status">气温状态 正常</div>
            <div class="env-forecast">明日预测 20-28°C/无预警</div>
          </div>
          <el-button 
            type="text" 
            class="trend-btn"
            @mouseenter="showTrendPopover('temperature')"
            @mouseleave="hideTrendPopover"
          >
            趋势预报
          </el-button>
        </div>
      </div>

      <div class="environment-charts">
        <div class="chart-container">
          <div class="chart-title">降水量 (mm)</div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-color rainfall"></span>降水</span>
            <span class="legend-item"><span class="legend-color historical"></span>历史降水</span>
          </div>
          <div ref="rainfallChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <div class="chart-title">水位 (m)</div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-color water-current"></span>水位</span>
            <span class="legend-item"><span class="legend-color water-historical"></span>历史水位</span>
          </div>
          <div ref="waterLevelChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <div class="chart-title">气温 (°C)</div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-color temp-current"></span>气温</span>
            <span class="legend-item"><span class="legend-color temp-historical"></span>历史气温</span>
          </div>
          <div ref="temperatureChart" class="chart"></div>
        </div>
      </div>
    </div> -->

    <!-- 15日水位预报 -->
    <!-- <div v-if="selectedGateStation" class="forecast-section">
      <div class="section-title">15日水位预报 (m)</div>
      <div ref="waterLevelForecastChart" class="forecast-chart"></div>
    </div> -->

    <!-- 趋势预报弹窗 -->
    <div 
      v-if="showPopover && selectedGateStation" 
      class="trend-popover"
    >
      <div class="popover-content">
        <div class="popover-title">{{ popoverData.title }}</div>
        <div class="popover-chart">
          <div ref="popoverChart" class="mini-chart"></div>
        </div>
        <div class="popover-info">
          <div class="info-row">
            <span class="label">当前值：</span>
            <span class="value">{{ popoverData.current }}</span>
          </div>
          <div class="info-row">
            <span class="label">预测值：</span>
            <span class="value">{{ popoverData.forecast }}</span>
          </div>
          <div class="info-row">
            <span class="label">趋势：</span>
            <span class="value" :class="popoverData.trendClass">{{ popoverData.trend }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElButton, ElIcon, ElTreeSelect, ElTable, ElTableColumn } from 'element-plus'
import { ArrowLeft, TrendCharts, Histogram, DataLine, DataBoard, Cloudy, Sunny, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import DisplacementTable from '@/components/DisplacementTable.vue'
import { getDamDirectoryListApi, getOsmoticPressureWeekMaxApi, type OsmoticPressureData } from '@/api/reservoir'
import { useStore } from '@/store/pinia'

// 定义任务接口
interface Task {
  title: string
  creator: string
  time: string
  executor: string
  status: string
}

// 定义props
const props = defineProps<{
  reservoirData?: {
    reservoirName: string
    address: string
    manageUnit: string
    [key: string]: any
  }
}>()

const router = useRouter()
const store = useStore()
const emit = defineEmits<{
  'back': []
}>()

// 计算属性：表格数据
const reservoirTableData = computed(() => [
  {
    label: '水库名称',
    value: props.reservoirData?.reservoirName || '火星一号水库大坝'
  },
  {
    label: '工程地址',
    value: props.reservoirData?.address || '火星xxxx市xx县xx镇'
  },
  {
    label: '管理单位',
    value: props.reservoirData?.manageUnit || '火星水库管理所'
  }
])

// 闸站选择相关
const treeData = ref([])
const selectedGateStation = ref('')
const loading = ref(false)

// 图表引用
const riverDisplacementChart = ref()
const crossDisplacementChart = ref()
const verticalDisplacementChart = ref()
const seepagePressureChart = ref()
const seepageFlowChart = ref()
const rainfallChart = ref()
const waterLevelChart = ref()
const temperatureChart = ref()
const waterLevelForecastChart = ref()
const popoverChart = ref()

// 弹窗相关
const showPopover = ref(false)
const popoverData = ref({
  title: '',
  current: '',
  forecast: '',
  trend: '',
  trendClass: '',
  chartData: []
})



// 任务数据
const tasks = ref<Task[]>([])

// 返回按钮处理
const handleBack = () => {
  emit('back')
}

// 显示趋势预报弹窗
const showTrendPopover = (type: string) => {
  const trendData: Record<string, any> = {
    water: {
      title: '水位趋势预报',
      current: '602.6m',
      forecast: '602.4m',
      trend: '下降',
      trendClass: 'trend-down',
      chartData: [602.8, 602.7, 602.6, 602.5, 602.4, 602.3, 602.2]
    },
    rainfall: {
      title: '降水量趋势预报',
      current: '6.6mm',
      forecast: '4.5mm',
      trend: '减少',
      trendClass: 'trend-down',
      chartData: [8.2, 7.5, 6.6, 5.8, 4.5, 3.2, 2.1]
    },
    temperature: {
      title: '气温趋势预报',
      current: '24°C',
      forecast: '26°C',
      trend: '上升',
      trendClass: 'trend-up',
      chartData: [22, 23, 24, 25, 26, 27, 28]
    }
  }

  popoverData.value = trendData[type]
  showPopover.value = true
  
  nextTick(() => {
    initPopoverChart()
  })
}
const gotoDisplacement = () => {
  router.push('/main/gate/displacement')
}
const gotoSeepage = () => {
  router.push('/main/gate/seepage')
}
const gotoFlow = () => {
  router.push('/main/gate/flow')
}

// 隐藏趋势预报弹窗
const hideTrendPopover = () => {
  showPopover.value = false
}

// 获取闸站目录列表
const fetchGateStationList = async () => {
  try {
    loading.value = true
    const response = await getDamDirectoryListApi()
    
    // 转换接口数据为六级树形结构（省-市-区-镇-水库-闸站）
    const transformedData = (response as any).map((provinceData: any, provinceIndex: number) => ({
      id: `province_${provinceIndex}`,
      label: provinceData.province,
      disabled: true, // 省份节点不可选择
      children: provinceData.envMcsCityVOS.map((cityData: any, cityIndex: number) => ({
        id: `city_${provinceIndex}_${cityIndex}`,
        label: cityData.city,
        disabled: true, // 城市节点不可选择
        children: cityData.envMcsAreaVOS.map((areaData: any, areaIndex: number) => ({
          id: `area_${provinceIndex}_${cityIndex}_${areaIndex}`,
          label: areaData.area,
          disabled: true, // 区域节点不可选择
          children: areaData.envMcsTownVOS.map((townData: any, townIndex: number) => ({
            id: `town_${provinceIndex}_${cityIndex}_${areaIndex}_${townIndex}`,
            label: townData.town,
            disabled: true, // 镇节点不可选择
            children: townData.reservoirInfoVOS.map((reservoir: any) => ({
              id: reservoir.id,
              label: reservoir.reservoirName,
              reservoirCode: reservoir.reservoirCode,
              reservoirName: reservoir.reservoirName,
              disabled: true, // 水库节点不可选择
              children: reservoir.deviceGateStationInfoNodeVOS?.map((gateStation: any) => ({
                id: gateStation.id,
                label: gateStation.gateStationName,
                gateStationCode: gateStation.gateStationCode,
                gateStationName: gateStation.gateStationName,
                reservoirManagementNo: gateStation.reservoirManagementNo,
                disabled: false // 闸站节点可选择
              })) || []
            }))
          }))
        }))
      }))
    }));
    
    treeData.value = transformedData
    
  } catch (error) {
    console.error('获取闸站目录列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取渗压数据
const fetchOsmoticPressureData = async (gateStationCode: string) => {
  try {
    const data = await getOsmoticPressureWeekMaxApi(gateStationCode)
    updateSeepagePressureChart(data)
  } catch (error) {
    console.error('获取渗压数据失败:', error)
  }
}

// 更新渗压图表
const updateSeepagePressureChart = (data: OsmoticPressureData[]) => {
  if (seepagePressureChart.value) {
    const chart = echarts.getInstanceByDom(seepagePressureChart.value) || echarts.init(seepagePressureChart.value)
    
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
      chart.setOption(option)
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
        formatter: function(params: any) {
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
    
    chart.setOption(option)
  }
}

// 处理闸站选择变化
const handleGateStationChange = (value: string | number | undefined) => {
  console.log('选择的闸站ID:', value)
  
  if (!value) {
    console.warn('选择的闸站ID为空')
    return
  }
  
  // 递归查找选中的闸站节点
  const findGateStationNode = (nodes: any[], targetId: string | number): any => {
    for (const node of nodes) {
      if (node.id === targetId && node.gateStationCode) {
        return node
      }
      if (node.children) {
        const found = findGateStationNode(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  const selectedNode = findGateStationNode(treeData.value, value)
  if (selectedNode) {
    // 更新store中的selectedDamNode，这样DisplacementTable组件就能获取到gateStationCode
    store.setSelectedDamNode({
      ...selectedNode,
      gateStationCode: selectedNode.gateStationCode
    })
    console.log('已选择闸站:', selectedNode.gateStationName, 'Code:', selectedNode.gateStationCode)
    
    // 获取渗压数据
    fetchOsmoticPressureData(selectedNode.gateStationCode)
  } else {
    console.warn('未找到对应的闸站节点:', value)
  }
}

// 初始化弹窗图表
const initPopoverChart = () => {
  if (popoverChart.value) {
    const chart = echarts.init(popoverChart.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          return `${params[0].name}<br/>${popoverData.value.title.replace('趋势预报', '')}: ${params[0].value}${popoverData.value.title.includes('水位') ? 'm' : popoverData.value.title.includes('降水') ? 'mm' : '°C'}`
        }
      },
      grid: { top: 10, right: 10, bottom: 20, left: 30 },
      xAxis: {
        type: 'category',
        data: ['今日', '明日', '后日', '第4日', '第5日', '第6日', '第7日'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { fontSize: 10, color: '#666' }
      },
      series: [{
        data: popoverData.value.chartData,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff', width: 2 },
        symbol: 'circle',
        symbolSize: 4
      }]
    }
    chart.setOption(option)
  }
}

// 初始化图表
const initCharts = () => {
  // 位移图表数据
  const displacementData = [1.4, 0.8, 0.6, -0.4, -0.7, -1.1, -0.9]
  const categories = ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7']

  // 位移图表配置
  const displacementOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' },
      formatter: function(params: any) {
        return `${params[0].name}<br/>${params[0].seriesName || '位移值'}: ${params[0].value}mm`
      }
    },
    grid: { top: 20, right: 20, bottom: 40, left: 40 },
    xAxis: {
      type: 'category',
      data: categories,
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
      data: displacementData,
      type: 'bar',
      itemStyle: { color: '#409eff' },
      barWidth: 30
    }]
  }

  // 初始化位移图表
  if (riverDisplacementChart.value) {
    const chart1 = echarts.init(riverDisplacementChart.value)
    chart1.setOption(displacementOption)
  }
  if (crossDisplacementChart.value) {
    const chart2 = echarts.init(crossDisplacementChart.value)
    chart2.setOption(displacementOption)
  }
  if (verticalDisplacementChart.value) {
    const chart3 = echarts.init(verticalDisplacementChart.value)
    chart3.setOption(displacementOption)
  }

  // 渗压图表 - 初始化空图表，等待选择闸站后加载数据
  if (seepagePressureChart.value) {
    const seepagePressureOption = {
      title: {
        text: '请选择闸站查看数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          return `${params[0].name}<br/>渗压值: ${params[0].value}kPa`
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        name: '渗压值',
        data: [],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff', width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }]
    }
    const chart4 = echarts.init(seepagePressureChart.value)
    chart4.setOption(seepagePressureOption)
  }

  // 渗流量图表
  if (seepageFlowChart.value) {
    const seepageFlowOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          return `${params[0].name}<br/>渗流量: ${params[0].value}L/s`
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        name: '渗流量',
        data: [24.5, 33.6, 34.7, 48.9, 52.1, 45.4, 36.1],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { color: '#10b981', width: 2 }
      }]
    }
    const chart5 = echarts.init(seepageFlowChart.value)
    chart5.setOption(seepageFlowOption)
  }

  // 环境量图表
  const envCategories = ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7']
  
  // 降水量图表
  if (rainfallChart.value) {
    const rainfallOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          let result = `${params[0].name}<br/>`
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}${param.seriesIndex === 0 ? 'mm' : ''}<br/>`
          })
          return result
        }
      },
      grid: { top: 40, right: 30, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: envCategories,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          axisLine: { lineStyle: { color: '#999' } },
          splitLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#666' }
        },
        {
          type: 'value',
          position: 'right',
          axisLine: { lineStyle: { color: '#999' } },
          splitLine: { show: false },
          axisLabel: { color: '#666' }
        }
      ],
      series: [
        {
          name: '降水',
          data: [7.5, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2],
          type: 'bar',
          itemStyle: { color: '#3b82f6' },
          barWidth: 20
        },
        {
          name: '历史降水',
          data: [200, 320, 300, 270, 310, 270, 320],
          type: 'line',
          yAxisIndex: 1,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { color: '#06b6d4' }
        }
      ]
    }
    const chart6 = echarts.init(rainfallChart.value)
    chart6.setOption(rainfallOption)
  }

  // 水位图表
  if (waterLevelChart.value) {
    const waterLevelOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          let result = `${params[0].name}<br/>`
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}m<br/>`
          })
          return result
        }
      },
      grid: { top: 40, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: envCategories,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 400,
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [
        {
          name: '水位',
          data: [320, 320, 290, 330, 320, 317, 320],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { color: '#06b6d4', width: 2 }
        },
        {
          name: '历史水位',
          data: [350, 320, 300, 270, 310, 270, 320],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { color: '#8b5cf6', width: 2 }
        }
      ]
    }
    const chart7 = echarts.init(waterLevelChart.value)
    chart7.setOption(waterLevelOption)
  }

  // 气温图表
  if (temperatureChart.value) {
    const temperatureOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          let result = `${params[0].name}<br/>`
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}°C<br/>`
          })
          return result
        }
      },
      grid: { top: 40, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: envCategories,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [
        {
          name: '气温',
          data: [24.5, 25.4, 26.7, 27.8, 28.2, 28.9, 31.4],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { color: '#f59e0b', width: 2 }
        },
        {
          name: '历史气温',
          data: [22.5, 21.3, 22.9, 25.1, 26.2, 22.4, 29.5],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#ef4444' },
          lineStyle: { color: '#ef4444', width: 2 }
        }
      ]
    }
    const chart8 = echarts.init(temperatureChart.value)
    chart8.setOption(temperatureOption)
  }

  // 15日水位预报图表
  if (waterLevelForecastChart.value) {
    const forecastOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function(params: any) {
          return `${params[0].name}<br/>预报水位: ${params[0].value}m`
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7', '5-8', '5-9', '5-10', '5-11', '5-12', '5-13', '5-14', '5-15'],
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        min: 300,
        max: 700,
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        name: '预报水位',
        data: [350, 370, 420, 360, 561, 340, 408, 380, 500, 420, 351, 520, 624, 350, 357],
        type: 'bar',
        itemStyle: { color: '#409eff' },
        barWidth: 40
      }]
    }
    const chart9 = echarts.init(waterLevelForecastChart.value)
    chart9.setOption(forecastOption)
  }
}

onMounted(() => {
  setTimeout(() => {
    initCharts()
  }, 100)
  
  // 获取闸站目录列表
  fetchGateStationList()
})

onUnmounted(() => {
  // 销毁图表实例
})
</script>

<style lang="scss" scoped>
.reservoir-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 20px;
  
  .gate-station-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .selector-label {
      font-size: 14px;
      color: #606266;
      white-space: nowrap;
    }
  }
}

.no-selection-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .tip-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;
    
    .tip-icon {
      font-size: 48px;
      color: #909399;
    }
    
    span {
      font-size: 16px;
      color: #606266;
    }
  }
}

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }

  // 顶部区域
  .top-section {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .safety-overview {
      flex: 2;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

      .safety-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;

        .reservoir-table {
          width: 100%;
          margin-bottom: 20px;
        }
      }

      .safety-stats {
        .stats-divider {
          width: 100%;
          height: 1px;
          background-color: #e4e7ed;
          margin: 15px 0;
        }

        .stats-row {
          display: flex;
          gap: 40px;
          margin-bottom: 20px;
          align-items: center;
          position: relative;
          justify-content: space-around;
          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .label {
              font-size: 22px;
              color: #909399;
            }

            .value {
              font-size: 18px;
              font-weight: 600;

              &.safe {
                color: #67c23a;
              }

              &.alert {
                color: #f56c6c;
              }

              &.warning {
                color: #e6a23c;
              }
            }
          }

          .stat-divider-vertical {
            width: 1px;
            height: 40px;
            background-color: #e4e7ed;
          }
        }

        .monitoring-table {
          margin-top: 16px;
        }
      }
      

    }

    .message-section {
      flex:1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .message-count {
          font-size: 14px;
          color: #909399;
        }

        .more-btn {
          color: #409eff;
        }
      }

      .message-list {
        .message-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          .message-content {
            flex: 1;

            .message-title {
              margin-bottom: 4px;
              text-align: left;
              .message-type {
                &.data {
                  color: #409eff;
                }

                &.alarm {
                  color: #f56c6c;
                }

                &.warning {
                  color: #e6a23c;
                }
              }
            }

            .message-detail {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
              text-align: left;
            }
          }

          .message-time {
            font-size: 12px;
            color: #c0c4cc;
            white-space: nowrap;
            margin-left: 10px;
          }
        }
      }
    }
  }

  // 任务区域
  .task-section {
    flex: 1;
    background: white;
    border-radius: 8px;
    padding: 20px;
    min-height: 200px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .task-list {
      min-height: 120px;
      .no-data-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #999;
        font-size: 14px;
        
        .no-data-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      }

      .task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 12px;

        .task-content {
          .task-title {
            font-weight: 600;
            margin-bottom: 8px;
          }

          .task-details {
            font-size: 14px;
            color: #909399;

            span {
              margin-right: 20px;
            }
          }
        }

        .task-actions {
          display: flex;
          gap: 10px;
        }
      }
    }
  }

  // 监测卡片
  .displacement-monitoring {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .monitoring-card-with-chart {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;

          .card-icon {
            color: #409eff;
          }
        }

        .detail-btn {
          color: #409eff;
        }
      }

      .card-content {
        .status-info {
          margin-bottom: 20px;
          
          .status-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;

            .label {
              color: #909399;
            
            }

            .value {
              &.safe {
                color: #67c23a;
              }

              &.grade-a {
                color: #67c23a;
                font-weight: 600;
              }
            }

            .displacement-value {
              display: flex;
              align-items: center;
              gap: 8px;

              .direction {
                font-size: 12px;
                color: #909399;
              }

              .value {
                font-weight: 600;
                color: #303133;
              }
            }
          }
        }

        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
          color: #303133;
        }

        .chart {
          height: 200px;
        }
      }
    }
  }

  // 渗压渗流量区域
  .seepage-section {
    margin-bottom: 30px;

    .seepage-cards {
      display: flex;
      gap: 20px;

      .seepage-card-with-chart {
        flex: 1;
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .card-title {
            display: flex;
            align-items: center;
            gap: 8px;

            .card-icon {
              color: #409eff;
            }
          }

          .detail-btn {
            color: #409eff;
          }
        }

        .card-content {
          .status-info {
            margin-bottom: 20px;
            
            .status-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;

              .label {
                color: #909399;
              }

              .value {
                &.safe {
                  color: #67c23a;
                }

                &.grade-a {
                  color: #67c23a;
                  font-weight: 600;
                }
              }
            }
          }

          .chart-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
            color: #303133;
          }

          .chart {
            height: 200px;
          }
        }
      }
    }
  }

  // 图表区域
  .environment-section {
    .environment-cards {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .env-card {
        flex: 1;
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;

        .env-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.water-level {
            background: #e1f5fe;
            color: #0288d1;
          }

          &.rainfall {
            background: #e8f5e8;
            color: #4caf50;
          }

          &.temperature {
            background: #fff3e0;
            color: #ff9800;
          }
        }

        .env-content {
          flex: 1;

          .env-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .env-value {
            font-size: 14px;
            color: #303133;
            margin-bottom: 2px;
          }

          .env-status {
            font-size: 12px;
            color: #67c23a;
            margin-bottom: 2px;
          }

          .env-forecast {
            font-size: 12px;
            color: #909399;
          }
        }

        .trend-btn {
          color: #409eff;
        }
      }
    }

    .environment-charts {
      display: flex;
      gap: 20px;

      .chart-container {
        flex: 1;
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          text-align: center;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 16px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;

            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;

              &.rainfall {
                background: #3b82f6;
              }

              &.historical {
                background: #06b6d4;
              }

              &.water-current {
                background: #06b6d4;
              }

              &.water-historical {
                background: #8b5cf6;
              }

              &.temp-current {
                background: #f59e0b;
              }

              &.temp-historical {
                background: #ef4444;
              }
            }
          }
        }

        .chart {
          height: 200px;
        }
      }
    }
  }

  // 15日水位预报
  .forecast-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .forecast-chart {
      height: 200px;
    }
  }

  // 趋势预报弹窗
  .trend-popover {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    width: 400px;
    max-width: 90vw;

    .popover-content {
      padding: 20px;

      .popover-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #303133;
        text-align: center;
      }

      .popover-chart {
        .mini-chart {
          height: 150px;
          margin-bottom: 16px;
        }
      }

      .popover-info {
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;

          .label {
            font-size: 14px;
            color: #909399;
          }

          .value {
            font-size: 14px;
            font-weight: 600;
            color: #303133;

            &.trend-down {
              color: #f56c6c;
            }

            &.trend-up {
              color: #67c23a;
            }
          }
        }
      }
    }
  }
}
</style>