<template>
  <div class="task-board-container">
    <!-- 头部操作栏 -->
    <div class="board-header">
      <div class="header-left">
        <!-- <el-button-group>
          <el-button :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">月</el-button>
          <el-button :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">周</el-button>
        </el-button-group> -->
        
        <div class="search-controls">
          <el-input 
            v-model="searchForm.keyword"
            placeholder="输入任务关键词"
            style="width: 200px;"
            clearable
          />
          <el-button 
            v-if="searchForm.keyword || searchForm.taskType" 
            @click="handleResetSearch"
            style="margin-left: 8px;"
          >
            重置
          </el-button>
        </div>
      </div>

      <div class="header-center">
        <el-button 
          @click="previousPeriod" 
          :icon="ArrowLeft" 
          circle 
          size="small"
        />
        <span class="current-period">{{ currentPeriodText }}</span>
        <el-button 
          @click="nextPeriod" 
          :icon="ArrowRight" 
          circle 
          size="small"
        />
      </div>

      <div class="header-right">
        <el-select 
          v-model="searchForm.taskType" 
          placeholder="任务类型"
          style="width: 120px;"
          clearable
          :teleported="false"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="日常" value="daily"></el-option>
          <el-option label="年度" value="annual"></el-option>
          <el-option label="特殊" value="special"></el-option>
          <el-option label="维护" value="maintenance"></el-option>
          <el-option label="保养" value="upkeep"></el-option>
        </el-select>
        
        <el-button type="primary" @click="handleAddTask">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </div>

    <!-- 日历视图 -->
    <div class="calendar-container" v-loading="loading">
      <!-- 星期标题 -->
      <div class="calendar-header">
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="week-day"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'selected': day.isSelected
          }"
        >
          <!-- 日期数字 -->
          <div class="day-number">{{ day.date }}</div>
          
          <!-- 任务列表 -->
          <div class="day-tasks" v-if="day.tasks && day.tasks.length > 0">
            <div 
              v-for="(task, taskIndex) in day.tasks" 
              :key="taskIndex"
              class="task-item"
              :class="`task-${task.taskType}`"
              @click="handleTaskClick(task)"
            >
              <div class="task-content">
                <div class="task-name">{{ task.taskName }}</div>
                <div class="task-time">{{ getTaskTimeRange(task) }}</div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="day.isCurrentMonth" class="day-empty">
            <!-- 当月日期才显示提示文本 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 任务表单弹窗 -->
    <TaskFormDialog
      v-model="showTaskDialog"
      :is-edit="isEdit"
      :edit-data="editTaskData"
      @confirm="handleTaskConfirm"
    />

    <!-- 任务详情弹窗 -->
    <TaskDetailReadOnlyDialog
      v-model="showDetailDialog"
      :task-id="selectedTaskId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, ArrowRight, Plus } from '@element-plus/icons-vue'
import TaskFormDialog from './components/TaskFormDialog.vue'
import TaskDetailReadOnlyDialog from './components/TaskDetailReadOnlyDialog.vue'
import { getTaskPage, type Task } from '@/api/task'

// 响应式数据
const viewMode = ref('month')
const currentDate = ref(new Date())
const showTaskDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const editTaskData = ref({})
const selectedTaskId = ref('')
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  taskType: ''
})

// 星期标题
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 任务数据
const tasks = ref<Task[]>([])

