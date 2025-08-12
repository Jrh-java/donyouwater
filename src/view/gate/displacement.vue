<template>
  <div class="displacement-container">
    <!-- 过滤条件 -->
    <div class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期时间"
            end-placeholder="结束日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :teleported="false"
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="位移方向">
          <el-select v-model="filterForm.direction" placeholder="请选择" :teleported='false'>
            <el-option label="全部" value="all"></el-option>
            <el-option label="北向偏移" value="北向偏移"></el-option>
            <el-option label="东向偏移" value="东向偏移"></el-option>
            <el-option label="高程偏移" value="高程偏移"></el-option>
            <el-option label="北向累计偏移" value="北向累计偏移"></el-option>
            <el-option label="东向累计偏移" value="东向累计偏移"></el-option>
            <el-option label="高程累计偏移" value="高程累计偏移"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择设备">
          <el-select v-model="filterForm.deviceCode" placeholder="请选择设备" :teleported='false' style="width: 200px;">
            <el-option 
              v-for="device in deviceList" 
              :key="device.deviceCode" 
              :label="device.deviceName" 
              :value="device.deviceCode">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 指标展示 -->
    <el-row :gutter="20" class="indicators-row">
      <el-col :span="8">
        <el-card class="indicator-card">
          <div class="indicator-content">
            <img src="@/assets/icons/online-tracking.png" alt="在线点数" class="indicator-icon" />
            <div class="indicator-text">
              <div class="indicator-title">在线点数</div>
              <div class="indicator-value">{{ indicatorData.onlineCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="indicator-card">
          <div class="indicator-content">
            <img src="@/assets/icons/warning.png" alt="告警数" class="indicator-icon" />
            <div class="indicator-text">
              <div class="indicator-title">告警数</div>
              <div class="indicator-value">{{ indicatorData.warnCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="indicator-card">
          <div class="indicator-content">
            <img src="@/assets/icons/measurement.png" alt="今日最大位移量" class="indicator-icon" />
            <div class="indicator-text">
              <div class="indicator-title">今日最大位移量 (m)</div>
              <div class="indicator-value">{{ indicatorData.maxDisplaceValue }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content-row">
      <el-col :span="10">
        <el-card class="monitoring-image-card">
          <div class="card-header">实时监控</div>
          <div class="video-placeholder" style="width: 100%; height: 350px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; border-radius: 4px;">
            <div style="text-align: center; color: #999;">
              <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
              <div style="font-size: 16px;">暂未接入视频设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card class="data-table-card">
          <div class="card-header">
            <span>监测点数据详情</span>
            <!-- <div class="status-summary">
              <span class="status-item">报警数: <span class="value red">-</span></span>
              <span class="status-item">预警数: <span class="value orange">-</span></span>
              <span class="status-item">无风险: <span class="value green">-</span></span>
            </div> -->
          </div>
          <DisplacementTable 
            :height="300"
            :show-pagination="true"
            :filter-form="filterForm"
            :device-code="filterForm.deviceCode"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <div class="card-header">
            <span> 顺河向位移 (mm)</span>
            <el-button type="primary"   @click="exportData">导出数据</el-button>
          </div>
          <div ref="chart1" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <div class="card-header">
            <span>逆河向位移 (mm)</span>
            <el-button type="primary"   @click="exportData">导出数据</el-button>
          </div>
          <div ref="chart2" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { useStore } from '@/store/pinia';
import { ElMessage } from 'element-plus';
import { exportDisplacementData, getForwardDisplaceAvgList, getDisplaceTitle } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';
import DisplacementTable from '@/components/DisplacementTable.vue';

const store = useStore();

// 加载状态
const loading = ref(false);

// 设备列表
const deviceList = ref([]);

// 指标数据
const indicatorData = ref({
  onlineCount: 0,
  warnCount: 0,
  maxDisplaceValue: 0
});

// 图表数据状态
const forwardChartData = ref({
  mvcTime: [],
  moveNum: []
});

const backwardChartData = ref({
  mvcTime: [],
  moveNum: []
});

const chart1 = ref(null);
const chart2 = ref(null);



// 获取指标数据
const fetchIndicatorData = async () => {
  try {
    const response = await getDisplaceTitle();
    if (response) {
      indicatorData.value = {
        onlineCount: response.onlineCount || 0,
        warnCount: response.warnCount || 0,
        maxDisplaceValue: response.maxDisplaceValue || 0
      };
    }
  } catch (error) {
    console.error('获取指标数据失败:', error);
    ElMessage.error('获取指标数据失败');
  }
};

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const params = {
      page: 1,
      limit: 100,
      mcsType: 'displacement'
    };
    
    const response = await getDeviceManagementPage(params);
    if (response && response.list) {
      deviceList.value = response.list;
      // 如果有设备且当前没有选中设备，默认选中第一个
      if (deviceList.value.length > 0 && !filterForm.deviceCode) {
        filterForm.deviceCode = deviceList.value[0].deviceCode;
      }
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
  }
};

// 获取位移数据
const fetchDisplacementData = async (isForward = true) => {
  if (!filterForm.deviceCode) {
    console.warn('缺少deviceCode，无法获取位移数据');
    return;
  }

  try {
    loading.value = true;
    const params = {
      isForward: isForward,
      deviceCode: filterForm.deviceCode,
      displaceName: filterForm.direction === 'all' ? '' : filterForm.direction,
      analyseTimeType: '24h',
    };



    const response = await getForwardDisplaceAvgList(params);
    
    if (response ) {
      let chartData;
      
      // 检查数据是否为空
      if (response.length === 0) {
        chartData = {
          mvcTime: [],
          moveNum: []
        };
      } else {
        chartData = {
          mvcTime: response.map(item => {
            // 提取时间中的小时部分，如"2025-07-04 09:00:00" -> "9点"
            const date = new Date(item.mvcTime);
            return date.getHours() + '点';
          }),
          moveNum: response.map(item => item.displaceRealValue)
        };
      }

      if (isForward) {
        forwardChartData.value = chartData;
        // 重新初始化顺河向图表
        setTimeout(() => {
          initChart(chart1, '顺河向位移', forwardChartData.value, response.length === 0, true);
        }, 0);
      } else {
        backwardChartData.value = chartData;
        // 重新初始化逆河向图表
        setTimeout(() => {
          initChart(chart2, '逆河向位移', backwardChartData.value, response.length === 0, false);
        }, 0);
      }
    }
  } catch (error) {
    console.error('获取位移数据失败:', error);
    ElMessage.error('获取位移数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载位移监测数据
const loadDisplacementData = () => {
  if (filterForm.deviceCode) {
    console.log('Displacement页面: 加载位移监测数据', filterForm.deviceCode);
    // 同时获取顺河向和逆河向数据
    fetchDisplacementData(true);  // 顺河向
    fetchDisplacementData(false); // 逆河向
  }
};

const filterForm = reactive({
  timeRange: [],
  direction: 'all',
  point: 'all',
  deviceCode: ''
});

// 监听设备选择变化
watch(() => filterForm.deviceCode, (newDeviceCode) => {
  if (newDeviceCode) {
    console.log('Displacement页面: 检测到设备变化', newDeviceCode);
    loadDisplacementData();
  }
});

// 监听筛选条件变化
watch([() => filterForm.timeRange, () => filterForm.direction], () => {
  if (filterForm.deviceCode) {
    // 重新获取数据
    fetchDisplacementData(true);  // 顺河向
    fetchDisplacementData(false); // 逆河向
  }
}, { deep: true });



const initChart = (chartRef, titleText, data, isEmpty = false, isForward = true) => {
  if (chartRef.value) {
    const myChart = echarts.init(chartRef.value);
    
    let option;
    
    if (isEmpty || data.mvcTime.length === 0) {
      // 空数据时显示暂无数据
      option = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: []
      };
    } else {
      // 根据图表类型设置不同的Y轴范围和数据处理
      let yAxisConfig, processedData;
      
      if (isForward) {
        // 正向图表：0-100
        yAxisConfig = {
          type: 'value',
          min: 0,
          max: 15
        };
        // 正向数据取绝对值，确保在0-100范围内
        processedData = data.moveNum.map(value => Math.abs(value));
      } else {
        // 逆向图表：0到-100
        yAxisConfig = {
          type: 'value',
          min: -15,
          max: 0
        };
        // 逆向数据转为负值，确保在-100到0范围内
        processedData = data.moveNum.map(value => -Math.abs(value));
      }
      
      // 有数据时正常显示图表
      option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.mvcTime
        },
        yAxis: yAxisConfig,
        series: [
          {
            name: titleText,
            type: 'bar',
            data: processedData,
            itemStyle: {
              color: isForward ? '#5470C6' : '#91CC75'
            }
          }
        ]
      };
    }
    
    myChart.setOption(option, true); // 使用 true 参数清空之前的配置
  }
};

const exportData = async () => {
  try {
    ElMessage.info('正在导出位移监测数据...');
    
    // 创建FormData并append参数
    const formData = new FormData();
    
    // 合并顺河向和逆河向的时间数据
    const allTimeData = [...forwardChartData.value.mvcTime, ...backwardChartData.value.mvcTime];
    // 合并顺河向和逆河向的位移数据
    const allMoveData = [...forwardChartData.value.moveNum, ...backwardChartData.value.moveNum];
    
    // append jsonParam1: mvcTime数组
    formData.append('jsonParam1', JSON.stringify(allTimeData));
    
    // append jsonParam2: moveNum数组
    formData.append('jsonParam2', JSON.stringify(allMoveData));
    
    // 记录表单条件（用于日志）
    const exportParams = {
      timeRange: filterForm.timeRange,
      direction: filterForm.direction,
      point: filterForm.point
    };
    
    console.log('导出参数:', exportParams);
    console.log('时间数据:', allTimeData);
    console.log('位移数据:', allMoveData);
    
    // 调用导出API
    const response = await exportDisplacementData(formData);
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    link.download = `位移监测数据_${dateStr}.xlsx`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  }
};

onMounted(async () => {
  // DOM渲染完成后，先获取指标数据和设备列表
  await fetchIndicatorData();
  await fetchDeviceList();
  // 如果有选中的设备，则加载数据
  if (filterForm.deviceCode) {
    loadDisplacementData();
  }
});

</script>

<style lang="scss" scoped>
.displacement-container {
  gap: 20px;
    display: flex;
    flex-direction: column;
  padding: 20px;
  background-color: #f0f2f5; // 更柔和的背景色
}

.filter-card {

  background-color: white;
  border-radius: 8px;
  padding: 30px;

  .el-form {
    display: flex;
    justify-content: flex-start;
    .el-form-item {
      margin-right: 15px;
      margin-bottom: 0 ;
      .el-select {
        width: 100px;
      }
    }
  }
}

.indicators-row .el-card,
.main-content-row .el-card,
.charts-row .el-card {


  border-radius: 8px; // 更圆润的卡片边角
}

.indicator-card {
  .indicator-content {
    display: flex;
    align-items: center;
  }
  .indicator-icon {
    width: 48px; // 调整图标大小
    height: 48px;
    margin-right: 15px;
  }
  .indicator-text {
    .indicator-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 5px;
    }
    .indicator-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
  }
}

.main-content-row {
  .monitoring-image-card,
  .data-table-card {
    height: 100%; // 确保卡片等高
  }
}

.monitoring-image {
  width: 100%;
  height: auto; // 保持图片比例
  max-height: 400px; // 限制最大高度
  object-fit: cover;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px; // 表头和内容间距
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.status-summary {
  font-size: 14px;
  .status-item {
    margin-left: 15px;
    .value {
      font-weight: bold;
      &.red { color: #f56c6c; }
      &.orange { color: #e6a23c; }
      &.green { color: #67c23a; }
    }
  }
}

.el-table {
  font-size: 14px;
}

// 确保图表容器有明确的高度
.chart-card div[ref^="chart"] {
  width: 100%;
  height: 300px;
}

// 响应式调整
@media (max-width: 768px) {
  .indicators-row .el-col,
  .main-content-row .el-col {
    margin-bottom: 20px;
  }
  .main-content-row .el-col:last-child {
    margin-bottom: 0;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    .status-summary {
      margin-left: 0;
      margin-top: 10px;
    }
  }
}

</style>