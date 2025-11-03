<template>
  <div class="alarm-detail-modal-backdrop" @click.self="closeModal">
    <div class="alarm-detail-modal-content">
      <div class="modal-header">
        <h3>告警详情 (告警ID: {{ alarmId }})</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body" v-if="alarmDetail">
        <div class="alarm-basic-info">
          <div class="info-header">
            <div class="alarm-title">
              <span class="alarm-level" :class="'level-' + alarmDetail.level">
                {{ alarmDetail.level === 1 ? 'I' : alarmDetail.level === 2 ? 'II' : 'III' }}
              </span>
              <span class="alarm-name">{{ alarmDetail.type }}</span>
            </div>
            <div class="alarm-status" :class="{ 'processed': alarmDetail.status === '已处理' }">
              {{ alarmDetail.status }}
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">所属大坝</div>
              <div class="info-value">{{ alarmDetail.dam }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">告警位置</div>
              <div class="info-value">{{ alarmDetail.location }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">告警时间</div>
              <div class="info-value">{{ alarmDetail.time }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">责任人</div>
              <div class="info-value">{{ alarmDetail.responsible }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">联系电话</div>
              <div class="info-value">{{ alarmDetail.phone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">响应速度</div>
              <div class="info-value">{{ alarmDetail.responseSpeed }}</div>
            </div>
            <div class="info-item" v-if="alarmDetail.status === '已处理'">
              <div class="info-label">处理耗时</div>
              <div class="info-value">{{ alarmDetail.processingTime }}</div>
            </div>
          </div>
        </div>
        
        <div class="alarm-content">
          <div class="content-title">告警内容</div>
          <div class="content-box">
            {{ alarmDetail.content }}
          </div>
        </div>
        
        <div class="alarm-sections">
          <div class="section">
            <div class="section-title">
              <div class="icon">
                <div class="circle"></div>
              </div>
              <span>告警结果</span>
            </div>
            <div class="section-content">
              {{ alarmDetail.result }}
            </div>
          </div>
          
          <div class="section" v-if="alarmDetail.status === '已处理'">
            <div class="section-title">
              <div class="icon">
                <div class="circle"></div>
              </div>
              <span>处理反馈</span>
            </div>
            <div class="section-content">
              {{ alarmDetail.feedback }}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <div class="icon">
                <div class="circle"></div>
              </div>
              <span>发起告警</span>
            </div>
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">发起人</div>
                  <div class="info-value">{{ alarmDetail.initiator }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">发起时间</div>
                  <div class="info-value">{{ alarmDetail.initiationTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="close-btn" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Props
const props = defineProps<{
  alarmId: number;
  show: boolean;
}>();

// Emit
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 告警详情数据
const alarmDetail = ref<any>(null);

// 关闭弹窗
const closeModal = () => {
  emit('close');
};

// 模拟获取告警详情
const fetchAlarmDetail = (id: number) => {
  console.log('获取告警详情 ID:', id);
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 模拟数据
    const detailData = {
      id: id,
      type: id % 2 === 0 ? '渗流监测告警' : '损伤识别告警',
      level: id % 3 === 0 ? 3 : (id % 2 === 0 ? 2 : 1),
      status: id % 2 === 0 ? '已处理' : '未处理',
      dam: ['AA水库', 'BB水库', 'CC水库', 'DD水库'][id % 4],
      location: ['大坝左坝肩', '大坝溢洪道', '大坝右坝肩', '大坝坝体'][id % 4],
      time: '2025-05-02 12:11:02',
      responsible: '张工程师',
      phone: '138****1234',
      responseSpeed: '5分钟',
      processingTime: id % 2 === 0 ? '03:20:42' : '',
      content: '系统检测到大坝左坝肩出现异常渗流，水流量超过阈值，存在安全隐患，需要立即进行排查处理。',
      result: '通过图像识别和传感器数据分析，确认大坝左坝肩存在渗流点，渗流量为0.5L/s，情况较为严重。',
      feedback: id % 2 === 0 ? '已对告警位置进行排查，确认存在渗流点，已进行防渗处理，渗流现象已消除。' : '',
      initiator: '系统自动检测',
      initiationTime: '2025-05-02 12:10:58'
    };
    
    alarmDetail.value = detailData;
  }, 300);
};

// 监听ID变化，重新加载数据
watch(() => props.alarmId, (newId) => {
  if (newId) {
    fetchAlarmDetail(newId);
  }
});

// 组件挂载时加载数据
onMounted(() => {
  if (props.alarmId) {
    fetchAlarmDetail(props.alarmId);
  }
});
</script>

<style scoped>
.alarm-detail-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200; /* 确保在历史告警表格之上 */
}

.alarm-detail-modal-content {
  background-color: rgba(11, 27, 51, 0.95);
  border: 1px solid #1E3F66;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #1E3F66;
  background-color: rgba(0, 66, 102, 0.3);
}

.modal-header h3 {
  margin: 0;
  color: #00CFFF;
  font-size: 18px;
}

.close-button {
  background: transparent;
  border: none;
  color: #00CFFF;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-height: calc(90vh - 130px);
}

.alarm-basic-info {
  background-color: rgba(0, 66, 102, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.alarm-title {
  display: flex;
  align-items: center;
}

.alarm-level {
  display: inline-block;
  width: 25px;
  height: 25px;
  line-height: 25px;
  text-align: center;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.level-1 {
  background-color: #FF4444; /* 红色 - I级 */
}

.level-2 {
  background-color: #FFA500; /* 橙色 - II级 */
}

.level-3 {
  background-color: #FFCC00; /* 黄色 - III级 */
}

.alarm-name {
  font-size: 18px;
  font-weight: bold;
}

.alarm-status {
  padding: 4px 12px;
  border-radius: 15px;
  background-color: #FF6B6B;
  color: white;
  font-size: 14px;
}

.alarm-status.processed {
  background-color: #4CAF50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 5px;
}

.info-value {
  color: white;
  font-size: 15px;
}

.alarm-content {
  margin-bottom: 20px;
}

.content-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #00CFFF;
}

.content-box {
  background-color: rgba(0, 66, 102, 0.2);
  border-radius: 8px;
  padding: 15px;
  line-height: 1.6;
}

.alarm-sections .section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #00CFFF;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #00CFFF;
}

.section-content {
  background-color: rgba(0, 66, 102, 0.2);
  border-radius: 8px;
  padding: 15px;
  line-height: 1.6;
  margin-left: 34px; /* 与图标对齐 */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #1E3F66;
  background-color: rgba(0, 66, 102, 0.2);
}

.close-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  margin-left: 15px;
  background-color: transparent;
  color: #00CFFF;
  border: 1px solid #00CFFF;
}

.close-btn:hover {
  background-color: rgba(0, 207, 255, 0.1);
}
</style> 