<template>
  <div class="gate-control-container">
    <el-row :gutter="20">
      <!-- Left Side -->
      <el-col :span="10" class="content-col">
        <div class="column-header">
          <span>闸门名称: {{ selectedGate ? selectedGate.gateName : '' }}</span>
          <!-- 添加闸门选择下拉框 -->
          <el-select 
            v-model="selectedGateId" 
            placeholder="请选择闸门" 
            style="width: 200px;"
            :disabled="!gateList.length"
            @change="handleGateChange"
            :teleported="false"
          >
            <el-option 
              v-for="item in gateList" 
              :key="item.id" 
              :label="item.gateName" 
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
          <div class="gate-internal-monitor">
            <!-- Three.js 3D模型显示 -->
            <ThreeModelViewer 
              :model-path="'/glb/zhazhan.glb'"
              width="100%"
              height="400px"
              @model-loaded="onModelLoaded"
              @model-error="onModelError"
              @load-progress="onLoadProgress"
            />
          </div>
          <!-- 闸口选择 -->
          <div class="gate-port-selection" style="margin: 20px 0;">
            <el-form-item label="选择闸口:">
              <el-select 
                v-model="selectedGatePort" 
                placeholder="请选择闸口" 
                style="width: 200px;"
                :teleported="false"
                :disabled="!selectedGateId"
                @change="handleGatePortChange"
              >
                <el-option 
                  v-for="option in gatePortOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
          
          <el-descriptions title="闸门情况" :column="2" border class="gate-status-info">
             <el-descriptions-item label="当前开度">{{ currentGateInfo ? currentGateInfo.openingDegree : '0' }} %</el-descriptions-item>
             <el-descriptions-item label="闸板高度">{{ currentGateInfo ? currentGateInfo.gateHeight : '0' }} 米</el-descriptions-item>
             <el-descriptions-item label="闸门控制">
               <el-tag :type="currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? 'success' : 'warning'">
                 {{ currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? '自动可远程' : '手动' }}
               </el-tag>
             </el-descriptions-item>
             <el-descriptions-item label="最新时间">{{ currentGateInfo ? currentGateInfo.crtTime : '--' }} </el-descriptions-item>
           </el-descriptions>
          <div class="gate-controls">
            <el-button type="primary" @click="showConfirmationDialog('open')" :disabled="!selectedGateId || !selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')">开闸</el-button>
            <el-button type="danger" @click="showConfirmationDialog('close')" :disabled="!selectedGateId || !selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')">关闸</el-button>
            <el-button type="warning" @click="stopGate" :disabled="!selectedGateId || !selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')">停闸</el-button>
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
          <el-select 
            v-model="selectedCameraDevice" 
            placeholder="请选择摄像枪" 
            style="width: 200px;"
            :disabled="!cameraDevices.length"
            @change="handleCameraDeviceChange"
            :teleported="false"
          >
            <el-option
              v-for="device in cameraDevices"
              :key="device.deviceCode"
              :label="device.deviceName"
              :value="device.deviceCode"
            ></el-option>
          </el-select>
        </div>
        <div v-if="!selectedGateId" class="camera-tip">
          请先选择闸门
        </div>
        <div v-else-if="!cameraDevices.length" class="camera-tip">
          该闸门暂无摄像设备
        </div>
          <div class="gate-external-monitor">
            <!-- 视频播放区域 -->
            <div class="video-display-area">
              <video 
                ref="videoElement"
                class="video-player"
                controls
                muted
                autoplay
                style="width: 100%; height: 450px; background-color: #000;"
              >
                您的浏览器不支持视频播放
              </video>
              <div v-if="!videoUrl" class="video-placeholder">
                <div style="text-align: center; color: #999;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                  <div style="font-size: 16px;">请选择摄像枪查看视频</div>
                </div>
              </div>
              <div class="video-status-overlay">
                <span>连接状态: {{ connectionStatus }}</span>
                <span v-if="connectTime">连接时间: {{ connectTime }}</span>
              </div>
            </div>
            <div style="text-align: left; margin-top: 5px;">
              <el-tag type="success"><el-icon><CaretRight /></el-icon> 实时视频</el-tag>
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

    <!-- Confirmation Dialog -->
    <el-dialog
    :lockScroll="false"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"

    >
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
    <el-dialog
      title="添加任务"
      v-model="showAddTaskDialogVisible"
      width="400px"
      :lock-scroll="false"
    >
      <el-form :model="addTaskForm" label-width="100px">
        <el-form-item label="任务时间:">
          <el-select 
            v-model="addTaskForm.taskType" 
            placeholder="请选择任务时间"
            style="width: 100%;"
            :teleported="false"
          >
            <el-option 
              v-for="option in taskTypeOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value"
            ></el-option>
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

    <!-- 水泵数据弹窗 -->
    <el-dialog
      title="水泵数据"
      v-model="showPumpDialog"
      width="80%"
      :lock-scroll="false"
    >
      <!-- 搜索条件 -->
      <div class="pump-search-section">
        <el-form :inline="true" :model="pumpSearchForm" class="pump-search-form">
          <el-form-item label="水泵编码/水泵名称/水泵地址:">
            <el-input 
              v-model="pumpSearchForm.keyword" 
              placeholder=""
              style="width: 250px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="监测时间:">
            <el-date-picker
              v-model="pumpSearchForm.monitorTime"
              type="date"
              placeholder="请选择"
              style="width: 180px;"
              :teleported="false"
              clearable
            />
          </el-form-item>
          <el-form-item label="水泵状态:">
            <el-select 
              v-model="pumpSearchForm.status" 
              placeholder="全部"
              style="width: 120px;"
              :teleported="false"
              clearable
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="在线" value="online"></el-option>
              <el-option label="离线" value="offline"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 水泵数据表格 -->
      <div class="pump-table-section">
        <el-table 
          :data="pumpDataList" 
          style="width: 100%"
          v-loading="pumpLoading"
           
        >
          <el-table-column type="index" width="80" label="序号" />
          <el-table-column prop="monitorTime" label="监测时间"  />
          <el-table-column prop="pumpCode" label="水泵编码"  />
          <el-table-column prop="pumpName" label="水泵名称"  />
          <el-table-column prop="pumpLocation" label="水泵地点"  />
          <el-table-column prop="instantFlow" label="瞬时流量(m³/s)"  />
          <el-table-column prop="totalFlow" label="累计流量(m³/s)"  />
          <el-table-column prop="waterLevel" label="水位(m)"  />
          <el-table-column prop="pressure" label="压力(kPa)"  />
          <el-table-column prop="status" label="水泵状态" >
            <template #default="scope">
              <span class="pump-status">
                <span 
                  class="status-dot"
                  :style="{ backgroundColor: scope.row.status === 'online' ? '#52c41a' : '#ff4d4f' }"
                ></span>
                {{ scope.row.status === 'online' ? '在线' : '离线' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePumpDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted, onBeforeUnmount } from 'vue';
import { Picture, VideoCamera, CaretRight } from '@element-plus/icons-vue';
import { ElMessage, ElDialog, ElInput, ElButton, ElDivider } from 'element-plus';
import { useStore } from '@/store/pinia';
import { getGateByStationCode, getGateDetail, gateOnOrOff, getCameraDevicesByGateCode, sendDeviceCommandApi, getDeviceManagementInfo, getGateExtInfo, getGateTaskList, taskSend } from '@/api/reservoir';
import flvjs from 'flv.js';
import ThreeModelViewer from './controlComponents/ThreeModelViewer.vue';

const store = useStore();

// 闸门列表和选中的闸门
const gateList = ref([]);
const selectedGateId = ref('');
const selectedGate = ref(null);

// 闸门扩展信息
const gateExtInfo = ref(null);

// 定时器
let gateExtInfoTimer = null;

// 当前选中闸口的闸门信息
const currentGateInfo = ref(null);

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

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

// 根据选中的水库加载闸门管理数据
const loadControlDataForReservoir = async (reservoirNode) => {
  console.log('Control页面: 为水库加载闸门管理数据', reservoirNode);
  if (reservoirNode && reservoirNode.gateStationCode) {
    try {
      // 获取闸门列表
      const res = await getGateByStationCode({ id: reservoirNode.gateStationCode });
      if (res && Array.isArray(res)) {
        gateList.value = res;
        // 重置选中的闸门
        selectedGateId.value = '';
        selectedGate.value = null;
        gateExtInfo.value = null;
        selectedGatePort.value = '';
        currentGateInfo.value = null;
      } else {
        gateList.value = [];
        ElMessage.warning('未获取到闸门列表数据');
      }
    } catch (error) {
      console.error('获取闸门列表失败:', error);
      ElMessage.error('获取闸门列表失败');
      gateList.value = [];
    }
  } else {
    gateList.value = [];
  }
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
          gatePortOptions.value = extInfo.map((item, index) => ({
            label: item.devpoint.includes('IRDA2') ? '二号闸口' : '一号闸口',
            value: item.devpoint
          }));
          
          // 默认选择第一个闸口
          if (gatePortOptions.value.length > 0) {
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
  
  // 启动新的定时器，每10秒获取一次
  gateExtInfoTimer = setInterval(() => {
    fetchGateExtendedInfo(gateStationCode);
  }, 10000);
};

// 停止闸门扩展信息定时器
const stopGateExtInfoTimer = () => {
  if (gateExtInfoTimer) {
    clearInterval(gateExtInfoTimer);
    gateExtInfoTimer = null;
  }
};

// 获取控制设备编码
const fetchControlDeviceCode = async (gateStationCode) => {
  try {
    // 获取设备管理信息（设备类别5）
    const deviceInfo = await getDeviceManagementInfo(gateStationCode, 5);
    if (deviceInfo && deviceInfo.deviceCode) {
      controlDeviceCode.value = deviceInfo.deviceCode;
      console.log('获取到控制设备编码:', deviceInfo.deviceCode);
    }
  } catch (error) {
    console.error('获取控制设备编码失败:', error);
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

// 处理闸门选择变化
const handleGateChange = async (gateId) => {
  if (!gateId) {
    selectedGate.value = null;
    cameraDevices.value = [];
    selectedCameraDevice.value = '';
    cleanup();
    return;
  }
  
  try {
    // 获取闸门详情
    const res = await getGateDetail({ id: gateId });
    if (res) {
      selectedGate.value = res;
      
      // 获取摄像设备列表
      if (res.gateCode) {
        await fetchCameraDevices(res.gateCode);
      }
    } else {
      ElMessage.warning('未获取到闸门详情');
    }
  } catch (error) {
    console.error('获取闸门详情失败:', error);
    ElMessage.error('获取闸门详情失败');
  }
};

// 获取摄像设备列表
const fetchCameraDevices = async (gateCode) => {
  try {
    const devices = await getCameraDevicesByGateCode({ id: gateCode });
    cameraDevices.value = devices || [];
    selectedCameraDevice.value = '';
    cleanup();
    console.log('获取到摄像设备:', devices);
  } catch (error) {
    console.error('获取摄像设备失败:', error);
    ElMessage.error('获取摄像设备失败');
    cameraDevices.value = [];
  }
};

// 处理摄像设备选择变化
const handleCameraDeviceChange = (deviceCode) => {
  if (deviceCode) {
    console.log('选择摄像设备:', deviceCode);
    sendControlCommand(deviceCode);
  }
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
        if (errorType === 'MediaError') {
          if (errorDetail === 'FormatUnsupported') {
            errorMessage = '视频格式不支持，请检查视频流地址';
          } else if (errorDetail === 'NetworkError') {
            errorMessage = '网络连接失败，请检查网络状态';
          }
        }
        
        ElMessage.error(errorMessage);
        
        // 清理播放器
        cleanup();
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

// 清理播放器资源
const cleanup = () => {
  if (flvPlayer.value) {
    try {
      flvPlayer.value.pause();
      flvPlayer.value.unload();
      flvPlayer.value.detachMediaElement();
      flvPlayer.value.destroy();
    } catch (error) {
      console.error('清理播放器失败:', error);
    }
    flvPlayer.value = null;
  }
  
  videoUrl.value = '';
  isPlaying.value = false;
  connectionStatus.value = '未连接';
  connectTime.value = '';
};

// 移除不再使用的变量，现在使用gateExtInfo中的数据

// --- Confirmation Dialog Logic ---
const dialogVisible = ref(false);
const userAnswer = ref('');
const currentAction = ref(''); // 'open' or 'close'
const mathProblem = ref({ num1: 0, num2: 0, operator: '+', answer: 0, question: '' });
const dialogTitle = ref('');

// --- 水泵数据相关状态 ---
const showPumpDialog = ref(false);
const pumpLoading = ref(false);

// 水泵搜索表单
const pumpSearchForm = reactive({
  keyword: '',
  monitorTime: null,
  status: ''
});

// 水泵数据列表
const pumpDataList = ref([
  {
    id: 1,
    monitorTime: '2025-05-01 20:09:23',
    pumpCode: '0000000136',
    pumpName: '设备名称',
    pumpLocation: '设备地址',
    instantFlow: '0.15',
    totalFlow: '5120',
    waterLevel: '3',
    pressure: '12',
    status: 'online'
  },
  {
    id: 2,
    monitorTime: '2025-05-01 19:55:19',
    pumpCode: '0000000136',
    pumpName: '设备名称',
    pumpLocation: '设备地址',
    instantFlow: '0.15',
    totalFlow: '5120',
    waterLevel: '3',
    pressure: '12',
    status: 'offline'
  },
  {
    id: 3,
    monitorTime: '2025-05-01 19:51:52',
    pumpCode: '0000000136',
    pumpName: '设备名称',
    pumpLocation: '设备地址',
    instantFlow: '0.15',
    totalFlow: '5120',
    waterLevel: '3',
    pressure: '12',
    status: 'online'
  }
]);

const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const isAddition = Math.random() > 0.5;
  let question = '';
  let answer = 0;

  if (isAddition) {
    question = `${num1} + ${num2} = ?`;
    answer = num1 + num2;
    mathProblem.value = { num1, num2, operator: '+', answer, question };
  } else {
    // Ensure num1 is greater than or equal to num2 for subtraction to keep results positive and simple
    if (num1 < num2) {
      question = `${num2} - ${num1} = ?`;
      answer = num2 - num1;
    } else {
      question = `${num1} - ${num2} = ?`;
      answer = num1 - num2;
    }
    mathProblem.value = { num1: Math.max(num1, num2), num2: Math.min(num1, num2), operator: '-', answer, question };
  }
};

const showConfirmationDialog = (action) => {
  if (!selectedGateId.value) {
    ElMessage.warning('请先选择闸门');
    return;
  }
  
  currentAction.value = action;
  dialogTitle.value = action === 'open' ? '确认开闸' : '确认关闸';
  generateMathProblem();
  userAnswer.value = ''; // Clear previous answer
  dialogVisible.value = true;
};

const handleConfirm = () => {
  if (userAnswer.value === null || userAnswer.value.trim() === '') {
    ElMessage.error('请输入答案！');
    return;
  }
  if (parseInt(userAnswer.value, 10) === mathProblem.value.answer) {
    dialogVisible.value = false;
    if (currentAction.value === 'open') {
      openGateLogic();
    } else if (currentAction.value === 'close') {
      closeGateLogic();
    }
    // 成功消息已在各自的逻辑函数中处理
  } else {
    ElMessage.error('答案错误，请重试！');
    generateMathProblem(); // Generate a new problem
    userAnswer.value = ''; // Clear input for the new problem
    // The dialog remains open for the user to try again with the new problem
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
  ElMessage.info('操作已取消');
};

const openGateLogic = async () => {
  console.log('执行开闸逻辑...');
  if (!controlDeviceCode.value || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {
    // 先执行停闸操作
    console.log('开闸前先执行停闸操作...');
    const stopPayload = {
      devpoint: selectedGatePort.value,
      controlval: '3' // 停止
    };
    await gateOnOrOff(controlDeviceCode.value, JSON.stringify(stopPayload));
    
    // 等待一段时间确保停闸操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 执行开闸操作
    const openPayload = {
      devpoint: selectedGatePort.value,
      controlval: '1' // 开阀
    };
    await gateOnOrOff(controlDeviceCode.value, JSON.stringify(openPayload));
    ElMessage.success('开闸操作成功');
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('开闸操作失败:', error);
    ElMessage.error('开闸操作失败');
  }
};

const closeGateLogic = async () => {
  console.log('执行关闸逻辑...');
  if (!controlDeviceCode.value || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {
    // 先执行停闸操作
    console.log('关闸前先执行停闸操作...');
    const stopPayload = {
      devpoint: selectedGatePort.value,
      controlval: '3' // 停止
    };
    await gateOnOrOff(controlDeviceCode.value, JSON.stringify(stopPayload));
    
    // 等待一段时间确保停闸操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 执行关闸操作
    const closePayload = {
      devpoint: selectedGatePort.value,
      controlval: '2' // 关阀
    };
    await gateOnOrOff(controlDeviceCode.value, JSON.stringify(closePayload));
    ElMessage.success('关闸操作成功');
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('关闸操作失败:', error);
    ElMessage.error('关闸操作失败');
  }
};

const stopGate = async () => {
  if (!selectedGateId.value) {
    ElMessage.warning('请先选择闸门');
    return;
  }
  
  if (!controlDeviceCode.value || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {
    const stopPayload = {
      devpoint: selectedGatePort.value,
      controlval: '3' // 停止
    };
    await gateOnOrOff(controlDeviceCode.value, JSON.stringify(stopPayload));
    ElMessage.success('停闸操作成功');
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('停闸操作失败:', error);
    ElMessage.error('停闸操作失败');
  }
};

// 刷新闸门状态
const refreshGateStatus = async () => {
  if (selectedGateId.value) {
    await handleGateChange(selectedGateId.value);
  }
};

// --- End Confirmation Dialog Logic ---

// 任务计划相关方法
const loadTaskList = async () => {
  try {
    taskLoading.value = true;
    const res = await getGateTaskList();
    taskList.value = res || [];
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败');
    taskList.value = [];
  } finally {
    taskLoading.value = false;
  }
};

// 监听选中节点变化
watch(selectedDamNode, async (newNode, oldNode) => {
  if (newNode) {
    console.log('Control页面: 检测到选中节点变化', newNode);
    // 在这里可以根据选中的水库重新加载闸门管理数据
    loadControlDataForReservoir(newNode);
    
    // 获取设备管理信息和闸门扩展信息
    if (newNode.gateStationCode) {
      await fetchGateExtendedInfo(newNode.gateStationCode);
      await fetchControlDeviceCode(newNode.gateStationCode);
      // 启动定时器
      startGateExtInfoTimer(newNode.gateStationCode);
    }
    
    // 加载任务列表
    await loadTaskList();
  }
}, { immediate: true });

// 获取任务类型标签
const getTaskTypeLabel = (taskType) => {
  const option = taskTypeOptions.value.find(item => item.value === taskType);
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
    ElMessage.warning('请选择任务时间');
    return;
  }
  
  if (!controlDeviceCode.value) {
    ElMessage.error('缺少设备编码，请先选择闸门');
    return;
  }
  
  try {
    addTaskLoading.value = true;
    const payloadStr = JSON.stringify({
      tasksCode: addTaskForm.taskType,
      tasksEven: 'add'
    });
    
    await taskSend(controlDeviceCode.value, payloadStr);
    ElMessage.success('添加任务成功');
    showAddTaskDialogVisible.value = false;
    addTaskForm.taskType = '';
    // 重新加载任务列表
    await loadTaskList();
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
    const payloadStr = JSON.stringify({
      tasksCode: task.taskType,
      tasksEven: 'delete'
    });
    
    await taskSend(task.deviceCode, payloadStr);
    ElMessage.success('删除任务成功');
    // 重新加载任务列表
    await loadTaskList();
  } catch (error) {
    console.error('删除任务失败:', error);
    ElMessage.error('删除任务失败');
  }
};

const viewPumpData = () => {
  console.log('查看水泵数据...');
  showPumpDialog.value = true;
  pumpLoading.value = true;
  
  // 模拟加载数据
  setTimeout(() => {
    pumpLoading.value = false;
  }, 500);
};

// Three.js模型事件处理
const onModelLoaded = (data) => {
  console.log('3D模型加载成功:', data);
};

const onModelError = (error) => {
  console.error('3D模型加载失败:', error);
  ElMessage.error('3D模型加载失败');
};

const onLoadProgress = (progress) => {
  console.log('3D模型加载进度:', progress + '%');
};

const closePumpDialog = () => {
  showPumpDialog.value = false;
  // 重置搜索条件
  Object.assign(pumpSearchForm, {
    keyword: '',
    monitorTime: null,
    status: ''
  });
};

// 初始化加载
onMounted(async () => {
  if (selectedDamNode.value) {
    loadControlDataForReservoir(selectedDamNode.value);
    // 获取设备管理信息和闸门扩展信息
    if (selectedDamNode.value.gateStationCode) {
      await fetchGateExtendedInfo(selectedDamNode.value.gateStationCode);
      await fetchControlDeviceCode(selectedDamNode.value.gateStationCode);
      // 启动定时器
      startGateExtInfoTimer(selectedDamNode.value.gateStationCode);
    }
    // 加载任务列表
    await loadTaskList();
  }
});

// 发送停止取流命令
const sendStopStreamCommand = async (deviceCode) => {
  if (!deviceCode) return;
  
  try {
    const topic = `YN/0000/769834/control/${deviceCode}`;
    const payloadStr = JSON.stringify({
      "command": "config",
      "rtmpCtrl": {
        "rtmpEnable": 0,
        "rtmpServer": "119.3.245.90",
        "rtmpPort": 1935,
        "releaseTime": 5
      }
    });
    
    const result = await sendDeviceCommandApi(topic, payloadStr);
    console.log('发送停止取流命令结果:', result);
  } catch (error) {
    console.error('发送停止取流命令失败:', error);
  }
};



// 组件卸载时清理资源
onBeforeUnmount(async () => {
  console.log('GateControl组件卸载，清理资源');
  
  // 发送停止取流命令
  if (selectedCameraDevice.value) {
    await sendStopStreamCommand(selectedCameraDevice.value);
  }
  
  cleanup();
  // 清除定时器
  stopGateExtInfoTimer();
});

// Placeholder images should be placed in the public folder
// For example: public/placeholder-gate-internal.png and public/placeholder-gate-external.png


</script>


<style lang="scss" scoped>
.gate-control-container {
  padding: 20px;
  // min-height: calc(100vh - 90px); // Assuming 50px external header + 2x20px internal padding
  height: 100%; // Try to take full available height from parent
  box-sizing: border-box; // Ensure padding and border are included in the element's total width and height
  display: flex;
  flex-direction: column;
}

.gate-control-container > .el-row {
  flex-grow: 1;
  align-items: stretch; // Make columns equal height
}

.content-col {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5; // Mimic card border
}

.content-col > .el-card[shadow="never"] {
  border: none; // Remove border from inner cards if content-col has one
}

.divider-col {
  display: flex;
  align-items: stretch; // Make divider line stretch
  justify-content: center;
  // Apply padding that matches content-col's vertical padding if gutter is 0
  // If el-row has gutter, this col will also have it.
  // padding-top: 20px; 
  // padding-bottom: 20px;
}

.custom-divider {
  height: 100%;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  background-color: #f0f2f5;
  border-radius: 6px 6px 0 0;
  color: #333;
}

/* Keep original .card-header for inner cards if any */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gate-internal-monitor,
.gate-external-monitor {
  margin-bottom: 20px;
  text-align: center;
  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
    .el-icon {
      font-size: 30px;
      margin-right: 5px;
    }
  }
}

.gate-status-info {
  margin-bottom: 20px;
}

.gate-controls {
  text-align: center;
  // margin-top: auto; /* Push to bottom of flex column */
  padding-top: 30px; /* Space above buttons */
  .el-button {
    margin: 0 10px;
  }
}

.el-descriptions {
  margin-top: 20px;
}

.el-table {
  font-size: 13px;
}

/* 水泵数据弹窗样式 */
.pump-search-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.pump-search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 20px;
}

.pump-table-section {
  min-height: 300px;
}

.pump-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

/* 摄像枪选择提示样式 */
.camera-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-bottom: 15px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* 视频播放区域样式 */
.video-display-area {
  position: relative;
  width: 100%;
  height: 450px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.video-status-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
}

.video-status-overlay span {
  display: block;
  margin-bottom: 2px;
}

.video-status-overlay span:last-child {
  margin-bottom: 0;
}
</style>