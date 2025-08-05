<template>
  <el-dialog
    :title="dialogTitle"
    v-model="visible"
    width="600px"
    :lock-scroll="false"
    @close="handleClose"
  >
    <el-form
      ref="taskFormRef"
      :model="taskForm"
      :rules="taskFormRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="taskForm.taskName" placeholder="任务名称" />
          </el-form-item>
        </el-col>

      </el-row>

      <el-form-item label="任务类型" prop="taskType">
        <el-select 
          v-model="taskForm.taskType" 
          placeholder="选择类型"
          style="width: 100%;"
          :teleported="false"
        >
          <el-option label="日常巡检" value="1"></el-option>
          <el-option label="年度巡检" value="2"></el-option>
          <el-option label="特别巡检" value="3"></el-option>
          <el-option label="维修" value="4"></el-option>
          <el-option label="保养" value="5"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="执行人员" prop="executors">
          <el-tree-select
            v-model="taskForm.executors"
            :data="departmentTreeData"
            placeholder="请选择执行人员"
            style="width: 100%"
            multiple
            show-checkbox
            check-strictly
            :teleported="false"
            :loading="employeesLoading"
            node-key="value"
            default-expand-all
            :props="{
              label: 'label',
              children: 'children',
              disabled: 'disabled'
            }"
          />
        </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="taskForm.startTime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%;"
              :teleported="false"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="taskForm.endTime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%;"
              :teleported="false"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="任务周期" prop="cycle">
        <el-select
          v-model="taskForm.cycle"
          placeholder="请选择任务周期"
          style="width: 100%"
          :teleported="false"
        >
          <el-option label="不重复" value="1" />
          <el-option label="每天重复" value="2" />
          <el-option label="每周重复" value="3" />
          <el-option label="每月重复" value="4" />
          <el-option label="每年重复" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="提醒周期" prop="reminder">
        <el-select
          v-model="taskForm.reminder"
          placeholder="请选择提醒周期"
          style="width: 100%"
          :teleported="false"
        >
          <el-option label="准时提醒" value="1" />
          <el-option label="提前5分钟" value="2" />
          <el-option label="提前15分钟" value="3" />
          <el-option label="提前30分钟" value="4" />
          <el-option label="提前1小时" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="提醒方式" prop="remindType">
        <el-select
          v-model="taskForm.remindType"
          placeholder="请选择提醒方式"
          style="width: 100%"
          :teleported="false"
        >
          <el-option label="系统消息" value="1" />
          <el-option label="邮件通知" value="2" />
          <el-option label="短信通知" value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="巡检路线" prop="location">
        <el-select 
          v-model="taskForm.location" 
          placeholder="选择巡检路线"
          style="width: 100%;"
          :teleported="false"
          :loading="routesLoading"
        >
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
          v-model="taskForm.description"
          type="textarea"
          :rows="4"
          placeholder="输入内容"
          maxlength="400"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="上传附件">
        <el-upload
          class="upload-demo"
          action="#"
          :http-request="handleUpload"
          :file-list="taskForm.attachments"
          :on-remove="handleRemove"
          multiple
        >
          <el-button>
            <el-icon><UploadFilled /></el-icon>
            上传文件
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持格式：.rar .zip .doc .docx .pdf，单个文件不超过20MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getPatrolRoutePage } from '@/api/patrol'
import { getDepartmentTree, type DepartmentTreeNode } from '@/api/department'
import { addTask, updateTask, getTaskDetail, type TaskSaveRequest, type TaskUpdateRequest } from '@/api/task'
import { uploadFileWithPermanentUrl, deleteFile } from '@/api/device'

// Props
interface Props {
  modelValue: boolean
  isEdit?: boolean
  editData?: any
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  editData: () => ({})
})

const emit = defineEmits<Emits>()

// 响应式数据
const taskFormRef = ref()

// 路线选项数据
const routeOptions = ref<Array<{ label: string; value: string }>>([])
const routesLoading = ref(false)

