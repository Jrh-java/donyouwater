<template>
  <div class="risk-warning-chart-container">
    <div class="chart-controls">
      <div class="tabs">
        <div 
          class="tab-div"
          :class="{ active: activeTab === 'trend' }"
          @click="setActiveTab('trend')"
        >
          告警趋势
        </div>
        <div 
          class="tab-div"
          :class="{ active: activeTab === 'history' }"
          @click="setActiveTab('history')"
        >
          历史告警
        </div>
      </div>
      <div class="time-range-selector" v-if="activeTab === 'trend'">
        <el-select v-model="selectedTimeRange" placeholder="请选择时间范围"   :teleported="false">
          <el-option label="近半年" value="halfYear"></el-option>
          <el-option label="近1年" value="oneYear"></el-option>
          <el-option label="近3年" value="threeYears"></el-option>
          <el-option label="近5年" value="fiveYears"></el-option>
        </el-select>
      </div>
       <span class="view-more-link" v-if="activeTab === 'history'" @click="showHistoricalAlarmsTable">查看更多 &gt;&gt;</span>
    </div>

    <div v-if="activeTab === 'trend'" ref="chartDom" style="width: 100%; height: 250px;"></div>
    
    <div v-if="activeTab === 'history'" class="historical-alarms-section" ref="historicalAlarmsSectionRef">
      <div class="historical-alarms-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>所属大坝</th>
              <th>告警时间</th>
              <th>告警类型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody ref="tableBodyRef">
            <tr v-for="(alarm, index) in displayedHistoricalAlarms" :key="alarm.id + '-' + index">
              <td>{{ alarm.dam }}</td>
              <td>{{ alarm.time }}</td>
              <td>{{ alarm.type }}</td>
              <td><button class="detail-btn" @click="showAlarmDetail(alarm.id)">详情</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted, ref, computed, watch, nextTick, onUnmounted, inject } from 'vue';

// 注入弹窗控制函数
const alarmsModalControls = inject('alarmsModalControls') as any;

const chartDom = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null; // 允许 myChart 为 null

const activeTab = ref('trend'); 
const selectedTimeRange = ref('halfYear'); // 默认近半年

// --- 新增历史告警相关 ---
const historicalAlarms = ref([
  { id: 1, dam: 'AA水库', time: '2025-05-02 12:11:02', type: '损伤识别告警' },
  { id: 2, dam: 'BB水库', time: '2025-05-02 12:11:02', type: '渗流监测告警' },
  { id: 3, dam: 'AA水库', time: '2025-05-02 12:11:02', type: '损伤识别告警' },
  { id: 4, dam: 'BB水库', time: '2025-05-02 12:11:02', type: '渗流监测告警' },
  { id: 5, dam: 'AA水库', time: '2025-05-02 12:11:02', type: '损伤识别告警' },
  { id: 6, dam: 'BB水库', time: '2025-05-02 12:11:02', type: '渗流监测告警' },
  { id: 7, dam: 'CC水库', time: '2025-05-03 10:30:00', type: '变形监测告警' },
  { id: 8, dam: 'DD水库', time: '2025-05-03 11:15:45', type: '应力应变告警' },
]);
const displayCount = 5; // 表格中一次显示的行数
const scrollInterval = ref<any>(null);
const tableBodyRef = ref<HTMLElement | null>(null);
const currentScrollTop = ref(0);

// --- 新增：用于控制悬浮时停止滚动的ref ---
const isMouseOverTable = ref(false);
const historicalAlarmsSectionRef = ref<HTMLElement | null>(null); // 用于绑定鼠标事件

// 为了实现无缝滚动，复制数据
const displayedHistoricalAlarms = computed(() => {
  if (historicalAlarms.value.length <= displayCount) {
    return historicalAlarms.value;
  }
  // 复制数组内容以实现无限滚动效果
  const extendedAlarms = [...historicalAlarms.value, ...historicalAlarms.value.slice(0, displayCount)];
  return extendedAlarms;
});

