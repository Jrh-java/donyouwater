<template>
  <div class="stress-container">
    <el-card shadow="never" class="table-card">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="监测设备:">
          <el-select v-model="queryForm.deviceType" placeholder="全部" style="width: 100px;" :teleported="false">
            <el-option label="全部" value="all"></el-option>
            <el-option label="测压管" value="pressureGauge"></el-option>
            <el-option label="渗流量计" value="seepageMeter"></el-option>
            <!-- Add more device types as needed -->
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号:">
          <el-input v-model="queryForm.deviceNumber" placeholder="请输入..."></el-input>
        </el-form-item>
        <el-form-item label="监测时间:">
          <el-date-picker
          :teleported="false"
            v-model="queryForm.dateTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" style="width: 100%">
        <template #empty>
          <div class="empty-data">
            <el-empty description="暂无数据" />
          </div>
        </template>
        <el-table-column prop="id" label="序号" width="80"></el-table-column>
        <el-table-column prop="lastMonitorTime" label="最后监测时间" width="180"></el-table-column>
        <el-table-column prop="deviceNumber" label="设备编号" ></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" ></el-table-column>
        <el-table-column prop="stressValue" label="应力值 (MPa)" >
          <template #default="scope">
            <span :class="getStressClass(scope.row.stressValue)">{{ scope.row.stressValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="loadRatio" label="荷载比" ></el-table-column>
        <el-table-column prop="temperature" label="温度 (°C)" ></el-table-column>
        <el-table-column prop="warningStatus" label="预警状态" >
          <template #default="scope">
            <el-tag :type="getWarningTagType(scope.row.warningStatus)">{{ scope.row.warningStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="180"></el-table-column>
        <el-table-column prop="relatedDisplacementPoint" label="关联位移测点"></el-table-column>
      </el-table>

      <el-pagination
        class="pagination-container"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { useStore } from '@/store/pinia';
import { exportStressData } from '@/api/reservoir';

const store = useStore();

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

// 根据选中的水库加载应力监测数据
const loadStressDataForReservoir = (reservoirNode) => {
  console.log('Stress页面: 为水库加载应力监测数据', reservoirNode);
  // 这里可以调用API获取特定水库的应力监测数据
  // 例如：getStressData(reservoirNode.id)
  // 然后更新tableData
};

// 监听选中节点变化
watch(selectedDamNode, (newNode, oldNode) => {
  if (newNode) {
    console.log('Stress页面: 检测到选中节点变化', newNode);
    // 在这里可以根据选中的水库重新加载应力监测数据
    loadStressDataForReservoir(newNode);
  }
}, { immediate: true });

const queryForm = reactive({
  deviceType: 'all',
  deviceNumber: '',
  dateTimeRange: [],
});

const tableData = ref([]);

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

const handleQuery = () => {
  ElMessage.info('查询功能待实现');
  // Implement query logic here
  // Potentially filter tableData or fetch new data based on queryForm
};

const handleReset = () => {
  queryForm.deviceType = 'all';
  queryForm.deviceNumber = '';
  queryForm.dateTimeRange = [];
  ElMessage.success('重置成功');
  // Optionally, re-fetch or reset table data to initial state
};

const handleExport = async () => {
  try {
    ElMessage.info('正在导出应力监测数据...');
    
    // 创建FormData并append参数
    const formData = new FormData();
    
    // 准备导出数据，排除id字段，只保留业务数据
    const exportData = tableData.value.map(item => {
      const { id, ...exportItem } = item;
      return exportItem;
    });
    
    // 将表格数据转为JSON字符串并append到jsonParam
    formData.append('jsonParam', JSON.stringify(exportData));
    
    console.log('导出数据:', exportData);
    
    // 调用导出API
    const response = await exportStressData(formData);
    
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
    link.download = `应力监测数据_${dateStr}.xlsx`;
    
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

const handleSizeChange = (val) => {
  pageSize.value = val;
  // Fetch data for new page size
  ElMessage.info(`每页 ${val} 条`);
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  // Fetch data for new page
  ElMessage.info(`当前页: ${val}`);
};

const getWarningTagType = (status) => {
  if (status.includes('告警')) {
    return 'danger';
  }
  return 'success';
};

const getStressClass = (value) => {
  if (value.includes('(压)')) {
    return 'stress-compressive';
  }
  if (value.includes('(拉)')) {
    return 'stress-tensile';
  }
  return '';
};

</script>

<style lang="scss" scoped>
.stress-container {
  padding: 20px;
}

.query-form {
  //靠左
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;

  .el-form-item {
    margin-bottom: 10px; // Reduce bottom margin for a more compact form
    margin-left: 20px;;
  }
}

.table-card {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.stress-compressive {
  color: #f56c6c; // Example color for compressive stress
}

.stress-tensile {
  color: #67c23a; // Example color for tensile stress
}

.el-button .el-icon {
  margin-right: 5px;
}
</style>