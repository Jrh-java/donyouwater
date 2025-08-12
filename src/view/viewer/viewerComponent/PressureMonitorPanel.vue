<template>
  <div v-if="show" class="pressure-monitor-panel-overlay" @click.self="$emit('close')">
    <div class="pressure-monitor-panel">
    <div class="panel-header">
      <h3>渗压监测 - {{ deviceData?.name || '未知设备' }}</h3>
      <el-button @click="$emit('close')" type="text" class="close-btn">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    


    <!-- 数据表格 -->
    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="序号" width="60" align="center" type="index" :index="getTableIndex"></el-table-column>
      <el-table-column prop="mvcTime" label="监测时间" width="180" align="center"></el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" align="center"></el-table-column>
      <el-table-column prop="waterLevel" label="水位(m)" align="center"></el-table-column>
      <el-table-column prop="elevationWaterLevel" label="高程水位(m)" align="center"></el-table-column>
      <el-table-column prop="waterPressure" label="水压(kPa)" align="center"></el-table-column>
      <el-table-column prop="warnStatus" label="预警状态" align="center">
        <template #default="scope">
          <el-tag :class="getWarningStatusClass(scope.row.warnStatus)">{{ scope.row.warnStatus }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems">
      </el-pagination>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { ElIcon, ElButton, ElTable, ElTableColumn, ElPagination, ElTag } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { getOsmoticPressurePage } from '@/api/reservoir';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  deviceData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

// 固定使用24小时数据
const analyseTimeType = '24h';

// 表格数据
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const loading = ref(false);

// 计算表格序号
const getTableIndex = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
};

// 获取预警状态样式类
const getWarningStatusClass = (status) => {
  if (status === '正常') {
    return 'status-normal';
  } else if (status === '超出阈值') {
    return 'status-warning';
  }
  return '';
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchPressureData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchPressureData();
};

// 获取渗压监测数据
const fetchPressureData = async () => {
  if (!props.deviceData?.deviceCode) {
    console.warn('未找到设备编号');
    return;
  }
  
  try {
    loading.value = true;
    
    const requestData = {
      analyseTimeType,
      limit: pageSize.value,
      page: currentPage.value,
      deviceCode: props.deviceData.deviceCode
    };
    
    console.log('渗压监测弹窗: 请求参数', requestData);
    
    const response = await getOsmoticPressurePage(requestData);
    
    console.log('渗压监测弹窗: 获取渗压监测数据', response);
    
    // 更新表格数据
    tableData.value = response.list || [];
    totalItems.value = response.totalCount || 0;
    
  } catch (error) {
    console.error('获取渗压监测数据失败:', error);
    // 发生错误时，设置默认值
    tableData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};



// 监听设备数据变化，只有在组件显示时才执行
watch(() => [props.show, props.deviceData], ([newShow, newDeviceData]) => {
  if (newShow && newDeviceData && newDeviceData.deviceCode) {
    console.log('压力监测弹窗: 设备数据变化', newDeviceData);
    fetchPressureData();
  }
});

// 当组件显示时初始化数据
watch(() => props.show, (newShow) => {
  if (newShow && props.deviceData && props.deviceData.deviceCode) {
    fetchPressureData();
  }
});

onMounted(() => {
  // 移除onMounted中的自动执行，改为通过watch控制
});
</script>

<style lang="scss" scoped>
.pressure-monitor-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
}

.pressure-monitor-panel {
  background-color: #0a214d;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  width: 1000px;


  display: flex;
  flex-direction: column;
  
  .panel-header {
    background-color: #10306a;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  
    
    h3 {
      margin: 0;
      color: #E0F2F7;
      font-size: 18px;
      font-weight: bold;
    }
    
    .close-btn {
      color: #E0F2F7;
      
      &:hover {
        color: #00CFFF;
      }
    }
  }
  

  
  .pagination-section {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    
    :deep(.el-pagination) {
      .el-pagination__total {
        color: #a0cfff;
      }
      
      .btn-prev,
      .btn-next {
        background-color: #071a3b;
        color: #a0cfff;
        border: 1px solid #1e4a8c;
        
        &:hover {
          background-color: #1890ff;
          color: white;
          border-color: #1890ff;
        }
        
        &.disabled {
          background-color: #071a3b;
          color: #666;
          border-color: #1e4a8c;
        }
      }
      
      .el-pager {
        li {
          background-color: #071a3b;
          color: #a0cfff;
          border: 1px solid #1e4a8c;
          margin: 0 2px;
          
          &:hover {
            background-color: #1890ff;
            color: white;
            border-color: #1890ff;
          }
          
          &.is-active {
            background-color: #1890ff;
            color: white;
            border-color: #1890ff;
          }
        }
      }
      
      .el-pagination__jump {
        color: #a0cfff;
        
        .el-input {
          :deep(.el-input__wrapper) {
            background-color: #071a3b;
            border: 1px solid #1e4a8c;
            
            .el-input__inner {
              background-color: transparent;
              color: white;
            }
          }
        }
      }
    }
  }
  
  // 表格样式
  :deep(.el-table) {
    background-color: #0e2a5a;
    color: white;
    
    .el-table__header-wrapper {
      background-color: #10306a;
      
      .el-table__header {
        background-color: #10306a;
        
        th {
          background-color: #10306a;
          color: #a0cfff;
          border-bottom: 1px solid #1e4a8c;
          border-right: 1px solid #1e4a8c;
        }
      }
    }
    
    .el-table__body-wrapper {
      background-color: #0e2a5a;
      
      .el-table__body {
        background-color: #0e2a5a;
        
        tr {
          background-color: #0e2a5a;
          
          &.el-table__row--striped {
            background-color: #0c2552;
          }
          
          &:hover {
            background-color: #153e7a;
          }
          
          td {
            background-color: transparent;
            color: white;
            border-bottom: 1px solid #1e4a8c;
            border-right: 1px solid #1e4a8c;
          }
        }
      }
    }
    
    .el-table__empty-block {
      background-color: #0e2a5a;
      color: #a0cfff;
    }
    
    .el-loading-mask {
      background-color: rgba(14, 42, 90, 0.8);
    }
  }
}

// 预警状态样式
.el-tag.status-normal {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.el-tag.status-warning {
  background-color: #FF6B6B;
  color: white;
  border-color: #FF6B6B;
}
</style>