<!--
  * 告警详情弹窗
  *
  * @Author:    告警详情组件
  * @Date:      2024-01-01
  * @Copyright  智能水库管理系统
-->
<template>
  <el-dialog
    title="告警详情"
    v-model="visible"
    width="800px"
    :lock-scroll="false"
    destroy-on-close
  >
    <!-- 告警信息 -->
    <div class="alert-info-section">
      <h3 class="section-title">
        告警信息

      </h3>
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>所属大坝：</label>
            <span>{{ alertData.dam || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警编号：</label>
            <span>{{ alertData.alertCode || 'XXX' }}</span>
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
            <label>处理状态：</label>
            <span>{{ alertData.status || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>告警类型：</label>
            <span>{{ alertData.type || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>告警点位：</label>
            <span>{{ alertData.position || 'XXX' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label>经度：</label>
            <span>{{ alertData.longitude || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="info-row">
        <el-col :span="8">
          <div class="info-item">
            <label>纬度：</label>
            <span>{{ alertData.latitude || 'XXX' }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 处理进度 -->
    <div class="process-timeline-section">
      <h3 class="section-title">处理进度</h3>
      <el-timeline>
        <el-timeline-item
          v-for="item in timelineData"
          :key="item.id"
          :icon="item.icon"
          :type="item.type"
          :color="item.color"
          :size="item.size"
          :timestamp="item.timestamp"
        >
          <el-card>
            <h4>{{ item.title }}</h4>
            <div v-if="item.operator" class="operator-info">
              <span>{{ item.operator }}</span>
            </div>
            <div v-if="item.description" class="description">
              <span>解决描述：{{ item.description }}</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { InfoFilled, Bell, Check, Warning } from '@element-plus/icons-vue'

interface AlertData {
  dam?: string
  alertCode?: string
  device?: string
  deviceCode?: string
  monitorItem?: string
  level?: string
  time?: string
  info?: string
  responsible?: string
  contact?: string
  phone?: string
  status?: string
  type?: string
  position?: string
  longitude?: string
  latitude?: string
}

const visible = ref(false)
const alertData = ref<AlertData>({})

// 模拟时间线数据
const timelineData = computed(() => [
  {
    id: 1,
    title: '告警触发',
    timestamp: '2022-11-02 15:36:57',
    icon: Bell,
    type: 'primary',
    color: '#409EFF',
    size: 'large'
  },
  {
    id: 2,
    title: '处理反馈',
    timestamp: '2022-11-02 15:36:57',
    operator: '反馈人：徐世锋',
    description: '采用温度深度对比视频观测数据进行了修补、经验证，风险解除。',
    icon: Check,
    type: 'success',
    color: '#67C23A',
    size: 'large'
  },
  {
    id: 3,
    title: '发起告警',
    timestamp: '2022-11-02 12:11:02',
    icon: Warning,
    type: 'warning',
    color: '#E6A23C',
    size: 'large'
  }
])

const showModal = (data: AlertData) => {
  alertData.value = data || {}
  visible.value = true
}

const handleClose = () => {
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

.process-timeline-section {
  margin-bottom: 16px;
  
  :deep(.el-timeline) {
    padding-left: 20px;
  }
  
  :deep(.el-timeline-item__card) {
    padding: 16px;
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    color: #303133;
  }
  
  .operator-info {
    margin-bottom: 8px;
    font-size: 12px;
    color: #606266;
  }
  
  .description {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}

.dialog-footer {
  text-align: right;
}
</style> 