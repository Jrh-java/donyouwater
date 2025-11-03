<template>
  <div class="alert-page-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <el-icon :size="40" color="#409EFF"><Bell /></el-icon>
            <div class="card-text">
              <div>今日告警总数</div>
              <div class="count">0 条</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <el-icon :size="40" color="#409EFF"><Clock /></el-icon>
            <div class="card-text">
              <div>历史告警总数</div>
              <div class="count">0 条</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <el-icon :size="40" color="#E6A23C"><Warning /></el-icon>
            <div class="card-text">
              <div>I 级告警总数</div>
              <div class="count">0 条</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <el-icon :size="40" color="#F56C6C"><WarningFilled /></el-icon>
            <div class="card-text">
              <div>II 级告警总数</div>
              <div class="count">0 条</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>



    <!-- 表格区域-->
    <el-card shadow="never" class="table-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="告警时间:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            :teleported="false"
            range-separator="-"
            start-placeholder="请选择"
            end-placeholder="请选择"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item label="所属大坝:">
          <el-select v-model="filterForm.dam" placeholder="全部" style="width: 100px;" :teleported="false">
            <el-option label="全部" value="all" />
            <el-option label="高家水库大坝" value="gaojia" />
            <el-option label="霞洋水库大坝" value="xiayang" />
            <el-option label="严洋水库大坝" value="yanyang" />
            <el-option label="尚家坑水库大坝" value="shangjiakeng" />
            <el-option label="肖家坑水库大坝" value="xiaojiakeng" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型:">
          <el-select v-model="filterForm.alertType" placeholder="全部" style="width: 100px;" :teleported="false">
            <el-option label="全部" value="all" />
            <el-option label="类型A" value="typeA" />
            <el-option label="类型B" value="typeB" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态:">
          <el-select v-model="filterForm.status" placeholder="全部" style="width: 100px;" :teleported="false">
            <el-option label="全部" value="all" />
            <el-option label="未处理" value="unprocessed" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button @click="onExport"><el-icon><Download /></el-icon>导出</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" style="width: 100%">
        <template #empty>
          <div class="empty-data">
            <el-empty description="暂无数据" />
          </div>
        </template>
        <el-table-column prop="id" label="序号" />
        <el-table-column prop="alertType" label="告警类型" />
        <el-table-column prop="source" label="告警来源" />
        <el-table-column prop="dam" label="所属大坝" />
        <el-table-column prop="longitude" label="经度" />
        <el-table-column prop="latitude" label="纬度" />
        <el-table-column prop="altitude" label="高度" />
        <el-table-column prop="level" label="告警级别">
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.level)">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="告警时间" width="180" />
        <el-table-column prop="info" label="告警信息" />
        <el-table-column prop="status" label="处理状态">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="primary" link v-if="scope.row.status === '未处理'" @click="handleProcess(scope.row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination-container"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems"
      />
    </el-card>

    <!-- 添加弹窗组件 -->
    <AlertProcessModal ref="alertProcessModal" @confirm="onProcessConfirm" />
    <AlertDetailModal ref="alertDetailModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Bell, Clock, Warning, WarningFilled, Download } from '@element-plus/icons-vue';
import AlertProcessModal from './components/alert-process-modal.vue';
import AlertDetailModal from './components/alert-detail-modal.vue';

// 定义告警数据类型
interface AlertItem {
  id: number;
  alertType: string;
  source: string;
  dam: string;
  longitude: string;
  latitude: string;
  altitude: string;
  level: string;
  time: string;
  info: string;
  status: string;
}

const filterForm = reactive({
  dateRange: ['', ''],
  dam: 'all',
  alertType: 'all',
  status: 'all',
});

const tableData = ref<AlertItem[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 弹窗引用
const alertProcessModal = ref();
const alertDetailModal = ref();

const onSearch = () => {
  ElMessage.info('执行查询操作');
  // 实际应用中会根据 filterForm 的值请求后端数据
};

const onReset = () => {
  filterForm.dateRange = ['', ''];
  filterForm.dam = 'all';
  filterForm.alertType = 'all';
  filterForm.status = 'all';
  ElMessage.info('执行重置操作');
};

const onExport = () => {
  ElMessage.success('导出成功');
  // 实际应用中会根据当前筛选条件导出数据
};

const getLevelTagType = (level: string) => {
  if (level === 'I级告警') return 'warning'; // 橙色
  if (level === 'II级告警') return 'danger'; // 红色
  return '';
};

const getStatusTagType = (status: string) => {
  if (status === '未处理') return 'warning'; // 橙色
  if (status === '已处理') return 'success'; // 绿色
  if (status === '已忽略') return 'info';    // 灰色
  return '';
};

const handleView = (row: any) => {
  // 打开告警详情弹窗
  alertDetailModal.value.showModal(row);
};

const handleProcess = (row: any) => {
  // 打开告警处理弹窗
  alertProcessModal.value.showModal(row);
};

const onProcessConfirm = (data: any) => {
  // 处理完成后更新表格数据
  const item = tableData.value.find(i => i.id === data.id);
  if (item) {
    item.status = data.processResult === 'processed' ? '已处理' : '已忽略';
  }
  ElMessage.success('告警处理成功');
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  // 重新获取数据
  ElMessage.info(`每页 ${val} 条`);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 重新获取数据
  ElMessage.info(`当前页: ${val}`);
};

</script>

<style scoped>
.alert-page-container {
  padding: 20px;
  background-color: #f0f2f5; /* 页面背景色，与图片类似 */
}

.summary-cards .el-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-content .el-icon {
  margin-right: 15px;
}

.card-text div:first-child {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.card-text .count {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-bottom: 25px; /* 减少表单项间距 */
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 根据图片调整标签颜色 */
:deep(.el-tag--warning) { /* I级告警, 未处理 */
  background-color: #fdf6ec !important;
  border-color: #faecd8 !important;
  color: #e6a23c !important;
}

:deep(.el-tag--danger) { /* II级告警 */
 background-color: #fef0f0 !important;
  border-color: #fde2e2 !important;
  color: #f56c6c !important;
}

:deep(.el-tag--success) { /* 已处理 */
  background-color: #f0f9eb !important;
  border-color: #e1f3d8 !important;
  color: #67c23a !important;
}

:deep(.el-tag--info) { /* 已忽略 */
  background-color: #f4f4f5 !important;
  border-color: #e9e9eb !important;
  color: #909399 !important;
}
</style>