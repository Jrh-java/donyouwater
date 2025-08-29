<template>
  <div v-if="show" class="gate-control-modal-overlay" @click.self="closeModal">
    <div class="gate-control-modal">
      <!-- 弹窗头部 -->
      <div class="modal-header">
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <button class="close-button" @click="closeModal">
          <el-icon><Close /></el-icon>
        </button>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="modal-content">
        <el-row :gutter="20">
          <!-- Left Side -->
          <el-col :span="10" class="content-col">
            <div class="column-header">
              <span>闸门控制</span>
            </div>
            <div class="gate-internal-monitor">
              <div class="gate-controls">
                <el-button type="primary" @click="showConfirmationDialog('open')"
                  :disabled="!gateExtInfo || !Array.isArray(gateExtInfo) || gateExtInfo.length === 0 || (gateExtInfo.some(info => String(info.isHandle) === '1.0'))">一键开闸</el-button>
                  <div></div>
                <el-button type="danger" @click="showConfirmationDialog('close')"
                  :disabled="!gateExtInfo || !Array.isArray(gateExtInfo) || gateExtInfo.length === 0 || (gateExtInfo.some(info => String(info.isHandle) === '1.0'))">一键关闸</el-button>
              </div>
              <!-- 闸门信息显示 -->
              <div class="gate-info-overlay">
                <!-- 一号闸口信息（右侧） -->
                <div class="gate-info gate-info-1">
                  <div class="gate-info-title">一号闸口</div>
                  <div class="gate-info-item">
                    <span class="info-label">开度:</span>
                    <span class="info-value">{{ gate1Info ? gate1Info.openingDegree : '0' }}%</span>
                  </div>
                  <div class="gate-info-item">
                    <span class="info-label">高度:</span>
                    <span class="info-value">{{ gate1Info ? gate1Info.gateHeight : '0' }}米</span>
                  </div>
                </div>
                <!-- 二号闸口信息（左侧） -->
                <div class="gate-info gate-info-2">
                  <div class="gate-info-title">二号闸口</div>
                  <div class="gate-info-item">
                    <span class="info-label">开度:</span>
                    <span class="info-value">{{ gate2Info ? gate2Info.openingDegree : '0' }}%</span>
                  </div>
                  <div class="gate-info-item">
                    <span class="info-label">高度:</span>
                    <span class="info-value">{{ gate2Info ? gate2Info.gateHeight : '0' }}米</span>
                  </div>
                </div>
              </div>
              <!-- 闸门站图片显示 -->
              <img src="/src/assets/images/GateStation.jpg" alt="闸门站" class="gate-station-image" />
              <img src="/src/assets/images/Gate.png" alt="闸门口1" class="gate-image gate-1"
                :style="{ '--gate1-position': `${gate1Position}%` }" />
              <img src="/src/assets/images/Gate.png" alt="闸门口2" class="gate-image gate-2"
                :style="{ '--gate2-position': `${gate2Position}%` }" />
            </div>
            <el-descriptions title="闸门情况" :column="2" border class="gate-status-info">
              <el-descriptions-item label="闸门控制">
                <el-tag :type="currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? 'success' : 'warning'">
                  {{ currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? '自动可远程' : '手动' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="最新时间">{{ currentGateInfo ? currentGateInfo.crtTime : '--' }}
              </el-descriptions-item>
              <el-descriptions-item label="河道液位">{{ gateExtInfo && gateExtInfo.length > 0 ? gateExtInfo[0].riverLevel : '--'
                }}米
              </el-descriptions-item>
              <el-descriptions-item label="渠道液位">{{ gateExtInfo && gateExtInfo.length > 0 ? gateExtInfo[0].channelLevel :
                '--' }}米
              </el-descriptions-item>
            </el-descriptions>
            <!-- 闸口选择 -->
            <div class="gate-port-selection" style="margin: 20px 0;">
              <el-form-item label="选择闸口:" style="font-size: 16px;">
                <el-select v-model="selectedGatePort" placeholder="请选择闸口" style="width: 200px;" :teleported="false"
                   :disabled="!selectedGatePort"
                  @change="handleGatePortChange">
                  <el-option v-for="option in gatePortOptions" :key="option.value" :label="option.label"
                    :value="option.value"></el-option>
                </el-select>
              </el-form-item>
            </div>

            <!-- 闸口开度控制 -->
            <div class="gate-opening-control" style="margin: 20px 0; text-align: left;">
              <el-form :inline="true" :model="gateOpeningForm">
                <el-form-item label="闸口开度:" style="font-size: 16px;">
                  <el-input 
                    v-model.number="gateOpeningForm.openingValue" 
                    type="number" 
                    :min="0" 
                    :max="100" 
                    placeholder="请输入开度"
                    style="width: 200px;" 
                    :disabled="!selectedGatePort"
                    @input="handleOpeningValueInput"
                  >
                    <template #suffix>
                      <span>%</span>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <div style="display: flex; gap: 8px;">
                    <el-button type="primary" @click="showConfirmationDialog('opening')"
                      :disabled="!selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0') || gateOpeningForm.openingValue === null || gateOpeningForm.openingValue === undefined"
                      :loading="gateOpeningLoading">
                      执行
                    </el-button>
                    <el-button type="warning" @click="stopGate"
                      :disabled="!selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')">停闸</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-col>

          <!-- Divider -->
          <el-col :span="1" class="divider-col">
            <el-divider direction="vertical" class="custom-divider"></el-divider>
          </el-col>

          <!-- Right Side -->
          <el-col :span="13" class="content-col">
            <div class="column-header">
              <span>实时视频</span>
              <!-- 摄像枪选择下拉框 -->
              <el-select v-model="selectedCameraDevice" placeholder="请选择摄像枪" style="width: 200px;"
                :disabled="!cameraDevices.length" @change="handleCameraDeviceChange" :teleported="false">
                <el-option v-for="device in cameraDevices" :key="device.deviceCode" :label="device.deviceName"
                  :value="device.deviceCode"></el-option>
              </el-select>
            </div>
            <div class="gate-external-monitor">
              <!-- 视频播放区域 -->
              <div class="video-display-area">
                <video ref="videoElement" class="video-player" controls muted autoplay
                  style="width: 100%; height: 450px; background-color: #000;">
                  您的浏览器不支持视频播放
                </video>
                <div v-if="!videoUrl" class="video-placeholder">
                  <div style="text-align: center; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                    <div style="font-size: 16px;">请选择摄像枪查看视频</div>
                  </div>
                </div>
                <div class="video-status-overlay">
                  <span v-if="connectTime">连接时间: {{ connectTime }}</span>
                </div>
              </div>
              <div style="text-align: left; margin-top: 5px;">
                <el-tag type="success"><el-icon>
                    <CaretRight />
                  </el-icon> 实时视频</el-tag>
              </div>
            </div>

            <el-card shadow="never" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>任务计划</span>
                  <el-button type="primary" @click="showAddTaskDialog">添加任务</el-button>
                </div>
              </template>
              <el-table :data="taskList" style="width: 100%" height="200" v-loading="taskLoading">
                <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
                <el-table-column prop="taskType" label="任务类型" align="center">
                  <template #default="scope">
                    {{ getTaskTypeLabel(scope.row.taskType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="deviceCode" label="设备编号" align="center"></el-table-column>
                <el-table-column prop="id" label="任务ID" align="center"></el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button type="danger" link @click="deleteTask(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <el-dialog :lockScroll="false" v-model="dialogVisible" :title="dialogTitle" width="30%"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="margin-bottom: 15px;">
        <p>为防止出现误操作，需要进行二次确认，请在下方输入正确的计算结果：</p>
        <p><strong v-html="mathProblem.question" style="font-size: 24px;"></strong></p>
      </div>
      <el-input v-model="userAnswer" placeholder="请输入答案" @keyup.enter="handleConfirm"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加任务弹窗 -->
    <el-dialog title="添加任务" v-model="showAddTaskDialogVisible" width="400px" :lock-scroll="false">
      <el-form :model="addTaskForm" label-width="100px">
        <el-form-item label="任务时间:">
          <el-select v-model="addTaskForm.taskType" placeholder="请选择任务时间" style="width: 100%;" :teleported="false">
            <el-option v-for="option in taskTypeOptions" :key="option.value" :label="option.label"
              :value="option.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAddTask">取消</el-button>
          <el-button type="primary" @click="confirmAddTask" :loading="addTaskLoading">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted, onBeforeUnmount } from 'vue';
import { Picture, VideoCamera, CaretRight, Close } from '@element-plus/icons-vue';
import { ElMessage, ElDialog, ElInput, ElButton, ElDivider } from 'element-plus';
import { gateOnOrOff, getMonitorDevicesByGateStationCodeApi, sendDeviceCommandApi, getDeviceManagementInfo, getGateExtInfo, getGateTaskList, taskSend, setGateOpeningRate } from '@/api/reservoir';
import flvjs from 'flv.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modalTitle: {
    type: String,
    default: '闸门控制'
  },
  gateStationCode: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

// 模拟selectedDamNode，使用传入的gateStationCode
const selectedDamNode = computed(() => {
  if (props.gateStationCode) {
    return {
      gateStationCode: props.gateStationCode,
      nodeType: 'gateStation'
    };
  }
  return null;
});

// 闸门扩展信息
const gateExtInfo = ref(null);

// 定时器
let gateExtInfoTimer = null;

// 当前选中闸口的闸门信息
const currentGateInfo = ref(null);

// 闸门位置
const gate1Position = ref(-45); // 闸门1位置（0%开度时为-45%）
const gate2Position = ref(-45); // 闸门2位置（0%开度时为-45%）

// 闸口选择
const selectedGatePort = ref('');
const gatePortOptions = ref([
  { label: '一号闸口', value: 'IRDA.DEVICE.GATE.OPENING' },
  { label: '二号闸口', value: 'IRDA2.DEVICE.GATE.OPENING' }
]);

// 设备编码（用于控制操作）
const controlDeviceCode = ref('');

// 摄像设备相关
const cameraDevices = ref([]);
const selectedCameraDevice = ref('');
const videoElement = ref(null);
const flvPlayer = ref(null);
const videoUrl = ref('');
const connectionStatus = ref('未连接');
const connectTime = ref('');
const isPlaying = ref(false);

// 任务计划相关
const taskList = ref([]);
const taskLoading = ref(false);
const showAddTaskDialogVisible = ref(false);
const addTaskLoading = ref(false);
const addTaskForm = reactive({
  taskType: ''
});

// 任务类型选项
const taskTypeOptions = ref([
  { value: 'TIMING_GATE_1_AM_6_10', label: '早上 6点到10点闸门#1' },
  { value: 'TIMING_GATE_1_PM_5_9', label: '下午 5点到 9点闸门#1' },
  { value: 'TIMING_GATE_2_AM_6_10', label: '早上 6点到10点闸门#2' },
  { value: 'TIMING_GATE_2_PM_5_9', label: '下午 5点到 9点闸门#2' }
]);

// 闸口开度控制相关
const gateOpeningForm = reactive({
  openingValue: null
});
const gateOpeningLoading = ref(false);

// 确认弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const userAnswer = ref('');
const mathProblem = ref({ question: '', answer: 0 });
const pendingAction = ref('');

// 计算属性：获取一号闸口信息
const gate1Info = computed(() => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) return null;
  return gateExtInfo.value.find(item => item.devpoint === 'IRDA.DEVICE.GATE.OPENING');
});

// 计算属性：获取二号闸口信息
const gate2Info = computed(() => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) return null;
  return gateExtInfo.value.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');
});

