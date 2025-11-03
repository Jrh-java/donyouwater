<template>
  <div v-if="show" class="gate-station-device-panel-overlay" @click.self="$emit('close')">
    <div class="gate-station-device-panel">
      <div class="panel-header">
        <h3>闸门站设备管理</h3>
        <el-button @click="$emit('close')" type="text" class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <!-- 设备列表表格 -->
      <div class="device-table-container">
        <el-table 
          :data="deviceList" 
          style="width: 100%" 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#0e2a5a', color: '#E0F2F7', borderColor: '#1e4a8c' }"
          :cell-style="{ backgroundColor: '#071a3b', color: '#E0F2F7', borderColor: '#1e4a8c' }"
        >
          <el-table-column type="index" width="60" label="序号" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" />
          <el-table-column prop="lonLat" label="经纬度坐标" min-width="180" />
          <el-table-column prop="installTime" label="安装时间" min-width="150" />
          <el-table-column prop="remarks" label="备注信息" min-width="200" show-overflow-tooltip />
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :background="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElIcon, ElButton, ElTable, ElTableColumn, ElPagination } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { getDeviceManagementPage } from '@/api/device';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

// 数据状态
const loading = ref(false);
const deviceList = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 获取设备数据
const fetchDeviceData = async () => {
  try {
    loading.value = true;
    const response = await getDeviceManagementPage({
      page: currentPage.value,
      limit: pageSize.value,
      mcsType: 'gateStation'
    });
    
    if ( response) {
      deviceList.value = response.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取设备数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchDeviceData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchDeviceData();
};

// 监听弹窗显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchDeviceData();
  }
});

onMounted(() => {
  if (props.show) {
    fetchDeviceData();
  }
});
</script>

<style scoped>
.gate-station-device-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.gate-station-device-panel {
  background: linear-gradient(135deg, #0a214d 0%, #071a3b 100%);
  border: 2px solid #1e4a8c;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  height: 80%;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #1e4a8c;
  background-color: #0e2a5a;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #E0F2F7;
  }
  
  .close-btn {
    color: #a0cfff;
    font-size: 18px;
    padding: 8px;
    
    &:hover {
      color: #E0F2F7;
      background-color: #1e4a8c;
    }
  }
}

.device-table-container {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .el-table {
    flex: 1;
    background-color: transparent;
    
    :deep(.el-table__body-wrapper) {
      max-height: calc(100% - 60px);
      overflow-y: auto;
      
      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: #0a214d;
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #1e4a8c;
        border-radius: 4px;
        
        &:hover {
          background: #2a5aa0;
        }
      }
    }
    
    :deep(.el-table__row) {
      &:hover {
        background-color: #1e4a8c !important;
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__jump {
        color: #a0cfff;
      }
      
      .el-pager li {
        background-color: #071a3b;
        color: #a0cfff;
        border: 1px solid #1e4a8c;
        
        &:hover {
          color: #E0F2F7;
          background-color: #1e4a8c;
        }
        
        &.is-active {
          background-color: #1890ff;
          color: white;
          border-color: #1890ff;
        }
      }
      
      .btn-prev,
      .btn-next {
        background-color: #071a3b;
        color: #a0cfff;
        border: 1px solid #1e4a8c;
        
        &:hover {
          color: #E0F2F7;
          background-color: #1e4a8c;
        }
        
        &:disabled {
          color: #666;
          background-color: #0a214d;
        }
      }
      
      .el-select {
        :deep(.el-input__wrapper) {
          background-color: #071a3b;
          border: 1px solid #1e4a8c;
          
          .el-input__inner {
            background-color: transparent;
            color: #a0cfff;
          }
        }
      }
    }
  }
}

/* Element Plus 下拉框深色主题 */
:deep(.el-select-dropdown) {
  background-color: #071a3b !important;
  border: 1px solid #1e4a8c !important;
  
  .el-select-dropdown__item {
    background-color: #071a3b !important;
    color: #a0cfff !important;
    
    &:hover {
      background-color: #1890ff !important;
      color: white !important;
    }
    
    &.selected {
      background-color: #1890ff !important;
      color: white !important;
    }
  }
}
</style>