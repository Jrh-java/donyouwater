<template>
    <div class="seepage-container">
  
      <el-card class="box-card">
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">
            <el-form-item label="时间筛选:">
              <el-select v-model="filterForm.timeRange" placeholder="请选择时间范围" @change="onSearch" style="width: 150px;"  :teleported="false">
                <el-option label="24小时" value="24h"></el-option>
                <el-option label="12小时" value="12h"></el-option>
                <el-option label="6小时" value="6h"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="选择设备:">
              <el-select v-model="filterForm.deviceCode" placeholder="请选择设备" :teleported="false" style="width: 200px;">
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
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { useStore } from '@/store/pinia';
  import { getOsmoticPressurePage } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';
import { ElMessage } from 'element-plus';
  
  const store = useStore();
  
  // 计算属性：获取当前选中的节点
  const selectedDamNode = computed(() => store.selectedDamNode);
  
  // 设备列表
  const deviceList = ref([]);
  
  const filterForm = reactive({
    timeRange: '24h',
    deviceCode: ''
  });
  
  const tableData = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalItems = ref(0);
  const loading = ref(false);
  
  // 获取设备列表
  const fetchDeviceList = async () => {
    try {
      const params = {
        page: 1,
        limit: 100,
        mcsType: 'pressure'
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
  
  // 获取渗压监测数据
  const fetchSeepageData = async () => {
    if (!filterForm.deviceCode) {
      console.warn('缺少deviceCode，无法获取渗压监测数据');
      return;
    }

    try {
      loading.value = true;
      
      const requestData = {
        analyseTimeType: filterForm.timeRange,
        limit: pageSize.value,
        page: currentPage.value,
        deviceCode: filterForm.deviceCode
      };

      console.log('Seepage页面: 请求渗压监测数据', requestData);
      
      const response = await getOsmoticPressurePage(requestData);
      
      console.log('Seepage页面: 获取渗压监测数据成功', response);
      
      // 根据request.ts，返回的结果已经是res.data
      tableData.value = response.list || [];
      totalItems.value = response.totalCount || 0;
      
    } catch (error) {
      console.error('Seepage页面: 获取渗压监测数据失败', error);
      ElMessage.error('获取渗压监测数据失败');
    } finally {
      loading.value = false;
    }
  };
  
  // 加载渗压监测数据
  const loadSeepageData = () => {
    if (filterForm.deviceCode) {
      console.log('Seepage页面: 加载渗压监测数据', filterForm.deviceCode);
      fetchSeepageData();
    }
  };
  
  // 监听设备选择变化
  watch(() => filterForm.deviceCode, (newDeviceCode) => {
    if (newDeviceCode) {
      console.log('Seepage页面: 检测到设备变化', newDeviceCode);
      currentPage.value = 1; // 重置页码
      loadSeepageData();
    }
  });
  
  // 监听时间范围变化
  watch(() => filterForm.timeRange, (newTimeRange) => {
    console.log('Seepage页面: 时间范围变化', newTimeRange);
    if (filterForm.deviceCode) {
      currentPage.value = 1; // 重置页码
      fetchSeepageData();
    }
  });
  
  onMounted(async () => {
    // DOM渲染完成后，先获取设备列表
    await fetchDeviceList();
    // 如果有选中的设备，则加载数据
    if (filterForm.deviceCode) {
      loadSeepageData();
    }
  });
  
  const onSearch = () => {
    currentPage.value = 1; // 重置到第一页
    fetchSeepageData();
  };
  
  const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1; // 重置到第一页
    fetchSeepageData();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchSeepageData();
  };
  
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
  
  </script>
  
  <style lang="scss" scoped>
  .el-form{
    text-align: left;
  }
  .seepage-container {
    padding: 20px;
    
    h1 {
      margin-bottom: 20px;
      font-size: 24px;
      color: #303133; // 更深色的标题
    }
  
    .box-card {
      .filter-section {
        margin-bottom: 20px;
        .el-form-item {
          margin-bottom: 0; // 紧凑排列
        }
      }
  
      .pagination-section {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  
  // 预警状态样式
  .el-tag.status-normal {
    background-color: #e8f5e9; // Light green
    color: #388e3c;
    border-color: #c8e6c9;
  }
  
  .el-tag.status-warning {
    background-color: #ffcdd2; // Light red
    color: #c62828;
    border-color: #ef9a9a;
  }
  
  // 确保Element Plus组件样式正确加载
  // 如果项目中已经全局引入Element Plus CSS，则不需要下面的导入
  // @import 'element-plus/dist/index.css'; 
  </style>