// 关闭弹窗
const closeModal = () => {
  emit('close');
};

// 计算闸门位置
const calculateGatePosition = (openingDegree) => {
  // 0%开度时位置为-45%，100%开度时位置为-95%
  // 计算公式：-45 + (openingDegree / 100) * (-95 - (-45))
  return -45 + (openingDegree / 100) * (-50);
};

// 更新闸门位置
const updateGatePositions = (extInfo) => {
  if (!Array.isArray(extInfo)) return;

  // 找到对应的闸门信息并更新位置
  extInfo.forEach(item => {
    if (item.devpoint === 'IRDA.DEVICE.GATE.OPENING') {
      // 闸门1
      gate1Position.value = calculateGatePosition(item.openingDegree || 0);
    } else if (item.devpoint === 'IRDA2.DEVICE.GATE.OPENING') {
      // 闸门2
      gate2Position.value = calculateGatePosition(item.openingDegree || 0);
    }
  });
};

// 获取闸门扩展信息
const fetchGateExtendedInfo = async (gateStationCode) => {
  try {
    // 先获取设备管理信息（设备类别6）
    const deviceInfo = await getDeviceManagementInfo(gateStationCode, 6);
    if (deviceInfo && deviceInfo.deviceCode) {
      // 使用deviceCode获取闸门扩展信息
      const extInfo = await getGateExtInfo(deviceInfo.deviceCode);
      if (extInfo) {
        gateExtInfo.value = extInfo;
        console.log('获取到闸门扩展信息:', extInfo);

        // 设置闸口选项
        if (Array.isArray(extInfo)) {
          const currentSelectedPort = selectedGatePort.value;
          gatePortOptions.value = extInfo.map((item, index) => ({
            label: item.devpoint.includes('IRDA2') ? '二号闸口' : '一号闸口',
            value: item.devpoint
          }));

          // 更新闸门位置
          updateGatePositions(extInfo);

          // 如果当前有选中的闸口且在新的选项中存在，保持选中状态
          if (currentSelectedPort && gatePortOptions.value.some(option => option.value === currentSelectedPort)) {
            selectedGatePort.value = currentSelectedPort;
            handleGatePortChange(currentSelectedPort);
          } else if (gatePortOptions.value.length > 0 && !selectedGatePort.value) {
            // 只在没有选中闸口时才设置默认值
            selectedGatePort.value = gatePortOptions.value[0].value;
            handleGatePortChange(selectedGatePort.value);
          }
        }
      }
    }
  } catch (error) {
    console.error('获取闸门扩展信息失败:', error);
  }
};