const startScrolling = () => {
  if (scrollInterval.value) clearInterval(scrollInterval.value);
  if (!tableBodyRef.value || historicalAlarms.value.length <= displayCount || isMouseOverTable.value) return;

  const rowHeight = tableBodyRef.value.scrollHeight / displayedHistoricalAlarms.value.length;
  
  scrollInterval.value = setInterval(() => {
    currentScrollTop.value += 1;
    if (tableBodyRef.value) {
      if (currentScrollTop.value >= historicalAlarms.value.length * rowHeight) {
        // 当滚动到底部（原始数据长度）时，瞬间跳回顶部（视觉上是复制数据的开始）
        currentScrollTop.value = 0;
        tableBodyRef.value.scrollTop = 0;
      }
      tableBodyRef.value.scrollTop = currentScrollTop.value;
    }
  }, 50); // 滚动速度
};

const stopScrolling = () => {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  }
};

watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'history') {
    if (oldTab === 'trend' && myChart) {
      myChart.dispose();
      myChart = null;
    }
    nextTick(() => {
      currentScrollTop.value = 0; // 切换到历史告警时重置滚动位置
      if(tableBodyRef.value) tableBodyRef.value.scrollTop = 0;
      if (!isMouseOverTable.value) { // 仅当鼠标不在表格上时开始滚动
        startScrolling();
      }
    });
  } else if (newTab === 'trend') {
    stopScrolling();
    nextTick(() => {
      if (chartDom.value) {
        initChart(); // 切换到趋势图时总是初始化
      }
    });
  }
});

watch(selectedTimeRange, (newRange) => {
  console.log("Selected time range:", newRange);
  // TODO: 根据新的时间范围获取数据并更新图表
  // 例如: fetchDataForTimeRange(newRange).then(data => updateChart(data));
});

onMounted(() => {
  // 初始化趋势图
  if (activeTab.value === 'trend' && chartDom.value) {
    initChart();
  }
  // 如果默认是history，则开始滚动
  if (activeTab.value === 'history') {
    nextTick(() => {
      if (!isMouseOverTable.value) {
        startScrolling();
      }
    });
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);

  // 为历史告警区域添加鼠标事件监听
  if (historicalAlarmsSectionRef.value) {
    historicalAlarmsSectionRef.value.addEventListener('mouseenter', handleMouseEnterTable);
    historicalAlarmsSectionRef.value.addEventListener('mouseleave', handleMouseLeaveTable);
  }
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  // 移除历史告警区域的鼠标事件监听
  if (historicalAlarmsSectionRef.value) {
    historicalAlarmsSectionRef.value.removeEventListener('mouseenter', handleMouseEnterTable);
    historicalAlarmsSectionRef.value.removeEventListener('mouseleave', handleMouseLeaveTable);
  }
});

const handleResize = () => {
  if(myChart && activeTab.value === 'trend' && !myChart.isDisposed()){
    myChart.resize();
  }
};

// --- 新增：鼠标悬浮/移开表格的处理函数 ---
const handleMouseEnterTable = () => {
  isMouseOverTable.value = true;
  stopScrolling();
};

const handleMouseLeaveTable = () => {
  isMouseOverTable.value = false;
  if (activeTab.value === 'history') {
    startScrolling();
  }
};

const setActiveTab = (tabName: string) => {
  if (activeTab.value === tabName) return;

  const oldTab = activeTab.value;
  activeTab.value = tabName;
  
  if (tabName === 'trend') {
    stopScrolling(); // 确保从历史记录切换时停止滚动
    nextTick(() => {
      if (chartDom.value) {
         // 确保之前的图表实例被销毁 (虽然watch中已处理，双重保险)
        if (myChart && oldTab === 'history') {
          myChart.dispose();
          myChart = null;
        }
        initChart(); // 重新初始化图表
      }
    });
  } else if (tabName === 'history') {
    // 销毁 ECharts 实例
    if (myChart) {
      myChart.dispose();
      myChart = null;
    }
    nextTick(() => {
      currentScrollTop.value = 0;
      if(tableBodyRef.value) tableBodyRef.value.scrollTop = 0;
      if (!isMouseOverTable.value) { // 仅当鼠标不在表格上时开始滚动
         startScrolling();
      }
    });
  }
};