// 计算属性
const currentPeriodText = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${String(month).padStart(2, '0')}月`
})

// 筛选后的任务列表
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // 关键词筛选
    if (searchForm.keyword && !task.taskName.includes(searchForm.keyword) && !(task.id && task.id.toString().includes(searchForm.keyword))) {
      return false
    }
    // 任务类型筛选
    if (searchForm.taskType && task.taskType !== searchForm.taskType) {
      return false
    }
    return true
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取当月第一天是星期几（0=周日，调整为1=周一）
  let firstDayWeek = firstDay.getDay()
  firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek
  
  const days = []
  
  // 添加上月的日期（补齐第一周）
  for (let i = firstDayWeek - 1; i > 0; i--) {
    const date = new Date(year, month, 1 - i)
    days.push({
      date: date.getDate(),
      fullDate: date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: false,
      tasks: getTasksForDate(date)
    })
  }
  
  // 添加当月的日期
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const fullDate = new Date(year, month, date)
    days.push({
      date,
      fullDate,
      isCurrentMonth: true,
      isToday: isSameDay(fullDate, today),
      isSelected: false,
      tasks: getTasksForDate(fullDate)
    })
  }
  
  // 添加下月的日期（补齐最后一周）
  const remainingDays = 42 - days.length // 6行 × 7列
  for (let date = 1; date <= remainingDays; date++) {
    const fullDate = new Date(year, month + 1, date)
    days.push({
      date,
      fullDate,
      isCurrentMonth: false,
      isToday: isSameDay(fullDate, today),
      isSelected: false,
      tasks: getTasksForDate(fullDate)
    })
  }
  
  return days
})

// 工具函数
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const getTasksForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return filteredTasks.value.filter(task => {
    // 根据开始时间判断任务归属的日期
    const taskStartDate = new Date(task.startTime).toISOString().split('T')[0]
    return taskStartDate === dateStr
  })
}

const getTaskTimeRange = (task: any) => {
  const start = new Date(task.startTime)
  const end = new Date(task.endTime)
  return `${formatTime(start)}-${formatTime(end)}`
}

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 事件处理
const previousPeriod = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextPeriod = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const handleAddTask = () => {
  isEdit.value = false
  editTaskData.value = {}
  showTaskDialog.value = true
}

const handleTaskClick = (task: any) => {
  selectedTaskId.value = task.id
  showDetailDialog.value = true
}

const handleTaskConfirm = (data: any) => {
  console.log('任务确认:', data)
  // 重新加载任务数据
  loadTasks()
}

const handleSearch = () => {
  // 搜索已通过computed属性filteredTasks实现
  console.log('搜索条件:', searchForm)
}

const handleResetSearch = () => {
  searchForm.keyword = ''
  searchForm.taskType = ''
}

// 加载任务数据
const loadTasks = async () => {
  loading.value = true
  try {
    const response = await getTaskPage({
      page: 1,
      limit: 9999
    })
    tasks.value = response.list
  } catch (error) {
    console.error('获取任务数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.task-board-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left .el-button-group .el-button {
  border: 1px solid #dcdfe6;
  background: #fff;
}

.header-left .el-button-group .el-button.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-period {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  min-width: 120px;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fafafa;
}

.week-day {
  padding: 12px;
  text-align: center;
  font-weight: 500;
  color: #666;
  border-right: 1px solid #e8e8e8;
}

.week-day:last-child {
  border-right: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 120px);
}

.calendar-day {
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  padding: 8px;
  background: white;
  position: relative;
  overflow: hidden;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.other-month {
  background: #f5f5f5;
  color: #ccc;
}

.calendar-day.today {
  background: #f0f9ff;
}

.calendar-day.today .day-number {
  background: #409eff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.day-tasks {
  max-height: 80px;
  overflow-y: auto;
  gap: 2px;
  display: flex;
  flex-direction: column;
}

.task-item {
  background: #e3f2fd;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 2px;
  border-left: 3px solid #2196f3;
}

.task-item:hover {
  background: #bbdefb;
  transform: translateY(-1px);
}

.task-item.task-daily {
  background: #e8f5e8;
  border-left-color: #4caf50;
}

.task-item.task-annual {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.task-item.task-special {
  background: #fce4ec;
  border-left-color: #e91e63;
}

.task-item.task-maintenance {
  background: #f3e5f5;
  border-left-color: #9c27b0;
}

.task-item.task-upkeep {
  background: #e1f5fe;
  border-left-color: #00bcd4;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-time {
  font-size: 10px;
  color: #666;
  line-height: 1;
}

.day-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #ccc;
  font-size: 12px;
}

/* 滚动条样式 */
.day-tasks::-webkit-scrollbar {
  width: 4px;
}

.day-tasks::-webkit-scrollbar-track {
  background: transparent;
}

.day-tasks::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.day-tasks::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.search-controls {
  display: flex;
  align-items: center;
}
</style>