// 启动闸门扩展信息定时器
const startGateExtInfoTimer = (gateStationCode) => {
  // 清除之前的定时器
  if (gateExtInfoTimer) {
    clearInterval(gateExtInfoTimer);
  }

  // 启动新的定时器
  gateExtInfoTimer = setInterval(() => {
    fetchGateExtendedInfo(gateStationCode);
  }, 5000); // 每5秒更新一次
};

// 停止闸门扩展信息定时器
const stopGateExtInfoTimer = () => {
  if (gateExtInfoTimer) {
    clearInterval(gateExtInfoTimer);
    gateExtInfoTimer = null;
  }
};

// 处理闸口选择变化
const handleGatePortChange = (selectedPort) => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) {
    currentGateInfo.value = null;
    return;
  }
  
  // 根据选择的闸口找到对应的闸门信息
  const gateInfo = gateExtInfo.value.find(item => item.devpoint === selectedPort);
  if (gateInfo) {
    currentGateInfo.value = gateInfo;
    console.log('选择闸口:', selectedPort, '对应信息:', gateInfo);
  } else {
    currentGateInfo.value = null;
    console.warn('未找到对应闸口的信息:', selectedPort);
  }
};

// 生成数学题
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer;
  let question;
  
  switch (operator) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
  }
  
  mathProblem.value = { question, answer };
};