const showHistoricalAlarmsTable = () => {
  alarmsModalControls.openHistoricalAlarmsTable();
};

const showAlarmDetail = (alarmId: number) => {
  alarmsModalControls.showAlarmDetail(alarmId);
};

// ECharts option 和图表初始化逻辑
const chartData = {
  categories: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'],
  values: [8, 15, 12, 18, 25, 38],
  details: { // 假设这是 '2025-05' 的详细数据
    month: 5,
    totalWarnings: 4,
    level1: 1,
    level2: 3
  }
};

const option: echarts.EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    },

  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: chartData.categories,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '次',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        padding: [0, 25, 0, 0] 
      },
      min: 0,
      max: 50,
      interval: 10,
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          type: 'dashed'
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)'
      }
    }
  ],
  series: [
    {
      name: '告警次数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#00E5FF',
        width: 2
      },
      itemStyle: {
        color: '#00E5FF',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(0, 229, 255, 0.5)'
          },
          {
            offset: 1,
            color: 'rgba(0, 229, 255, 0)'
          }
        ])
      },
      data: chartData.values,
    //   markPoint: {
    //     symbol: 'circle',
    //     symbolSize: [25,25],
    //     silent: true,
    //     data: [
    //       {
    //         name: '当前点',
    //         coord: ['2025-05', chartData.values[4]],
    //         itemStyle: {
    //           color: 'rgba(0, 229, 255, 0.3)',
    //           borderColor: '#00E5FF',
    //           borderWidth: 2,
    //         }
    //       },
    //        { 
    //         name: '当前点内圈',
    //         coord: ['2025-05', chartData.values[4]],
    //         symbol: 'circle',
    //         symbolSize: 8,
    //         itemStyle: {
    //             color: '#00E5FF'
    //         }
    //     }
    //     ],
        
    //   }
    }
  ]
};

const initChart = () => {
  if (chartDom.value) {
    // 如果已有实例，先销毁
    if (myChart && !myChart.isDisposed()) {
      myChart.dispose();
    }
    myChart = echarts.init(chartDom.value);
    myChart.setOption(option);
    // 注意：resize监听器现在在onMounted中全局添加，这里不需要重复添加，
    // 避免重复监听或监听已销毁的实例。
    // handleResize 会检查myChart实例是否存在。
  }
};

</script>

<style scoped>
.risk-warning-chart-container {
  color: white;
  padding: 0px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}

.tabs {
  display: flex;
}

.tab-div {
  background-color: rgba(0, 126, 153, 0.5); /* 暗色背景 */
  color: white;
  border: 1px solid #007E99;
  padding: 5px 15px;
  cursor: pointer;
  font-size: 14px;
  margin-right: -1px; /* 使边框重叠 */
  /* 移除圆角，让它们在接触处是直角 */
  border-radius: 0;
}

.tab-div:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.tab-div:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
   margin-right: 0; /* 最后一个元素右边没有负margin */
}

.tab-div.active {
  background-color: #00CFFF; /* 亮蓝色激活状态 */
  color: white;
  border-color: #00CFFF;
  z-index: 1; /* 确保激活的tab边框在上方 */
}

.time-range-selector .el-select {
  width: 120px; /* 根据需要调整宽度 */
}

/* 新增 el-select 样式调整 - 兼容 Element Plus 2.7.7 */
.time-range-selector :deep(.el-select) {
  --el-select-input-color: #E0F2F7;
  --el-select-border-color-hover: #007E99;
}

.time-range-selector :deep(.el-select .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #007E99 inset !important;
  border: none !important;
}

.time-range-selector :deep( .el-select__wrapper) {
  background-color: transparent !important;
}

.time-range-selector :deep(.el-select .el-input__inner) {
  color: #E0F2F7 !important;
}

.time-range-selector :deep(.el-select .el-input__placeholder) {
  color: rgba(224, 242, 247, 0.6) !important;
}