// 部门树数据
const departmentTreeData = ref<Array<any>>([])
const employeesLoading = ref(false)

// 构建部门树选择器数据
const buildDepartmentTree = (departments: DepartmentTreeNode[]): any[] => {
  return departments.map(dept => {
    const node: any = {
      label: dept.deptName,
      value: dept.id,
      disabled: true, // 部门节点不可选
      children: []
    }
    
    // 添加员工节点
    if (dept.sysDeptUserVOS && dept.sysDeptUserVOS.length > 0) {
      const employees = dept.sysDeptUserVOS.map(user => ({
        label: user.name,
        value: user.userId,
        disabled: false // 员工节点可选
      }))
      node.children.push(...employees)
    }
    
    // 递归处理子部门
    if (dept.children && dept.children.length > 0) {
      const childDepts = buildDepartmentTree(dept.children)
      node.children.push(...childDepts)
    }
    
    return node
  })
}

// 在部门树中查找员工
const findEmployeeInTree = (tree: any[], userId: string): any => {
  for (const node of tree) {
    if (node.value === userId && !node.disabled) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findEmployeeInTree(node.children, userId)
      if (found) return found
    }
  }
  return null
}

// 定义附件类型
interface AttachmentFile {
  name: string
  url: string
  size: number
  objectName: string
  uid?: string
}

// 任务表单
const taskForm = reactive({
  id: '',
  taskNum: '',
  taskName: '',
  taskType: '',
  executors: [] as string[],
  startTime: null as any,
  endTime: null as any,
  cycle: '1',
  reminder: '1',
  remindType: '1',
  location: '',
  description: '',
  attachments: [] as AttachmentFile[]
})

// 表单验证规则
const taskFormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  taskType: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  executors: [
    { required: true, message: '请选择执行人员', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请选择巡检路线', trigger: 'change' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => props.isEdit ? '编辑任务' : '新建任务')

// 监听编辑数据变化
watch(() => props.modelValue, async (newValue) => {
  if (newValue) { // Dialog is opened
    if (props.isEdit && props.editData && props.editData.id) {
      try {
        const taskDetail = await getTaskDetail(props.editData.id)
        Object.assign(taskForm, {
          id: taskDetail.id,
          taskNum: taskDetail.taskNum, // 假设接口会返回taskNum
          taskName: taskDetail.taskName,
          taskType: taskDetail.taskType,
          executors: taskDetail.taskExcutorInfoVOS?.map(executor => executor.excutorId) || [],
          startTime: taskDetail.startTime,
          endTime: taskDetail.endTime,
          cycle: taskDetail.taskCycle,
          reminder: taskDetail.remindCycle,
          remindType: taskDetail.remindType,
          location: taskDetail.routeManagementId,
          description: taskDetail.desc || '',
          attachments: [] as any[]
        })
      } catch (error) {
        ElMessage.error('获取任务详情失败')
      }
    } else {
      resetTaskForm()
    }
  }
}, { immediate: true })

// 方法
const resetTaskForm = () => {
  Object.assign(taskForm, {
    id: '',
    taskNum: '',
    taskName: '',
    taskType: '',
    executors: [],
    startTime: null,
    endTime: null,
    cycle: '1',
    reminder: '1',
    remindType: '1',
    location: '',
    description: '',
    attachments: []
  })
}

const handleClose = () => {
  resetTaskForm()
  taskFormRef.value?.clearValidate()
}

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = () => {
  taskFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const executorList = taskForm.executors.map(executorId => {
          const employee = findEmployeeInTree(departmentTreeData.value, executorId)
          return {
            excutorId: executorId,
            excutorName: employee?.label || ''
          }
        })

        const attachmentList = taskForm.attachments.map(file => ({
          file: file.url,
          fileName: file.name,
          fileSize: file.size,
          objectName: file.objectName
        }))
        
        if (props.isEdit) {
          const updateData: TaskUpdateRequest = {
            id: taskForm.id,
            taskNum: taskForm.taskNum,
            taskName: taskForm.taskName,
            taskType: taskForm.taskType,
            startTime: taskForm.startTime,
            endTime: taskForm.endTime,
            taskCycle: taskForm.cycle,
            remindCycle: taskForm.reminder,
            remindType: taskForm.remindType,
            routeManagementId: taskForm.location,
            desc: taskForm.description,
            taskExcutorInfoDTOS: executorList,
         
          } as any
          await updateTask(updateData)
          ElMessage.success('编辑任务成功')
        } else {
          const saveData: TaskSaveRequest = {
            taskName: taskForm.taskName,
            taskType: taskForm.taskType,
            startTime: taskForm.startTime,
            endTime: taskForm.endTime,
            taskCycle: taskForm.cycle,
            remindCycle: taskForm.reminder,
            remindType: taskForm.remindType,
            routeManagementId: taskForm.location,
            desc: taskForm.description,
            taskExcutorInfoDTOList: executorList
          } as any
          await addTask(saveData)
          ElMessage.success('新建任务成功')
        }
        
        emit('confirm', { ...taskForm })
        visible.value = false
      } catch (error) {
        ElMessage.error(props.isEdit ? '编辑任务失败' : '新建任务失败')
      }
    }
  })
}

