<template>
  <div class="task-list-container">
    <!-- 状态标签页 -->
    <div class="status-tabs">
      <el-tabs v-model="activeStatus" @tab-click="handleStatusChange">
        <el-tab-pane :label="`全部 (${statusCounts.all})`" name="all"></el-tab-pane>
        <el-tab-pane :label="`待处理 (${statusCounts.pending})`" name="pending"></el-tab-pane>
        <el-tab-pane :label="`进行中 (${statusCounts.processing})`" name="processing"></el-tab-pane>
        <el-tab-pane :label="`已完成 (${statusCounts.completed})`" name="completed"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务名称/编号:">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="任务名称/编号"
            style="width: 200px;"
            clearable
          />
        </el-form-item>
        <el-form-item label="任务类型:">
          <el-select 
            v-model="searchForm.taskType" 
            placeholder="全部类型"
            style="width: 150px;"
            :teleported="false"
            clearable
          >
            <el-option label="全部类型" value=""></el-option>
            <el-option label="日常巡检" value="1"></el-option>
            <el-option label="年度巡检" value="2"></el-option>
            <el-option label="特别巡检" value="3"></el-option>
            <el-option label="维修" value="4"></el-option>
            <el-option label="保养" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态:">
          <el-select 
            v-model="searchForm.status" 
            placeholder="全部状态"
            style="width: 150px;"
            :teleported="false"
            clearable
          >
            <el-option label="全部状态" value=""></el-option>
            <el-option label="待处理" value="1"></el-option>
            <el-option label="进行中" value="2"></el-option>
            <el-option label="已完成" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间:">
          <el-date-picker
            v-model="searchForm.executionTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
            :teleported="false"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="primary" @click="handleAddTask">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 任务表格 -->
    <div class="table-section">
      <el-table 
        :data="filteredTaskList" 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="taskName" label="任务名称"   />
        <el-table-column prop="taskNum" label="任务编号"  />
        <el-table-column prop="taskType" label="任务类型" >
          <template #default="scope">
            {{ getTaskTypeLabel(scope.row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column label="执行人员" width="120">
          <template #default="{ row }">
            <span>{{ row.excutorName }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="审批人员" width="120">
          <template #default="{ row }">
            <span>{{ row.approveUserName || '-' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="执行时间">
          <template #default="scope">
            {{ scope.row.startTime }} ~ {{ scope.row.endTime }}
          </template>
        </el-table-column>
        <el-table-column label="任务状态"  width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.completionProgress)"
              :style="{ color: getStatusColor(row.completionProgress), backgroundColor: 'transparent', border: 'none' }"
              effect="plain"
            >
              {{ getStatusLabel(row.completionProgress) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作"  fixed="right">
          <template #default="scope">
            <el-button link type="primary"   @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger"   @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 任务表单弹窗 -->
    <TaskFormDialog
      v-model="showTaskDialog"
      :is-edit="isEdit"
      :edit-data="editTaskData"
      @confirm="handleTaskConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import TaskFormDialog from './components/TaskFormDialog.vue'
import { getTaskPage, deleteTask, type Task, type TaskQuery } from '@/api/task'

// 响应式数据
const activeStatus = ref('all')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showTaskDialog = ref(false)
const isEdit = ref(false)
const editTaskData = ref({})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  taskType: '',
  status: '',
  executionTime: null as any
})

// 状态统计
const statusCounts = reactive({
  all: 0,
  pending: 0,
  processing: 0,
  completed: 0
})

// 任务列表数据
const taskList = ref<Task[]>([])

// 计算属性
const filteredTaskList = computed(() => {
  if (activeStatus.value === 'all') {
    return taskList.value
  }
  const statusMap: Record<string, string> = {
    pending: '1',
    processing: '2', 
    completed: '3'
  }
  const targetStatus = statusMap[activeStatus.value]
  return taskList.value.filter(task => task.completionProgress === targetStatus)
})

// 方法
const getTaskTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    '1': '日常巡检',
    '2': '年度巡检', 
    '3': '特别巡检',
    '4': '维修',
    '5': '保养'
  }
  return typeMap[type] || type
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    '1': '待处理',
    '2': '进行中',
    '3': '已完成'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    '1': 'warning',
    '2': 'primary', 
    '3': 'success'
  }
  return typeMap[status] || 'info'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '1': '#E6A23C',  // 待处理 - 橙色
    '2': '#409EFF',  // 进行中 - 蓝色
    '3': '#67C23A'   // 已完成 - 绿色
  }
  return colorMap[status] || '#909399'
}

const handleStatusChange = (tab: any) => {
  activeStatus.value = tab.props.name
  currentPage.value = 1
  loadTaskList()
}

const handleSearch = () => {
  currentPage.value = 1
  loadTaskList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    taskType: '',
    status: '',
    executionTime: null
  })
  currentPage.value = 1
  loadTaskList()
}

const handleAddTask = () => {
  isEdit.value = false
  editTaskData.value = {}
  showTaskDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  // 填充表单数据
  editTaskData.value = { ...row }
  showTaskDialog.value = true
}

const handleDelete = (row: Task) => {
  ElMessageBox.confirm(`确定删除任务 ${row.taskName} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    lockScroll: false,
  }).then(async () => {
    try {
      await deleteTask([row.id!])
      ElMessage.success(`删除任务 ${row.taskName} 成功`)
      loadTaskList()
    } catch (error) {
      ElMessage.error('删除任务失败')
    }
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadTaskList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadTaskList()
}

const handleTaskConfirm = (data: any) => {
  console.log('任务确认:', data)
  loadTaskList()
}

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params: TaskQuery = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    // 添加搜索条件
    if (searchForm.keyword) {
      params.key = searchForm.keyword
    }
    if (searchForm.taskType) {
      params.taskType = searchForm.taskType
    }
    if (searchForm.status) {
      params.completionProgress = searchForm.status
    }
    if (searchForm.executionTime && searchForm.executionTime.length === 2) {
      params.startTime = searchForm.executionTime[0]
      params.endTime = searchForm.executionTime[1]
    }
    
    const response = await getTaskPage(params)
    taskList.value = response.list
    total.value = response.totalCount
    
    // 更新状态统计
    updateStatusCounts()
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 更新状态统计
const updateStatusCounts = () => {
  statusCounts.all = taskList.value.length
  statusCounts.pending = taskList.value.filter(task => task.completionProgress === '1').length
  statusCounts.processing = taskList.value.filter(task => task.completionProgress === '2').length
  statusCounts.completed = taskList.value.filter(task => task.completionProgress === '3').length
}

onMounted(() => {
  loadTaskList()
})
</script>

<style scoped>
.task-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.status-tabs {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Element Plus 自定义样式 */
:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 20px;
}

:deep(.el-table) {
  border-radius: 0;
  box-shadow: none;
  border: 1px solid #ebeef5;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

:deep(.el-tag) {
  border: none;
  font-size: 12px;
}
</style>