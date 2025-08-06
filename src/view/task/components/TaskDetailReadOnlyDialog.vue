<template>
  <el-dialog
    title="任务详情"
    v-model="visible"
    width="600px"
    :lock-scroll="false"
    @close="handleClose"
  >
    <el-form
      :model="taskForm"
      label-width="100px"
      v-loading="loading"
    >
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.taskName" readonly />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="taskForm.taskType" disabled>
            <el-option label="巡检" value="1" />
            <el-option label="维护" value="2" />
            <el-option label="检修" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行人员">
          <el-select v-model="taskForm.executors" multiple disabled>
            <!-- 这里需要根据实际的人员数据来填充选项 -->
          </el-select>
        </el-form-item>
        <el-form-item label="审批人员">
          <el-input v-model="taskForm.approveUserName" readonly />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="taskForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            :teleported="false"
            disabled
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="taskForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            :teleported="false"
            disabled
          />
        </el-form-item>
        <el-form-item label="任务周期">
          <el-select v-model="taskForm.taskCycle" :teleported="false" disabled>
            <el-option label="每天" value="1" />
            <el-option label="每周" value="2" />
            <el-option label="每月" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒方式">
          <el-select v-model="taskForm.remindType" :teleported="false" disabled>
            <el-option label="短信" value="1" />
            <el-option label="邮件" value="2" />
            <el-option label="系统通知" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检路线">
          <el-select v-model="taskForm.routeManagementId" disabled>
            <el-option
              v-for="route in routeOptions"
              :key="route.value"
              :label="route.label"
              :value="route.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="taskForm.desc"
            type="textarea"
            :rows="4"
            readonly
          />
        </el-form-item>
        <el-form-item label="附件">
          <div v-if="taskForm.attachments.length > 0">
            <div
              v-for="(file, index) in taskForm.attachments"
              :key="index"
              class="attachment-item"
            >
              <el-link :href="file.url" target="_blank">
                {{ file.name }}
              </el-link>
            </div>
          </div>
          <div v-else class="no-attachments">
            暂无附件
          </div>
        </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getTaskDetail } from '@/api/task'
import { getPatrolRoutePage } from '@/api/patrol'

// Props
interface Props {
  modelValue: boolean
  taskId?: string | number
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  taskId: ''
})

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const routeOptions = ref<Array<{ label: string; value: string }>>([])

// 定义附件类型
interface AttachmentFile {
  name: string
  url: string
  size: number
  objectName: string
  uid?: string
}

// 任务详情数据
const taskForm = reactive({
  id: '',
  taskName: '',
  taskType: '',
  executors: [] as string[],
  approveUserName: '',
  startTime: '',
  endTime: '',
  taskCycle: '',
  remindCycle: '',
  remindType: '',
  routeManagementId: '',
  desc: '',
  attachments: [] as AttachmentFile[]
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})



// 监听任务ID变化
watch(() => props.taskId, async (newTaskId) => {
  if (newTaskId && props.modelValue) {
    await loadTaskDetail()
  }
}, { immediate: true })

watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.taskId) {
    await loadTaskDetail()
  }
})

// 方法
const loadTaskDetail = async () => {
  if (!props.taskId) return
  
  loading.value = true
  try {
    const taskDetailData = await getTaskDetail(props.taskId.toString())
    Object.assign(taskForm, {
      taskName: taskDetailData.taskName,
      taskType: taskDetailData.taskType,
      executors: taskDetailData.taskExcutorInfoVOS || [],
      approveUserName: taskDetailData.approveUser || '',
      startTime: taskDetailData.startTime,
      endTime: taskDetailData.endTime,
      taskCycle: taskDetailData.taskCycle,
      remindCycle: taskDetailData.remindCycle,
      remindType: taskDetailData.remindType,
      routeManagementId: taskDetailData.routeManagementId,
      desc: taskDetailData.desc || '',
      attachments: (taskDetailData as any).attachmentInfoVOS || []
    })
    
    // 加载路线信息
    await loadRouteOptions()
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

const loadRouteOptions = async () => {
  try {
    const routeData = await getPatrolRoutePage({
      page: 1,
      limit: 1000,
      status: 'T'
    })
    routeOptions.value = routeData.list.map((route: any) => ({
      label: route.routeName,
      value: route.id
    }))
  } catch (error) {
    console.error('获取路线数据失败:', error)
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
}
</style>