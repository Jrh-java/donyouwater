<template>
  <div class="displacement-table-container">
    <el-table :data="tableData" stripe style="width: 100%" :height="height" v-loading="tableLoading">
      <el-table-column type="index" label="序号"  width="80" :index="(index) => (pagination.page - 1) * pagination.limit + index + 1" />
      <el-table-column prop="displaceName" label="位移方向"  />
      <el-table-column prop="mvcTime" width="180"label="最后监测时间" />
      <el-table-column prop="warnStatus" label="安全状态" >
        <template #default="{ row }">
          <el-tag :class="getWarningStatusClass(row.warnStatus)">{{ row.warnStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="displaceRealValue" label="实测值" >
        <template #default="{ row }">
          {{ row.displaceRealValue }}{{ row.unit }}
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页组件 -->
    <div v-if="showPagination" class="pagination-container" style="margin-top: 20px; text-align: right;">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getDisplaceList } from '@/api/reservoir';
import { useStore } from '@/store/pinia';

const store = useStore();

// Props
const props = defineProps({
  height: {
    type: [String, Number],
    default: 300
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  filterForm: {
    type: Object,
    default: () => ({
      timeRange: [],
      direction: 'all'
    })
  },
  deviceCode: {
    type: String,
    default: ''
  }
});

// 计算属性：获取当前设备代码
const currentDeviceCode = computed(() => {
  return props.deviceCode || props.filterForm.deviceCode || '';
});

// 分页相关
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 表格数据
const tableData = ref([]);
const tableLoading = ref(false);

// 获取表格数据
const fetchTableData = async () => {
  if (!currentDeviceCode.value) {
    console.warn('缺少deviceCode，无法获取表格数据');
    return;
  }

  try {
    tableLoading.value = true;
    const params = {
      displaceName: props.filterForm.direction === 'all' ? '' : props.filterForm.direction,
      deviceCode: currentDeviceCode.value,
      limit: pagination.limit,
      page: pagination.page
    };

    // 根据时间范围选择决定参数
    if (props.filterForm.timeRange && props.filterForm.timeRange.length === 2) {
      // 用户选择了时间范围，使用起止时间
      params.analyseStartTime = props.filterForm.timeRange[0];
      params.analyseEndTime = props.filterForm.timeRange[1];
    } else {
      // 用户没有选择时间范围，使用默认24小时
      params.analyseTimeType = '24h';
    }

    const response = await getDisplaceList(params);
    
    if (response) {
      tableData.value = response.list || [];
      pagination.total = response.totalCount || 0;
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
    ElMessage.error('获取表格数据失败');
  } finally {
    tableLoading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (page) => {
  pagination.page = page;
  fetchTableData();
};

const handleSizeChange = (size) => {
  pagination.limit = size;
  pagination.page = 1;
  fetchTableData();
};

// 获取预警状态样式类
const getWarningStatusClass = (status) => {
  switch (status) {
    case '正常':
    case '无风险':
      return 'status-normal';
    case '预警':
      return 'status-warning';
    case '报警':
      return 'status-danger';
    default:
      return 'status-info';
  }
};

// 监听deviceCode变化
watch(currentDeviceCode, (newCode) => {
  if (newCode) {
    pagination.page = 1;
    fetchTableData();
  }
}, { immediate: true });

// 监听筛选条件变化
watch(() => props.filterForm, () => {
  if (currentDeviceCode.value) {
    pagination.page = 1;
    fetchTableData();
  }
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  fetchTableData,
  tableData
});
</script>

<style lang="scss" scoped>
.displacement-table-container {
  font-size: 14px;
  
  // 表格样式
  :deep(.el-table) {
    background-color: #0e2a5a !important;
    color: white !important;
    
    .el-table__header-wrapper {
      background-color: #10306a !important;
      
      .el-table__header {
        background-color: #10306a !important;
        
        th {
          background-color: #10306a !important;
          color: #a0cfff !important;
          border-bottom: 1px solid #1e4a8c !important;
          border-right: 1px solid #1e4a8c !important;
        }
      }
    }
    
    .el-table__body-wrapper {
      background-color: #0e2a5a !important;
      
      .el-table__body {
        background-color: #0e2a5a !important;
        
        tr {
          background-color: #0e2a5a !important;
          
          &.el-table__row--striped {
            background-color: #0c2552 !important;
          }
          
          &:hover {
            background-color: #153e7a !important;
          }
          
          td {
            background-color: transparent !important;
            color: white !important;
            border-bottom: 1px solid #1e4a8c !important;
            border-right: 1px solid #1e4a8c !important;
          }
        }
      }
    }
    
    .el-table__empty-block {
      background-color: #0e2a5a !important;
      color: #a0cfff !important;
    }
    
    .el-loading-mask {
      background-color: rgba(14, 42, 90, 0.8) !important;
    }
  }
  
  // 分页样式
  .pagination-container {
    :deep(.el-pagination) {
      .el-pagination__total {
        color: #a0cfff !important;
      }
      
      .btn-prev,
      .btn-next {
        background-color: #071a3b !important;
        color: #a0cfff !important;
        border: 1px solid #1e4a8c !important;
        
        &:hover {
          background-color: #1890ff !important;
          color: white !important;
          border-color: #1890ff !important;
        }
        
        &.disabled {
          background-color: #071a3b !important;
          color: #666 !important;
          border-color: #1e4a8c !important;
        }
      }
      
      .el-pager {
        li {
          background-color: #071a3b !important;
          color: #a0cfff !important;
          border: 1px solid #1e4a8c !important;
          margin: 0 2px !important;
          
          &:hover {
            background-color: #1890ff !important;
            color: white !important;
            border-color: #1890ff !important;
          }
          
          &.is-active {
            background-color: #1890ff !important;
            color: white !important;
            border-color: #1890ff !important;
          }
        }
      }
      
      .el-pagination__jump {
        color: #a0cfff !important;
        
        .el-input {
          :deep(.el-input__wrapper) {
            background-color: #071a3b !important;
            border: 1px solid #1e4a8c !important;
            
            .el-input__inner {
              background-color: transparent !important;
              color: white !important;
            }
          }
        }
      }
      
      .el-select {
        :deep(.el-input) {
          .el-input__wrapper {
            background-color: #071a3b !important;
            border: 1px solid #1e4a8c !important;
            
            .el-input__inner {
              background-color: transparent !important;
              color: white !important;
            }
            
            .el-input__suffix {
              .el-input__suffix-inner {
                .el-select__caret {
                  color: #a0cfff !important;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 预警状态样式
.el-tag.status-normal {
  background-color: #4CAF50 !important;
  color: white !important;
  border-color: #4CAF50 !important;
}

.el-tag.status-warning {
  background-color: #FF9800 !important;
  color: white !important;
  border-color: #FF9800 !important;
}

.el-tag.status-danger {
  background-color: #FF6B6B !important;
  color: white !important;
  border-color: #FF6B6B !important;
}

.el-tag.status-info {
  background-color: #2196F3 !important;
  color: white !important;
  border-color: #2196F3 !important;
}
</style>