// 显示确认弹窗
const showConfirmationDialog = (action) => {
  pendingAction.value = action;
  if (action === 'open') {
    dialogTitle.value = '开闸确认';
  } else if (action === 'close') {
    dialogTitle.value = '关闸确认';
  } else if (action === 'opening') {
    dialogTitle.value = '设置开度确认';
  }
  generateMathProblem();
  userAnswer.value = '';
  dialogVisible.value = true;
};

// 处理确认
const handleConfirm = async () => {
  if (parseInt(userAnswer.value) === mathProblem.value.answer) {
    dialogVisible.value = false;
    
    try {
      if (pendingAction.value === 'open') {
        await openGateLogic();
      } else if (pendingAction.value === 'close') {
        await closeGateLogic();
      } else if (pendingAction.value === 'opening') {
        await setGateOpeningLogic();
      }
    } catch (error) {
      console.error('操作失败:', error);
      ElMessage.error('操作失败，请重试');
    }
  } else {
    ElMessage.error('答案错误，请重新输入');
    userAnswer.value = '';
  }
};

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false;
  userAnswer.value = '';
  pendingAction.value = '';
};

// 开闸逻辑
const openGateLogic = async () => {
  if (!selectedDamNode.value?.gateStationCode) {
    ElMessage.error('未选择闸站');
    return;
  }

  try {
    const result = await gateOnOrOff(selectedDamNode.value.gateStationCode, 1);
    if (result) {
      ElMessage.success('开闸指令发送成功');
    } else {
      ElMessage.error('开闸指令发送失败');
    }
  } catch (error) {
    console.error('开闸操作失败:', error);
    ElMessage.error('开闸操作失败');
  }
};

