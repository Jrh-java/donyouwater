<!--
  * 告警处理弹窗
  *
  * @Author:    告警处理组件
  * @Date:      2024-01-01
  * @Copyright  智能水库管理系统
-->
<template>
  <el-dialog
    title="处理告警"
    v-model="visible"
    width="800px"
    :lock-scroll="false"
    destroy-on-close
  >
    <!-- 告警信息 -->
    <div class="alert-info-section">
      <h3 class="section-title">告警信息</h3>
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>所属大坝：</label>
            <span>{{ alertData.dam || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>处理状态：</label>
            <span>{{ alertData.status || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警设备：</label>
            <span>{{ alertData.device || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>设备编号：</label>
            <span>{{ alertData.deviceCode || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>监测项目：</label>
            <span>{{ alertData.monitorItem || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警级别：</label>
            <span>{{ alertData.level || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>告警时间：</label>
            <span>{{ alertData.time || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警信息：</label>
            <span>{{ alertData.info || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>责任人：</label>
            <span>{{ alertData.responsible || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>联系人：</label>
            <span>{{ alertData.contact || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>联系电话：</label>
            <span>{{ alertData.phone || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警类型：</label>
            <span>{{ alertData.type || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>经度：</label>
            <span>{{ alertData.longitude || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>纬度：</label>
            <span>{{ alertData.latitude || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警点位：</label>
            <span>{{ alertData.position || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 告警图片 -->
    <div class="alert-images-section">
      <h3 class="section-title">
        告警图片
 
      </h3>
      <div class="images-container">
        <div class="image-placeholder" v-for="i in 3" :key="i">
          <el-icon :size="40" color="#C0C4CC"><Picture /></el-icon>
        </div>
      </div>
    </div>

    <!-- 当前处理 -->
    <div class="process-section">
      <h3 class="section-title">当前处理</h3>
      <el-form :model="processForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="处理结果：">
              <el-select v-model="processForm.result" placeholder="请选择" style="width: 100%" :teleported="false">
                <el-option label="已处理" value="processed" />
                <el-option label="忽略" value="ignored" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="处理反馈：">
          <el-input
            v-model="processForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入处理反馈信息"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Picture } from '@element-plus/icons-vue'

interface AlertData {
  dam?: string
  status?: string
  device?: string
  deviceCode?: string
  monitorItem?: string
  level?: string
  time?: string
  info?: string
  responsible?: string
  contact?: string
  phone?: string
  type?: string
  longitude?: string
  latitude?: string
  position?: string
}

const visible = ref(false)
const alertData = ref<AlertData>({})

const processForm = reactive({
  result: '',
  feedback: ''
})

const emit = defineEmits<{
  confirm: [data: any]
}>()

const showModal = (data: AlertData) => {
  alertData.value = data || {}
  processForm.result = ''
  processForm.feedback = ''
  visible.value = true
}

const handleCancel = () => {
  visible.value = false
}

const handleSubmit = () => {
  if (!processForm.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  if (!processForm.feedback.trim()) {
    ElMessage.warning('请输入处理反馈信息')
    return
  }
  
  emit('confirm', {
    ...alertData.value,
    processResult: processForm.result,
    processFeedback: processForm.feedback,
    processTime: new Date().toLocaleString()
  })
  
  ElMessage.success('处理成功')
  visible.value = false
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  
  .warning-icon {
    margin-left: 8px;
    color: #E6A23C;
  }
  
  .warning-text {
    font-size: 12px;
    font-weight: normal;
    color: #E6A23C;
    margin-left: 4px;
  }
}

.alert-info-section {
  margin-bottom: 24px;
  
  .info-row {
    margin-bottom: 12px;
  }
  
  .info-item {
    display: flex;
    
    label {
      min-width: 80px;
      color: #606266;
      font-weight: 500;
    }
    
    span {
      color: #303133;
    }
  }
}

.alert-images-section {
  margin-bottom: 24px;
  
  .images-container {
    display: flex;
    gap: 16px;
    
    .image-placeholder {
      width: 120px;
      height: 80px;
      border: 2px dashed #DCDFE6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #FAFAFA;
    }
  }
}

.process-section {
  margin-bottom: 16px;
}

.dialog-footer {
  text-align: right;
}
</style> 