.time-range-selector :deep(.el-select__selected-item span),
.time-range-selector :deep(.el-select__placeholder span) {
  color: #fff !important;
}

.time-range-selector :deep(.el-select .el-select__caret) {
  color: #00CFFF !important;
}

.time-range-selector :deep(.el-select .el-select__suffix) {
  color: #00CFFF !important;
}

/* 下拉框样式 - 由于设置了 teleported="false"，下拉框会在当前组件内 */
.time-range-selector :deep(.el-select-dropdown) {
  background-color: rgba(11, 27, 51, 0.95) !important;
  border: 1px solid #1E3F66 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.time-range-selector :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #E0F2F7 !important;
  background-color: transparent !important;
}

.time-range-selector :deep(.el-select-dropdown .el-select-dropdown__item.hover),
.time-range-selector :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(0, 126, 153, 0.3) !important;
  color: #E0F2F7 !important;
}

.time-range-selector :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  color: #00CFFF !important;
  font-weight: bold;
  background-color: rgba(0, 207, 255, 0.1) !important;
}

/* 确保下拉框在组件内部时的 z-index */
.time-range-selector :deep(.el-popper) {
  z-index: 2000 !important;
}

/* 备用方案：更具体的选择器 */
.risk-warning-chart-container .time-range-selector .el-select .el-input__wrapper {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #007E99 inset !important;
  border: none !important;
}

.risk-warning-chart-container .time-range-selector  .el-select__wrapper {
  background-color: transparent !important;
}

.risk-warning-chart-container .time-range-selector .el-select .el-input__inner {
  color: #E0F2F7 !important;
}

.risk-warning-chart-container .time-range-selector .el-select .el-input__placeholder {
  color: rgba(224, 242, 247, 0.6) !important;
}

.risk-warning-chart-container .time-range-selector .el-select__selected-item span,
.risk-warning-chart-container .time-range-selector .el-select__placeholder span {
  color: #fff !important;
}

.risk-warning-chart-container .time-range-selector .el-select .el-select__caret,
.risk-warning-chart-container .time-range-selector .el-select .el-select__suffix {
  color: #00CFFF !important;
}

.info-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border: 1px solid white;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  background-color: #D9534F; /* 红色背景 */
}

.historical-alarms-section {
  height: 250px; /* 与图表区域高度一致 */
  display: flex;
  flex-direction: column;
}

.historical-alarms-table-wrapper {
  flex-grow: 1;
  overflow: hidden; /* 关键：隐藏tbody的滚动条，通过scrollTop控制 */
  position: relative;
}

.historical-alarms-table-wrapper table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.historical-alarms-table-wrapper thead {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.historical-alarms-table-wrapper th,
.historical-alarms-table-wrapper td {
  color: rgba(255, 255, 255, 0.85);
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 设置各列的宽度 */
.historical-alarms-table-wrapper th:nth-child(1),
.historical-alarms-table-wrapper td:nth-child(1) {
  width: 25%;
}
.historical-alarms-table-wrapper th:nth-child(2),
.historical-alarms-table-wrapper td:nth-child(2) {
  width: 35%;
}
.historical-alarms-table-wrapper th:nth-child(3),
.historical-alarms-table-wrapper td:nth-child(3) {
  width: 25%;
}
.historical-alarms-table-wrapper th:nth-child(4),
.historical-alarms-table-wrapper td:nth-child(4) {
  width: 15%;
  text-align: center;
}

.historical-alarms-table-wrapper tbody {
  display: block;
  max-height: calc(250px - 38px); /* 表格内容区域高度，假设表头高38px */
  overflow-y: scroll; /* 保持滚动功能 */
  width: 100%;
  /* 隐藏滚动条的CSS技巧 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}

.historical-alarms-table-wrapper tbody::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
}

.historical-alarms-table-wrapper tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.detail-btn {
  background-color: transparent;
  color: #00E5FF;
  border: 1px solid #00E5FF;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.detail-btn:hover {
  background-color: rgba(0, 229, 255, 0.2);
}

.view-more-link {
  color: #00CFFF;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}
.view-more-link:hover {
  text-decoration: underline;
}

</style> 