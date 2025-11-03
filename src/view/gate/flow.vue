<template>
  <div class="flow-container">
    <el-card shadow="never" style="margin-top: 20px;">
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="监测设备:">
          <el-select v-model="queryParams.deviceType" placeholder="全部" :teleported="false" style="width: 150px;">
            <el-option label="全部" value="all"></el-option>
            <el-option label="测压管" value="piezometer"></el-option>
            <el-option label="渗流量计" value="flowmeter"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号:">
          <el-input v-model="queryParams.deviceSerial" placeholder="请输入..."></el-input>
        </el-form-item>
        <el-form-item label="监测时间:">
          <el-date-picker
            v-model="queryParams.timeRange"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :teleported="false"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          <el-button @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" style="width: 100%">
        <template #empty>
          <div class="empty-data">
            <el-empty description="暂无数据" />
          </div>
        </template>
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="lastMonitorTime" label="最后监测时间" width="180" align="center"></el-table-column>
        <el-table-column prop="deviceSerial" label="设备编号" align="center"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" align="center"></el-table-column>
        <el-table-column prop="flowRate" label="渗流量 (L/S)" align="center">
          <template #default="scope">
            <span v-if="scope.row.flowRate === null">-</span>
            <span v-else>{{ scope.row.flowRate }} <span v-if="scope.row.flowRateStatus === '超限'" style="color: red;">({{ scope.row.flowRateStatus }})</span></span>
          </template>
        </el-table-column>
        <el-table-column prop="pressureLevel" label="测压管水位 (m)" align="center"></el-table-column>
        <el-table-column prop="trend" label="趋势" align="center"></el-table-column>
        <el-table-column prop="warningStatus" label="预警状态" align="center">
          <template #default="scope">
            <el-tag :type="getWarningStatusType(scope.row.warningStatus)">{{ scope.row.warningStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" align="center"></el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end;"
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :teleported="false"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import { useStore } from '@/store/pinia';

const store = useStore();

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

// 根据选中的水库加载渗流监测数据
const loadFlowDataForReservoir = (reservoirNode) => {
  console.log('Flow页面: 为水库加载渗流监测数据', reservoirNode);
  // 这里可以调用API获取特定水库的渗流监测数据
  // 例如：getFlowData(reservoirNode.id)
  // 然后更新tableData
};

// 监听选中节点变化
watch(selectedDamNode, (newNode, oldNode) => {
  if (newNode) {
    console.log('Flow页面: 检测到选中节点变化', newNode);
    // 在这里可以根据选中的水库重新加载渗流监测数据
    loadFlowDataForReservoir(newNode);
  }
}, { immediate: true });

const queryParams = reactive({
  deviceType: 'all',
  deviceSerial: '',
  timeRange: [],
});

const tableData = ref([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const getWarningStatusType = (status) => {
  if (status === '正常') {
    return 'success';
  } else if (status === 'I级告警' || status === 'II级告警') {
    return 'warning'; // Element Plus uses 'warning' for orange-like colors, 'danger' for red
  } else if (status === 'III级告警') { // Assuming there might be other levels
    return 'danger';
  }
  return ''; // Default or other statuses
};

const handleQuery = () => {
  console.log('Querying with:', queryParams);
  // Implement query logic here, fetch data from backend
  // For now, just log
  // Potentially reset to page 1
  pagination.currentPage = 1;
  fetchData();
};

const handleReset = () => {
  queryParams.deviceType = 'all';
  queryParams.deviceSerial = '';
  queryParams.timeRange = [];
  console.log('Resetting query params');
  // Fetch data with default params
  fetchData();
};

const handleExport = () => {
  console.log('Exporting data with params:', queryParams);
  // Implement export logic here
};

const handleSizeChange = (val) => {
  console.log(`Page size changed to: ${val}`);
  pagination.pageSize = val;
  pagination.currentPage = 1; // Reset to first page when page size changes
  fetchData();
};

const handleCurrentChange = (val) => {
  console.log(`Current page changed to: ${val}`);
  pagination.currentPage = val;
  fetchData();
};

// Data fetching function
const fetchData = () => {
  console.log(`Fetching data for page: ${pagination.currentPage}, size: ${pagination.pageSize}`);
  // In a real app, you would fetch data from an API here based on queryParams and pagination
  // For now, show no data
  tableData.value = [];
  pagination.total = 0;
};

// Initial data fetch
fetchData();

</script>

<style lang="scss" scoped>
.flow-container {
  padding: 20px;
}

.filter-bar .el-form-item {
  margin-bottom: 15px; // Align items in filter bar better
  margin-right: 15px;
}

// Custom styling for warning status if needed beyond el-tag types
// For example, if specific colors are required that don't map directly to success/warning/danger
// .el-tag.status-normal {
//   background-color: #e8f5e9; // Light green
//   color: #388e3c;
//   border-color: #c8e6c9;
// }
// .el-tag.status-warning-level1 {
//   background-color: #fff3e0; // Light orange
//   color: #ef6c00;
//   border-color: #ffe0b2;
// }
// .el-tag.status-warning-level2 {
//   background-color: #ffcdd2; // Light red
//   color: #c62828;
//   border-color: #ef9a9a;
// }
</style>