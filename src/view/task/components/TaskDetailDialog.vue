<template>
  <el-dialog
    title="任务详情"
    v-model="visible"
    width="680px"
    :lock-scroll="false"
    class="task-detail-dialog"
  >
    <div class="task-detail-content">
      <!-- 任务类型和名称 -->
      <div class="task-header">
        <div class="task-type-icon">
          <el-icon><Folder /></el-icon>
          <span>{{ getTaskTypeLabel(taskDetail.taskType) }}</span>
        </div>
        <div class="task-name">{{ taskDetail.taskName }}</div>
        <div class="task-status">
          <el-button 
            :type="taskDetail.status === 'completed' ? 'success' : 'default'"
            size="small"
            round
          >
            {{ taskDetail.status === 'completed' ? '已完成' : '已完成' }}
          </el-button>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="task-time">
        <div class="time-date">{{ formatDate(taskDetail.startTime) }}</div>
        <div class="time-range">
          <span class="start-time">{{ formatTime(taskDetail.startTime) }}</span>
          <span class="separator">-</span>
          <span class="end-time">{{ formatTime(taskDetail.endTime) }}</span>
        </div>
        <div class="time-labels">
          <span class="label">开始时间</span>
          <span class="label">结束时间</span>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="task-info">
        <div class="info-item">
          <div class="info-label">
            <el-icon><User /></el-icon>
            <span>任务编码</span>
          </div>
          <div class="info-value">{{ taskDetail.taskNumber }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <el-icon><User /></el-icon>
            <span>执行人员</span>
          </div>
          <div class="info-value">{{ taskDetail.executor }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <el-icon><User /></el-icon>
            <span>审批人员</span>
          </div>
          <div class="info-value">{{ taskDetail.approveUserName || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <el-icon><LocationFilled /></el-icon>
            <span>任务地点</span>
          </div>
          <div class="info-value">{{ taskDetail.location || '东莞水库' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <el-icon><Clock /></el-icon>
            <span>任务用时</span>
          </div>
          <div class="info-value">{{ taskDetail.duration || '115分钟' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <el-icon><Document /></el-icon>
            <span>任务描述</span>
          </div>
          <div class="info-value description">
            {{ taskDetail.description || '任务描述' }}
          </div>
        </div>
      </div>

      <!-- 附件 -->
      <div class="task-attachments">
        <div class="attachments-header">
          <el-icon><Paperclip /></el-icon>
          <span>附件</span>
        </div>
        <div class="attachments-list">
          <div 
            v-for="(attachment, index) in taskDetail.attachments || defaultAttachments" 
            :key="index"
            class="attachment-item"
          >
            <div class="attachment-info">
              <el-icon><Document /></el-icon>
              <div class="attachment-details">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-meta">{{ attachment.date }} {{ attachment.uploader }}</div>
              </div>
            </div>
            <div class="attachment-actions">
              <el-button link type="primary" size="small">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Folder, 
  User, 
  LocationFilled, 
  Clock, 
  Document, 
  Paperclip,
  Download
} from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: boolean
  taskDetail: any
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 默认附件数据
const defaultAttachments = [
  {
    name: '大坝巡查图片',
    date: '2025-07-01 11:43:23',
    uploader: '张明明'
  },
  {
    name: '大坝巡查图片',
    date: '2025-07-01 11:43:23',
    uploader: '张明明'
  },
  {
    name: '大坝巡查图片',
    date: '2025-07-01 11:43:23',
    uploader: '张明明'
  }
]

// 方法
const getTaskTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    daily: '日常巡查',
    annual: '年度巡查', 
    special: '特殊巡查',
    maintenance: '维护巡检',
    upkeep: '保养巡检'
  }
  return typeMap[type] || '任务类型'
}

const formatDate = (dateTime: string | Date) => {
  if (!dateTime) return '07月01日 周三'
  const date = new Date(dateTime)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

const formatTime = (dateTime: string | Date) => {
  if (!dateTime) return '08:30'
  const date = new Date(dateTime)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.task-detail-dialog {
  --el-dialog-padding-primary: 0;
}

.task-detail-content {
  padding: 0;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.task-type-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.task-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  flex: 1;
  text-align: center;
}

.task-status .el-button {
  border: none;
  background: #f5f5f5;
  color: #666;
}

.task-time {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.time-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.time-range {
  font-size: 32px;
  font-weight: 300;
  color: #333;
  margin-bottom: 12px;
}

.separator {
  margin: 0 16px;
}

.time-labels {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.time-labels .label {
  font-size: 12px;
  color: #999;
}

.task-info {
  padding: 24px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  font-size: 14px;
  flex: 1;
}

.info-value.description {
  line-height: 1.6;
}

.task-attachments {
  padding: 0 24px 24px;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.attachment-item:last-child {
  margin-bottom: 0;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attachment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-name {
  font-size: 14px;
  color: #333;
}

.attachment-meta {
  font-size: 12px;
  color: #999;
}

.attachment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-dialog__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 0;
}
</style>