// 关闸逻辑
const closeGateLogic = async () => {
  if (!selectedDamNode.value?.gateStationCode) {
    ElMessage.error('未选择闸站');
    return;
  }

  try {
    const result = await gateOnOrOff(selectedDamNode.value.gateStationCode, 0);
    if (result) {
      ElMessage.success('关闸指令发送成功');
    } else {
      ElMessage.error('关闸指令发送失败');
    }
  } catch (error) {
    console.error('关闸操作失败:', error);
    ElMessage.error('关闸操作失败');
  }
};

// 设置闸口开度逻辑
const setGateOpeningLogic = async () => {
  if (!selectedGatePort.value) {
    ElMessage.error('请先选择闸口');
    return;
  }

  if (gateOpeningForm.openingValue === null || gateOpeningForm.openingValue === undefined) {
    ElMessage.error('请输入开度值');
    return;
  }

  if (gateOpeningForm.openingValue < 0 || gateOpeningForm.openingValue > 100) {
    ElMessage.error('开度值必须在0-100之间');
    return;
  }

  try {
    gateOpeningLoading.value = true;
    const result = await setGateOpeningRate(selectedGatePort.value, gateOpeningForm.openingValue);
    if (result) {
      ElMessage.success('设置开度指令发送成功');
    } else {
      ElMessage.error('设置开度指令发送失败');
    }
  } catch (error) {
    console.error('设置开度操作失败:', error);
    ElMessage.error('设置开度操作失败');
  } finally {
    gateOpeningLoading.value = false;
  }
};

// 停闸操作
const stopGate = async () => {
  if (!selectedGatePort.value) {
    ElMessage.error('请先选择闸口');
    return;
  }

  try {
    const result = await sendDeviceCommandApi(selectedGatePort.value, 'STOP');
    if (result) {
      ElMessage.success('停闸指令发送成功');
    } else {
      ElMessage.error('停闸指令发送失败');
    }
  } catch (error) {
    console.error('停闸操作失败:', error);
    ElMessage.error('停闸操作失败');
  }
};

// 处理开度输入值验证
const handleOpeningValueInput = (value) => {
  if (value !== null && value !== undefined) {
    if (value < 0) {
      gateOpeningForm.openingValue = 0;
    } else if (value > 100) {
      gateOpeningForm.openingValue = 100;
    }
  }
};

