<template>
  <div class="displacement-table-container">
    <el-table :data="tableData" stripe style="width: 100%" :height="height" v-loading="tableLoading">
      <el-table-column type="index" label="序号"  width="80" :index="(index) => (pagination.page - 1) * pagination.limit + index + 1" />
      <el-table-column prop="displaceName" label="位移方向"  />
      <el-table-column prop="mvcTime" label="最后监测时间" />
      <el-table-column prop="warnStatus" label="安全状态" >
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.warnStatus)">{{ row.warnStatus }}</el-tag>
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

// 状态类型获取
const getStatusType = (status) => {
  switch (status) {
    case '正常':
    case '无风险':
      return 'success';
    case '预警':
      return 'warning';
    case '报警':
      return 'danger';
    default:
      return 'info';
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
}
</style>