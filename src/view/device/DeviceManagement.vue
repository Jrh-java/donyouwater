<template>
  <div class="device-management-container">
    <div class="main-content">
      <!-- 左侧监测类型按钮组 -->
      <div class="category-sidebar">
        <div class="category-title">监测类型</div>
        <div class="category-buttons">
          <el-button
            :type="activeCategory === '' ? 'primary' : 'default'"
            class="category-btn"
            @click="handleCategoryChange('')"
          >
            全部类型
          </el-button>
          <el-button
            v-for="category in categoryOptions"
            :key="category.value"
            :type="activeCategory === category.value ? 'primary' : 'default'"
            class="category-btn"
            @click="handleCategoryChange(category.value)"
          >
            {{ category.label }}
          </el-button>
        
        </div>
      </div>

      <!-- 右侧主要内容 -->
      <div class="content-main">
        <div class="content-wrapper">
          <!-- Filter Section -->
          <div class="filter-section">
            <el-form :inline="true" :model="filterForm" class="filter-form">
              <el-form-item label="设备名称/设备编码/所在位置:">
                <el-input v-model="filterForm.query" placeholder="设备名称/设备编码/所在位置"></el-input>
              </el-form-item>
              <el-form-item label="设备状态:" >
                <el-select v-model="filterForm.status" placeholder="设备状态" style="width: 100px;" :teleported="false">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="在线" value="T"></el-option>
                  <el-option label="离线" value="F"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="安装时间:">
                <el-date-picker
                  v-model="filterForm.installDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :teleported="false">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>查询</el-button>
                <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons" v-privilege="'device:add'">
            <el-button type="primary" @click="handleAddDevice"><el-icon><Plus /></el-icon>添加设备</el-button>
            <!-- <el-button @click="handleSetStatus"><el-icon><Setting /></el-icon>设置状态</el-button> -->
            <!-- <el-button @click="handleImportData"><el-icon><Download /></el-icon>导入数据</el-button> -->
            <el-button @click="handleExportData"><el-icon><Upload /></el-icon>导出数据</el-button>
          </div>

          <!-- Table Section -->
          <div class="table-container">
            <el-table :data="tableData" style="width: 100%"  v-loading="loading">
            
              <el-table-column label="序号" width="60">
                <template #default="scope">
                  {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column prop="deviceName" label="设备名称" width="200" />
              <el-table-column prop="deviceCode" label="设备编号" width="250" />
              <el-table-column prop="reservoirName" label="所属区域" />
              <el-table-column prop="lonLat" label="位置坐标" width="180"  />
              <el-table-column prop="installTime" label="安装时间" />
              <el-table-column prop="status" label="设备状态" width="100">
                <template #default="scope">
                  <span :class="['status-dot', scope.row.status === 'T' ? 'status-online' : 'status-offline']"></span>
                  {{ scope.row.status === 'T' ? '在线' : '离线' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="320">
                <template #default="scope">
                  <el-button link type="primary"   @click="handleView(scope.row)">查看</el-button>
                  <el-button link type="primary"   @click="handleEdit(scope.row)" v-privilege="'device:edit'">编辑</el-button>
                  <el-button link type="danger"   @click="handleDelete(scope.row)" v-privilege="'device:delete'">删除</el-button>
                  <!-- <el-button link type="primary"   @click="handleMonitorData(scope.row)">监测数据</el-button> -->
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
          </div>

          <!-- Pagination -->
 
        </div>
      </div>
    </div>

    <!-- Add Device Dialog -->
    <AddDeviceDialog
      v-model:visible="showAddDialog"
      @confirm="handleAddDeviceConfirm"
    />

    <!-- View Device Dialog -->
    <ViewDeviceDialog
      v-model:visible="showViewDialog"
      :device-id="currentDeviceId"
    />

    <!-- Edit Device Dialog -->
    <EditDeviceDialog
      v-model:visible="showEditDialog"
      :device-id="currentDeviceId"
      @success="handleEditDeviceSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDatePicker, ElButton, ElTable, ElTableColumn, ElPagination, ElIcon, ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus, Setting, Download, Upload } from '@element-plus/icons-vue';
import AddDeviceDialog from './components/AddDeviceDialog.vue';
import ViewDeviceDialog from './components/ViewDeviceDialog.vue';
import EditDeviceDialog from './components/EditDeviceDialog.vue';
import { getDeviceManagementPage, deleteDevice, exportDeviceData } from '@/api/device';
import { useRouter } from 'vue-router';
import { useStore } from '@/store/pinia';

interface Device {
  id: string;
  deviceName: string;
  deviceCode: string;
  reservoirName: string;
  lonLat: string;
  installTime: string;
  status: 'T' | 'F';
  isActive: 'T' | 'F';
  deviceCategory: string | null;
  remarks: string;
  reservoirManagementNo?: string;
}

const filterForm = reactive({
  query: '',
  status: '',
  installDateRange: null as any,
});

// 监测类型相关
const categoryOptions = ref([
  { value: 'env', label: '环境监测' },
  { value: 'stress', label: '应力监测' },
  { value: 'displacement', label: '位移监测' },
  { value: 'pressure', label: '渗压监测' },
  { value: 'seepage', label: '渗流监测' },
  {value:"safemvs",label:'安防监测'},
   { value: 'gate', label: '闸门管理' },
   { value: 'gateStation', label: '闸站管理' },
]);

const activeCategory = ref(''); // 当前选中的监测类型

const selectedItems = ref<Device[]>([]);

// Dialog 相关状态
const showAddDialog = ref(false);
const showViewDialog = ref(false);
const showEditDialog = ref(false);
const currentDeviceId = ref('');

// 真实数据相关变量
const tableData = ref<Device[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const router = useRouter();
const store = useStore();

// 获取设备列表数据
const getDeviceList = async () => {
  try {
    loading.value = true;
    
    const requestData: any = {
      page: currentPage.value,
      limit: pageSize.value
    };

    // 添加搜索条件
    if (filterForm.query) {
      requestData.key = filterForm.query;
    }
    if (filterForm.status) {
      requestData.status = filterForm.status;
    }
    if (filterForm.installDateRange && filterForm.installDateRange[0] && filterForm.installDateRange[1]) {
      requestData.installStartTime = filterForm.installDateRange[0] + ' 00:00:00';
      requestData.installEndTime = filterForm.installDateRange[1] + ' 23:59:59';
    }
    // 添加设备分类参数
    if (activeCategory.value) {
      requestData.mcsType = activeCategory.value;
    }

    const response = await getDeviceManagementPage(requestData);
    
    // 根据request.ts，返回的结果已经是res.data
    tableData.value = (response as any).list;
    total.value = (response as any).totalCount;
    
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  currentPage.value = 1;
  getDeviceList();
};

const handleReset = () => {
  filterForm.query = '';
  filterForm.status = '';
  filterForm.installDateRange = null;
  currentPage.value = 1;
  getDeviceList();
};

const handleAddDevice = () => {
  showAddDialog.value = true;
};

const handleSetStatus = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请至少选择一项设备进行状态设置');
    return;
  }
  ElMessage.info(`触发设置 ${selectedItems.value.length} 个设备的状态操作`);
};

const handleImportData = () => {
  ElMessage.info('触发导入数据操作');
};

const handleExportData = async () => {
  try {
    // 显示导出进度提示
    ElMessage.info('正在导出数据，请稍候...');
    
    // 构建导出参数，与查询参数保持一致
    const exportParams: any = {
      page: 1,
      limit: 99999 // 导出所有数据
    };

    // 添加搜索条件
    if (filterForm.query) {
      exportParams.key = filterForm.query;
    } else {
      exportParams.key = '';
    }
    
    if (filterForm.status) {
      exportParams.status = filterForm.status;
    } else {
      exportParams.status = '';
    }
    
    if (filterForm.installDateRange && filterForm.installDateRange[0] && filterForm.installDateRange[1]) {
      exportParams.installStartTime = filterForm.installDateRange[0] + ' 00:00:00';
      exportParams.installEndTime = filterForm.installDateRange[1] + ' 23:59:59';
    } else {
      exportParams.installStartTime = '';
      exportParams.installEndTime = '';
    }
    
    // 添加设备分类参数
    if (activeCategory.value) {
      exportParams.deviceCategory = activeCategory.value;
    } else {
      exportParams.deviceCategory = ''; // 全部类型时为空字符串
    }

    console.log('导出参数:', exportParams);

    // 调用导出接口
    const response = await exportDeviceData(exportParams);
    
    // 处理二进制流下载 - request.ts已经正确处理了blob响应，直接使用
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const currentDate = new Date().toISOString().slice(0, 10);
    const categoryName = activeCategory.value ? 
      categoryOptions.value.find(c => c.value === activeCategory.value)?.label || '设备' : 
      '全部设备';
    link.download = `${categoryName}数据导出_${currentDate}.xlsx`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('数据导出成功');
    
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败，请稍后重试');
  }
};

const handleSelectionChange = (val: Device[]) => {
  selectedItems.value = val;
};

const handleView = (row: Device) => {
  showViewDialog.value = true;
  currentDeviceId.value = row.id;
};

const handleEdit = (row: Device) => {
  showEditDialog.value = true;
  currentDeviceId.value = row.id;
};

const handleDelete = (row: Device) => {
  ElMessageBox.confirm(`确定删除设备 ${row.deviceName} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    lockScroll: false,
  }).then(() => {
    // 这里应该调用删除API
    deleteDevice({ids:[row.id]}).then(()=>{
      ElMessage.success(`删除设备 ${row.deviceName} 成功`);
      //等待删除后再查询
      getDeviceList();
    });


    // getDeviceList(); // 重新加载数据
  }).catch(() => {
    ElMessage.info('取消删除');
  });
};

const handleMonitorData = (row: Device) => {
  // 检查数据完整性
  if (!row.deviceCategory || !row.reservoirManagementNo) {
    ElMessage.error('数据不完整无法跳转，缺少设备类型或所属水库信息');
    return;
  }

  console.log('=== 开始跳转监测数据页面 ===');
  console.log('设备信息:', row);
  console.log('设备类型:', row.deviceCategory);
  console.log('水库ID:', row.reservoirManagementId);

  // 设备类型与路由的映射关系
  const deviceRouteMap: { [key: string]: string } = {
    'env': 'environment',        // 环境监测
    'stress': 'stress',          // 应力监测  
    'displacement': 'displacement', // 位移监测
    'pressure': 'seepage',       // 渗压监测 -> seepage页面
    'seepage': 'flow'            // 渗流监测 -> flow页面
  };

  const targetRoute = deviceRouteMap[row.mcsType];
  
  if (!targetRoute) {
    ElMessage.error(`未知的设备类型: ${row.mcsType}`);
    return;
  }

  console.log('目标路由:', targetRoute);

  // 使用store方法设置选中的水库节点
  console.log('设置选中节点到store...');
  store.setSelectedDamNodeById(row.reservoirManagementNo, row.reservoirName);
  
  // 验证store设置是否成功
  console.log('Store中当前选中节点:', store.selectedDamNode);

  // 跳转到对应的监测页面
  console.log('开始页面跳转...');
  router.push(`/main/gate/${targetRoute}`).then(() => {
    console.log('页面跳转成功');
    ElMessage.success(`正在跳转到${row.deviceName}的监测数据页面`);
  }).catch((error) => {
    console.error('页面跳转失败:', error);
    ElMessage.error('页面跳转失败');
  });
};

const handleSetThreshold = (row: Device) => {
  ElMessage.info(`设置 ${row.deviceName} 的阈值`);
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  getDeviceList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getDeviceList();
};

const handleAddDeviceConfirm = (deviceData: any) => {
  console.log('新设备数据:', deviceData);
  getDeviceList(); // 重新加载数据
};

const handleEditDeviceSuccess = () => {
  getDeviceList(); // 重新加载数据
};

const handleCategoryChange = (value: string) => {
  activeCategory.value = value;
  currentPage.value = 1;
  getDeviceList();
};

// 页面加载时获取数据
onMounted(() => {
  getDeviceList();
});

</script>

<style scoped>
.device-management-container {
  /* padding: 20px; */
  background-color: #f5f7fa;
  height: 100%;
}

.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.category-sidebar {
  width: 200px;
  min-width: 200px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  height: 100%;
}

.category-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.category-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-btn {
  width: 100%;
  justify-content: center;
  text-align: center;
  margin-left: 0 !important; /* 强制移除Element Plus默认的margin-left */

}

/* 重置Element Plus按钮默认间距 */
.category-buttons .el-button + .el-button {
  margin-left: 0 !important;
}

.content-main {
  flex: 1;
  width: calc(100% - 240px);
  min-width: 0;
  height: 100%;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.filter-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-form .el-form-item {
  margin-bottom: 0; /* Align items better in one line */
}

.action-buttons {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.action-buttons .el-button {
  margin-right: 10px;
  margin-left: 0 !important; /* 移除默认间距 */
}

/* 重置action-buttons中的按钮间距 */
.action-buttons .el-button + .el-button {
  margin-left: 10px !important; /* 只保留右边距 */
}

/* 统一按钮样式 */
.action-buttons .el-button {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.action-buttons .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.action-buttons .el-button:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.action-buttons .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}

/* 表格容器 */
.table-container {
  flex: 1;
  margin-bottom: 20px;
  overflow: hidden;
}

.el-table {
  border-radius: 0;
  box-shadow: none;
  border: 1px solid #ebeef5;
  table-layout: fixed;
  width: 100% !important;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-online {
  background-color: #67c23a; /* Element Plus Success Color */
}

.status-offline {
  background-color: #909399; /* Element Plus Info Color */
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-right: 35px;
  border-top: 1px solid #f0f0f0;
}

.el-table th {
  background-color: #fafafa !important; /* Light grey for table header */
}
</style>