// 获取摄像设备
const fetchCameraDevices = async (gateStationCode) => {
  try {
    const devices = await getMonitorDevicesByGateStationCodeApi(gateStationCode);
    
    if (devices && Array.isArray(devices)) {
      cameraDevices.value = devices;
      console.log('获取到摄像设备:', devices.length, '个');
      
      // 如果有设备且当前没有选中设备，自动选择第一个
      if (devices.length > 0 && !selectedCameraDevice.value) {
        selectedCameraDevice.value = devices[0].deviceCode;
        handleCameraDeviceChange(devices[0].deviceCode);
      }
    } else {
      cameraDevices.value = [];
      console.log('未获取到摄像设备');
    }
  } catch (error) {
    console.error('获取摄像设备失败:', error);
    cameraDevices.value = [];
  }
};

// 处理摄像设备变化
const handleCameraDeviceChange = (deviceCode) => {
  if (!deviceCode) return;
  
  console.log('切换摄像设备:', deviceCode);
  sendControlCommand(deviceCode);
};

// 发送设备控制命令
const sendControlCommand = async (deviceCode) => {
  try {
    const topic = `YN/0000/769834/control/${deviceCode}`;
    const payloadStr = JSON.stringify({
      "command": "config",
      "rtmpCtrl": {
        "rtmpEnable": 1,
        "rtmpServer": "119.3.245.90",
        "rtmpPort": 1935,
        "releaseTime": 5
      }
    });

    const result = await sendDeviceCommandApi(topic, payloadStr);
    console.log('发送控制命令结果:', result);

    if (result === "发送取流命令成功！") {
      ElMessage.success('发送取流命令成功！');
      // 构建FLV视频流地址
      const flvUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${deviceCode}`;

      console.log('准备播放FLV流:', flvUrl);
      videoUrl.value = flvUrl;
      connectionStatus.value = '连接中...';

      // 停止当前播放
      stopVideo();
      
      // 开始播放视频
      setTimeout(() => {
        initFLVPlayer(flvUrl);
      }, 2000); // 等待2秒让设备准备好
    } else {
      ElMessage.error('发送控制命令失败');
    }
  } catch (error) {
    console.error('发送控制命令失败:', error);
    ElMessage.error('发送控制命令失败');
  }
};

// 初始化FLV播放器
const initFLVPlayer = (url) => {
  console.log('初始化FLV播放器:', url);

  if (!videoElement.value) {
    console.error('视频元素未找到');
    return;
  }

  if (!url) {
    console.error('视频URL为空');
    ElMessage.error('视频URL无效');
    return;
  }

  // 清理现有播放器
  cleanup();

  try {
    if (flvjs.isSupported()) {
      flvPlayer.value = flvjs.createPlayer({
        type: 'flv',
        url: url,
        isLive: true,
        hasAudio: true,
        hasVideo: true,
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: undefined,
        lazyLoad: true,
        lazyLoadMaxDuration: 3 * 60,
        lazyLoadRecoverDuration: 30
      });

      flvPlayer.value.attachMediaElement(videoElement.value);

      // 监听播放器事件
      flvPlayer.value.on(flvjs.Events.LOADING_COMPLETE, () => {
        console.log('FLV加载完成');
        connectionStatus.value = '已连接';
      });

      flvPlayer.value.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
        console.log('媒体信息:', mediaInfo);
      });

      flvPlayer.value.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
        console.error('FLV播放错误:', errorType, errorDetail, errorInfo);
        connectionStatus.value = '连接失败';

        let errorMessage = '视频播放失败';
        let shouldReconnect = false;

        if (errorType === 'MediaError') {
          if (errorDetail === 'FormatUnsupported') {
            errorMessage = '视频格式不支持，请检查视频流地址';
          } else if (errorDetail === 'NetworkError') {
            errorMessage = '网络连接失败，正在尝试重连...';
            shouldReconnect = true;
          }
        } else if (errorType === 'NetworkError') {
          // 检测到网络错误，可能是自动断流
          errorMessage = '视频流已断开，正在尝试重连...';
          shouldReconnect = true;
        }

        if (shouldReconnect && selectedCameraDevice.value) {
          console.log('检测到自动断流，尝试重连...');
          ElMessage.warning('视频流已断开，正在尝试重连...');

          // 清理当前播放器
          cleanup();

          // 延迟2秒后重新连接
          setTimeout(() => {
            if (selectedCameraDevice.value) {
              console.log('重新发送控制命令:', selectedCameraDevice.value);
              sendControlCommand(selectedCameraDevice.value);
            }
          }, 2000);
        } else {
          ElMessage.error(errorMessage);
          // 清理播放器
          cleanup();
        }
      });

      flvPlayer.value.load();

      // 等待一段时间后开始播放
      setTimeout(() => {
        if (flvPlayer.value) {
          flvPlayer.value.play();
          isPlaying.value = true;
          connectTime.value = new Date().toLocaleTimeString();
        }
      }, 1000);

      videoUrl.value = url;

    } else {
      console.error('浏览器不支持FLV播放');
      ElMessage.error('浏览器不支持FLV播放');
    }
  } catch (error) {
    console.error('FLV播放器初始化失败:', error);
    ElMessage.error('视频播放器初始化失败');
  }
};

// 清理资源
const cleanup = () => {
  console.log('清理FLV播放器资源');
  
  if (flvPlayer.value) {
    try {
      if (flvPlayer.value.type === 'FlvPlayer') {
        flvPlayer.value.pause();
        flvPlayer.value.unload();
        flvPlayer.value.detachMediaElement();
        flvPlayer.value.destroy();
      }
    } catch (error) {
      console.error('清理FLV播放器时出错:', error);
    } finally {
      flvPlayer.value = null;
    }
  }
  
  if (videoElement.value) {
    try {
      videoElement.value.pause();
      videoElement.value.src = '';
      videoElement.value.load();
    } catch (error) {
      console.error('清理视频元素时出错:', error);
    }
  }
  
  isPlaying.value = false;
  connectionStatus.value = '未连接';
  connectTime.value = '';
  videoUrl.value = '';
};



// 停止视频
const stopVideo = () => {
  if (flvPlayer.value) {
    try {
      flvPlayer.value.pause();
      flvPlayer.value.unload();
      flvPlayer.value.detachMediaElement();
      flvPlayer.value.destroy();
      flvPlayer.value = null;
    } catch (error) {
      console.error('停止视频播放失败:', error);
    }
  }
  
  isPlaying.value = false;
  connectionStatus.value = '未连接';
  connectTime.value = '';
};

// 获取任务列表
const fetchTaskList = async (gateStationCode) => {
  try {
    taskLoading.value = true;
    const tasks = await getGateTaskList(gateStationCode);
    if (tasks && Array.isArray(tasks)) {
      taskList.value = tasks;
      console.log('获取到任务列表:', tasks.length, '个任务');
    } else {
      taskList.value = [];
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    taskList.value = [];
  } finally {
    taskLoading.value = false;
  }
};

// 获取任务类型标签
const getTaskTypeLabel = (taskType) => {
  const option = taskTypeOptions.value.find(opt => opt.value === taskType);
  return option ? option.label : taskType;
};

// 显示添加任务弹窗
const showAddTaskDialog = () => {
  addTaskForm.taskType = '';
  showAddTaskDialogVisible.value = true;
};

// 取消添加任务
const cancelAddTask = () => {
  showAddTaskDialogVisible.value = false;
  addTaskForm.taskType = '';
};

// 确认添加任务
const confirmAddTask = async () => {
  if (!addTaskForm.taskType) {
    ElMessage.error('请选择任务类型');
    return;
  }

  if (!selectedDamNode.value?.gateStationCode) {
    ElMessage.error('未选择闸站');
    return;
  }

  try {
    addTaskLoading.value = true;
    const result = await taskSend({
      gateStationCode: selectedDamNode.value.gateStationCode,
      taskType: addTaskForm.taskType
    });
    
    if (result) {
      ElMessage.success('任务添加成功');
      showAddTaskDialogVisible.value = false;
      addTaskForm.taskType = '';
      // 重新获取任务列表
      await fetchTaskList(selectedDamNode.value.gateStationCode);
    } else {
      ElMessage.error('任务添加失败');
    }
  } catch (error) {
    console.error('添加任务失败:', error);
    ElMessage.error('添加任务失败');
  } finally {
    addTaskLoading.value = false;
  }
};

// 删除任务
const deleteTask = async (task) => {
  try {
    // 这里应该调用删除任务的API
    ElMessage.success('任务删除成功');
    // 重新获取任务列表
    if (selectedDamNode.value?.gateStationCode) {
      await fetchTaskList(selectedDamNode.value.gateStationCode);
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    ElMessage.error('删除任务失败');
  }
};

// 监听弹窗显示状态
watch(() => props.show, (newShow) => {
  if (newShow && props.gateStationCode) {
    // 弹窗打开时，初始化数据
    fetchGateExtendedInfo(props.gateStationCode);
    startGateExtInfoTimer(props.gateStationCode);
    fetchCameraDevices(props.gateStationCode);
    fetchTaskList(props.gateStationCode);
  } else {
    // 弹窗关闭时，清理资源
    stopGateExtInfoTimer();
    stopVideo();
  }
});

// 组件卸载时清理资源
onBeforeUnmount(() => {
  stopGateExtInfoTimer();
  stopVideo();
});
</script>

<style scoped lang="scss">
.gate-control-modal-overlay {
  position: fixed;
  top: 10%;
  left: 15%;

  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.gate-control-modal {
  background: #ffffff;
  border-radius: 8px;

  max-width: 1500px;

  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.modal-title {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #909399;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #409eff;
    background: #ecf5ff;
  }
}

.modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #ffffff;
  color: #303133;
}

.content-col {
  height: 100%;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
  
  span {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.divider-col {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.custom-divider {
  height: 80%;
  border-color: #e4e7ed;
}

.gate-controls {
  display: flex;
  gap: 10px;
  position: absolute;
  flex-direction: column;
  top: 30px;
  z-index: 100;
  margin-bottom: 20px;
  justify-content: center;
}

.gate-internal-monitor {
  position: relative;
  width: 100%;
  display: inline-block;

  .gate-info-overlay {
    position: absolute;
    top: 65px;
    left: 0;
    right: 45px;
    z-index: 10;
    display: flex;
    justify-content: center;
    padding: 0 5%;
    gap: 20px;

    .gate-info {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 120px;

      .gate-info-title {
        font-weight: bold;
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 4px;
      }

      .gate-info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 14px;

        .info-label {
          color: #666;
          margin-right: 8px;
        }

        .info-value {
          color: #409eff;
          font-weight: 500;
        }
      }
    }

    .gate-info-1 {
      order: 2; /* 一号闸口显示在右侧 */
    }

    .gate-info-2 {
      order: 1; /* 二号闸口显示在左侧 */
    }
  }

  .gate-station-image {
    width: 90%;
    height: 400px;
    border-radius: 8px;
    display: block;
  }

  .gate-image {
    position: absolute;
    top: 77%;
    width: 50px;
    transition: transform 0.5s ease-in-out;

    &.gate-2 {
      left: 36%;
      transform: translateX(-50%) translateY(var(--gate2-position, -45%));
      /* 水平居中 + 垂直移动 */
    }

    &.gate-1 {
      left: 54%;
      transform: translateX(-50%) translateY(var(--gate1-position, -45%));
      /* 水平居中 + 垂直移动 */
    }
  }
}

.gate-status-info {
  margin: 20px 0;
}

.gate-port-selection {
  :deep(.el-form-item__label) {
    color: #303133;
  }
}

.gate-opening-control {
  :deep(.el-form-item__label) {
    color: #303133;
  }
}

.gate-external-monitor {
  .video-display-area {
    position: relative;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    
    .video-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }
    
    .video-status-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    color: #303133;
    font-weight: 600;
  }
}

/* Element Plus 默认主题样式 */
:deep(.el-divider--vertical) {
  border-color: #e4e7ed;
}
</style>