const handleUpload = async (options: any) => {
  const file = options.file
  const allowedTypes = ['.rar', '.zip', '.doc', '.docx', '.pdf']
  const fileExt = file.name.substring(file.name.lastIndexOf('.'))
  const isValidType = allowedTypes.includes(fileExt.toLowerCase())
  const isValidSize = file.size / 1024 / 1024 < 20

  if (!isValidType) {
    ElMessage.error('上传文件格式不正确！')
    return
  }
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过 20MB！')
    return
  }

  try {
    const formData = new FormData()
    formData.append('uploadfile', file)
    formData.append('bucket', 'reservoir')

    const loadingMessage = ElMessage({
      message: '正在上传文件...',
      type: 'info',
      duration: 0
    })

    const response = await uploadFileWithPermanentUrl(formData)
    loadingMessage.close()

    taskForm.attachments.push({
      name: file.name,
      url: (response as any).accessUrl,
      size: file.size,
      objectName: (response as any).objectName
    })

    ElMessage.success('文件上传成功')
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败，请重试')
  }
}

const handleRemove = async (file: any) => {
  const fileIndex = taskForm.attachments.findIndex(f => f.uid === file.uid)
  if (fileIndex === -1) return

  const fileToRemove = taskForm.attachments[fileIndex]

  if (fileToRemove.objectName) {
    try {
      await deleteFile({
        bucket: 'reservoir',
        objectName: fileToRemove.objectName
      })
      ElMessage.success('文件删除成功')
    } catch (error) {
      console.error('删除文件失败:', error)
      ElMessage.error('删除文件失败')
      // Even if deletion fails, remove from list to allow user to proceed
    }
  }

  taskForm.attachments.splice(fileIndex, 1)
}

// 生命周期
onMounted(async () => {
  try {
    // 获取路线数据
    routesLoading.value = true
    const routeData = await getPatrolRoutePage({
      page: 1,
      limit: 1000,
      status: 'T' // 只获取已发布的路线
    })
    routeOptions.value = routeData.list.map((route: any) => ({
      label: route.routeName,
      value: route.id
    }))
  } catch (error) {
    console.error('获取路线数据失败:', error)
  } finally {
    routesLoading.value = false
  }
  
  try {
    // 获取部门树数据
    employeesLoading.value = true
    const departmentData = await getDepartmentTree()
    departmentTreeData.value = buildDepartmentTree(departmentData)
  } catch (error) {
    console.error('获取部门数据失败:', error)
  } finally {
    employeesLoading.value = false
  }
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}
</style>