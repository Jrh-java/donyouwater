<template>
  <div class="gate-control-container">
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
           <!-- 一号闸口状态图片 -->
           <img v-show="gate1Info && gate1Info.controlStatus === '1'" src="/src/assets/images/gate-up.png" alt="闸门-开启" class="gate-status-up gate-1" />
           <img v-show="gate1Info && gate1Info.controlStatus === '2'" src="/src/assets/images/gate-down.png" alt="闸门-关闭" class="gate-status-down gate-1" />
           <img v-show="gate1Info && gate1Info.controlStatus === '3'" src="/src/assets/images/gate-stop.png" alt="闸门-停止" class="gate-status-stop gate-1" />
           
           <!-- 二号闸口状态图片 -->
           <img v-show="gate2Info && gate2Info.controlStatus === '1'" src="/src/assets/images/gate-up.png" alt="闸门-开启" class="gate-status-up gate-2" />
           <img v-show="gate2Info && gate2Info.controlStatus === '2'" src="/src/assets/images/gate-down.png" alt="闸门-关闭" class="gate-status-down gate-2" />
           <img v-show="gate2Info && gate2Info.controlStatus === '3'" src="/src/assets/images/gate-stop.png" alt="闸门-停止" class="gate-status-stop gate-2" />
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
        <!-- 闸口选择和开度控制 -->
        <div class="gate-control-section" style="margin: 20px 0;">
          <el-form :inline="true" :model="gateOpeningForm">
            <el-form-item label="选择闸口:" style="font-size: 16px;">
              <el-select v-model="selectedGatePort" placeholder="请选择闸口" style="width: 200px;" :teleported="false"
                @change="handleGatePortChange">
                <el-option v-for="option in gatePortOptions" :key="option.value" :label="option.label"
                  :value="option.value"></el-option>
              </el-select>
            </el-form-item>
            <!-- 单个闸口开度控制 -->
            <el-form-item v-if="selectedGatePort !== 'ALL_GATES'" label="闸口开度:" style="font-size: 16px;">
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
            <!-- 全部闸口开度控制 -->
            <template v-if="selectedGatePort === 'ALL_GATES'">
              <el-form-item label="一号闸口:" style="font-size: 16px;">
                <el-input 
                  v-model.number="gateOpeningForm.gate1OpeningValue" 
                  type="number" 
                  :min="0" 
                  :max="100" 
                  placeholder="请输入一号闸口开度"
                  style="width: 200px;" 
                  @input="handleGate1OpeningValueInput"
                >
                  <template #suffix>
                    <span>%</span>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="二号闸口:" style="font-size: 16px;">
                <el-input 
                  v-model.number="gateOpeningForm.gate2OpeningValue" 
                  type="number" 
                  :min="0" 
                  :max="100" 
                  placeholder="请输入二号闸口开度"
                  style="width: 200px;" 
                  @input="handleGate2OpeningValueInput"
                >
                  <template #suffix>
                    <span>%</span>
                  </template>
                </el-input>
              </el-form-item>
            </template>
          </el-form>
          <!-- 按钮区域 -->
          <div style="text-align: center; margin-top: 10px;">
            <el-button type="primary" @click="showConfirmationDialog('opening')"
              :disabled="isExecuteButtonDisabled"
              :loading="gateOpeningLoading">
              执行
            </el-button>
            <el-button type="warning" @click="stopGate"
              :disabled="isStopButtonDisabled">停闸</el-button>
          </div>
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
        </div>
        <div class="gate-external-monitor">
          <!-- 多视频播放区域 -->
          <div class="multi-video-display-area">
            <div v-if="videoPlayers.length === 0" class="video-placeholder">
              <div style="text-align: center; color: #999;">
                <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                <div style="font-size: 16px;">暂无视频播放</div>
              </div>
            </div>
            <div v-else class="video-grid" :class="getVideoGridClass()">
              <div v-for="(player, index) in videoPlayers" :key="player.deviceCode" class="video-container">
                <div class="video-header">
                  <span class="video-title">{{ player.deviceName }}</span>
                  <!-- <el-button type="danger" size="small" @click="removeVideoPlayer(index)">关闭</el-button> -->
                </div>
                <video :ref="el => setVideoRef(el, index)" class="video-player" controls muted autoplay
                  style="width: 100%; height: 100%; background-color: #000;">
                  您的浏览器不支持视频播放
                </video>
                <div class="video-status-overlay">
                  <span v-if="player.connectTime">连接时间: {{ player.connectTime }}</span>
                </div>
              </div>
            </div>
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

    <!-- 水泵数据弹窗 -->
    <el-dialog title="水泵数据" v-model="showPumpDialog" width="80%" :lock-scroll="false">
      <!-- 搜索条件 -->
      <div class="pump-search-section">
        <el-form :inline="true" :model="pumpSearchForm" class="pump-search-form">
          <el-form-item label="水泵编码/水泵名称/水泵地址:">
            <el-input v-model="pumpSearchForm.keyword" placeholder="" style="width: 250px;" clearable />
          </el-form-item>
          <el-form-item label="监测时间:">
            <el-date-picker v-model="pumpSearchForm.monitorTime" type="date" placeholder="请选择" style="width: 180px;"
              :teleported="false" clearable />
          </el-form-item>
          <el-form-item label="水泵状态:">
            <el-select v-model="pumpSearchForm.status" placeholder="全部" style="width: 120px;" :teleported="false"
              clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="在线" value="online"></el-option>
              <el-option label="离线" value="offline"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 水泵数据表格 -->
      <div class="pump-table-section">
        <el-table :data="pumpDataList" style="width: 100%" v-loading="pumpLoading">
          <el-table-column type="index" width="80" label="序号" />
          <el-table-column prop="monitorTime" label="监测时间" />
          <el-table-column prop="pumpCode" label="水泵编码" />
          <el-table-column prop="pumpName" label="水泵名称" />
          <el-table-column prop="pumpLocation" label="水泵地点" />
          <el-table-column prop="instantFlow" label="瞬时流量(m³/s)" />
          <el-table-column prop="totalFlow" label="累计流量(m³/s)" />
          <el-table-column prop="waterLevel" label="水位(m)" />
          <el-table-column prop="pressure" label="压力(kPa)" />
          <el-table-column prop="status" label="水泵状态">
            <template #default="scope">
              <span class="pump-status">
                <span class="status-dot"
                  :style="{ backgroundColor: scope.row.status === 'online' ? '#52c41a' : '#ff4d4f' }"></span>
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

<style scoped lang="scss">
.gate-internal-monitor {
  position: relative;
  width: 100%;
  display: inline-block;

  .gate-info-overlay {
    position: absolute;
    top: 25px;
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
      order: 2; // 一号闸口显示在右侧
    }

    .gate-info-2 {
      order: 1; // 二号闸口显示在左侧
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
  .gate-status-up,
  .gate-status-down,
  .gate-status-stop {
    position: absolute;
    top: 45%;
    width: 50px;
    transition: transform 0.5s ease-in-out;
    &.gate-1 {
      left: 54%;
      transform: translateX(-50%) translateY(-45%);
    }
    &.gate-2 {
      left: 36%;
      transform: translateX(-50%) translateY(-45%);
    }
  }
}
</style>

<script setup>
import { ref, watch, computed, reactive, onMounted, onBeforeUnmount,nextTick } from 'vue';
import { Picture, VideoCamera, CaretRight } from '@element-plus/icons-vue';
import { ElMessage, ElDialog, ElInput, ElButton, ElDivider } from 'element-plus';
import { useStore } from '@/store/pinia';
import { gateOnOrOff, getMonitorDevicesByGateStationCodeApi, sendDeviceCommandApi, getDeviceManagementInfo, getGateExtInfo, getGateTaskList, taskSend, setGateOpeningRate, getGateControlCallback } from '@/api/reservoir';
import flvjs from 'flv.js';


const store = useStore();

// 闸门相关变量已移除，直接使用gateStationCode

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
  { label: '一号闸口', value: 'IRDA1.DEVICE.GATE.OPENING' },
  { label: '二号闸口', value: 'IRDA2.DEVICE.GATE.OPENING' },
  { label: '全部闸口', value: 'ALL_GATES' }
]);

// 设备编码（用于控制操作）
const controlDeviceCode = ref('');

// 视频播放相关
const cameraDevices = ref([]);
const selectedCameraDevice = ref('');
const videoElement = ref(null);
const flvPlayer = ref(null);
const videoUrl = ref('');
const connectionStatus = ref('未连接');
const connectTime = ref('');
const isPlaying = ref(false);

// 多视频播放相关
const videoPlayers = ref([]);
const videoRefs = ref([]);

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
  openingValue: null,
  gate1OpeningValue: null,
  gate2OpeningValue: null
});
const gateOpeningLoading = ref(false);

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

// 计算属性：获取一号闸口信息
const gate1Info = computed(() => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) return null;
  return gateExtInfo.value.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
});

// 计算属性：获取二号闸口信息
const gate2Info = computed(() => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) return null;
  return gateExtInfo.value.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');
});

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
    if (item.devpoint === 'IRDA1.DEVICE.GATE.OPENING') {
      // 闸门1
      gate1Position.value = calculateGatePosition(item.openingDegree || 0);
    } else if (item.devpoint === 'IRDA2.DEVICE.GATE.OPENING') {
      // 闸门2
      gate2Position.value = calculateGatePosition(item.openingDegree || 0);
    }
  });
};

// loadControlDataForReservoir函数已删除，不再需要获取闸门列表

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
          // 先添加"全部闸口"选项，然后添加具体闸口选项
          const specificGateOptions = extInfo.map((item, index) => ({
            label: item.devpoint.includes('IRDA2') ? '二号闸口' : '一号闸口',
            value: item.devpoint
          }));
          gatePortOptions.value = [
            ...specificGateOptions,
            { label: '全部闸口', value: 'ALL_GATES' }
          ];

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

  // 启动新的定时器，每10秒获取一次
  gateExtInfoTimer = setInterval(() => {
    fetchGateExtendedInfo(gateStationCode);
  }, 3000);
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

  if (selectedPort === 'ALL_GATES') {
    // 选择全部闸口时，使用一号闸口的信息作为全部闸口的情况信息
    const gate1Info = gateExtInfo.value.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
    currentGateInfo.value = gate1Info || null;
    // 只清空单个闸口的输入值，保留全部闸口的输入值
    gateOpeningForm.openingValue = null;
    console.log('选择全部闸口模式，使用一号闸口信息:', gate1Info);
  } else {
    // 根据选择的闸口找到对应的闸门信息
    const gateInfo = gateExtInfo.value.find(item => item.devpoint === selectedPort);
    if (gateInfo) {
      currentGateInfo.value = gateInfo;
      // 只清空全部闸口的输入值，保留单个闸口的输入值
      gateOpeningForm.gate1OpeningValue = null;
      gateOpeningForm.gate2OpeningValue = null;
      console.log('选择闸口:', selectedPort, '对应信息:', gateInfo);
    } else {
      currentGateInfo.value = null;
      console.warn('未找到对应闸口的信息:', selectedPort);
    }
  }
};

// 处理开度输入值变化
const handleOpeningValueInput = (value) => {
  // 确保输入值在0-100范围内
  if (value !== null && value !== undefined && value !== '') {
    const numValue = Number(value);
    if (numValue < 0) {
      gateOpeningForm.openingValue = 0;
    } else if (numValue > 100) {
      gateOpeningForm.openingValue = 100;
    }
  }
};

// 处理一号闸口开度输入值变化
const handleGate1OpeningValueInput = (value) => {
  if (value !== null && value !== undefined && value !== '') {
    const numValue = Number(value);
    if (numValue < 0) {
      gateOpeningForm.gate1OpeningValue = 0;
    } else if (numValue > 100) {
      gateOpeningForm.gate1OpeningValue = 100;
    }
  }
};

// 处理二号闸口开度输入值变化
const handleGate2OpeningValueInput = (value) => {
  if (value !== null && value !== undefined && value !== '') {
    const numValue = Number(value);
    if (numValue < 0) {
      gateOpeningForm.gate2OpeningValue = 0;
    } else if (numValue > 100) {
      gateOpeningForm.gate2OpeningValue = 100;
    }
  }
};

// 计算执行按钮是否禁用
const isExecuteButtonDisabled = computed(() => {
  if (!selectedGatePort.value) return true;
  
  if (selectedGatePort.value === 'ALL_GATES') {
    // 全部闸口模式：两个输入框都必须有有效值
    const gate1Valid = gateOpeningForm.gate1OpeningValue !== null && 
                      gateOpeningForm.gate1OpeningValue !== undefined && 
                      gateOpeningForm.gate1OpeningValue !== '';
    const gate2Valid = gateOpeningForm.gate2OpeningValue !== null && 
                      gateOpeningForm.gate2OpeningValue !== undefined && 
                      gateOpeningForm.gate2OpeningValue !== '';
    
    // 检查是否有任何闸口处于手动模式
    const gate1Info = gateExtInfo.value?.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
    const gate2Info = gateExtInfo.value?.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');
    const anyGateInManualMode = (gate1Info && String(gate1Info.isHandle) === '1.0') || 
                               (gate2Info && String(gate2Info.isHandle) === '1.0');
    
    return !gate1Valid || !gate2Valid || anyGateInManualMode;
  } else {
    // 单个闸口模式：原有逻辑
    const valueValid = gateOpeningForm.openingValue !== null && 
                      gateOpeningForm.openingValue !== undefined;
    const manualMode = currentGateInfo.value && String(currentGateInfo.value.isHandle) === '1.0';
    
    return !valueValid || manualMode;
  }
});

// 计算停闸按钮是否禁用
const isStopButtonDisabled = computed(() => {
  if (!selectedGatePort.value) return true;
  
  if (selectedGatePort.value === 'ALL_GATES') {
    // 全部闸口模式：检查是否有任何闸口处于手动模式
    const gate1Info = gateExtInfo.value?.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
    const gate2Info = gateExtInfo.value?.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');
    const anyGateInManualMode = (gate1Info && String(gate1Info.isHandle) === '1.0') || 
                               (gate2Info && String(gate2Info.isHandle) === '1.0');
    
    return anyGateInManualMode;
  } else {
    // 单个闸口模式：原有逻辑
    const manualMode = currentGateInfo.value && String(currentGateInfo.value.isHandle) === '1.0';
    return manualMode;
  }
});

// handleGateChange函数已删除，不再需要闸门选择功能

// 获取摄像设备列表
const fetchCameraDevices = async (gateStationCode) => {
  try {
    const devices = await getMonitorDevicesByGateStationCodeApi(gateStationCode);
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

// 处理多个摄像设备变化（新增函数）
const handleMultipleCameraDeviceChange = async (devices) => {
  if (!devices || devices.length === 0) {
    console.log('没有摄像设备');
    return;
  }

  // 清空现有的视频播放器
  cleanup();
  videoPlayers.value = [];
  videoRefs.value = [];

  console.log('开始播放多个摄像设备视频:', devices);

  // 为每个设备创建视频播放器
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    const player = {
      deviceCode: device.deviceCode,
      deviceName: device.deviceName,
      flvPlayer: null,
      connectTime: '',
      videoUrl: ''
    };
    
    videoPlayers.value.push(player);
    
    // 等待DOM更新后初始化播放器
    await nextTick();
    
    // 发送控制命令并初始化播放器
    await sendControlCommandForDevice(device.deviceCode, i);
  }
};

// 为特定设备发送控制命令（新增函数）
const sendControlCommandForDevice = async (deviceCode, playerIndex) => {
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

    console.log(`发送摄像设备 ${deviceCode} 控制命令`);
    const result = await sendDeviceCommandApi(topic, payloadStr);
    console.log('发送控制命令结果:', result);

    if (result === "发送取流命令成功！") {
      // 构建FLV视频流地址
      const flvUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${deviceCode}`;
      console.log('准备播放FLV流:', flvUrl);

      // 更新播放器信息
      if (videoPlayers.value[playerIndex]) {
        videoPlayers.value[playerIndex].videoUrl = flvUrl;
        videoPlayers.value[playerIndex].connectTime = new Date().toLocaleTimeString();
      }

      // 等待2秒让设备准备好，然后初始化播放器
      setTimeout(() => {
        initFLVPlayerForDevice(flvUrl, playerIndex);
      }, 2000);
    } else {
      ElMessage.error(`摄像设备 ${deviceCode} 控制失败`);
    }
  } catch (error) {
    console.error(`发送控制命令失败:`, error);
    ElMessage.error(`摄像设备 ${deviceCode} 控制失败`);
  }
};

// 为特定设备初始化FLV播放器（新增函数）
const initFLVPlayerForDevice = async (videoUrl, playerIndex) => {
  try {
    // 等待video元素准备就绪
    await nextTick();
    
    const videoElement = videoRefs.value[playerIndex];
    if (!videoElement) {
      console.error(`视频元素未找到，索引: ${playerIndex}`);
      return;
    }

    if (!videoUrl) {
      console.error('视频URL为空');
      return;
    }

    console.log(`初始化FLV播放器 ${playerIndex}:`, videoUrl);

    if (flvjs.isSupported()) {
      // 如果已有播放器，先销毁
      if (videoPlayers.value[playerIndex] && videoPlayers.value[playerIndex].flvPlayer) {
        const existingPlayer = videoPlayers.value[playerIndex].flvPlayer;
        try {
          if (!existingPlayer.destroyed) {
            existingPlayer.pause();
            existingPlayer.unload();
            existingPlayer.detachMediaElement();
            existingPlayer.destroy();
          }
        } catch (e) {
          console.warn(`销毁已有播放器 ${playerIndex} 时出错:`, e);
        }
        videoPlayers.value[playerIndex].flvPlayer = null;
      }

      const player = flvjs.createPlayer({
        type: 'flv',
        url: videoUrl,
        isLive: true,
        hasAudio: false,
        hasVideo: true,
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: 128,
        autoCleanupSourceBuffer: true
      });

      // 绑定到video元素
      player.attachMediaElement(videoElement);

      // 事件监听
      player.on(flvjs.Events.LOADING_COMPLETE, () => {
        console.log(`播放器 ${playerIndex} 加载完成`);
      });

      player.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
        console.log(`播放器 ${playerIndex} 媒体信息:`, mediaInfo);
      });

      player.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
        console.error(`播放器 ${playerIndex} 错误:`, errorType, errorDetail, errorInfo);
        
        let errorMessage = '视频播放失败';
        let shouldReconnect = false;

        if (errorType === 'MediaError') {
          if (errorDetail === 'FormatUnsupported') {
            errorMessage = `播放器 ${playerIndex} 视频格式不支持，请检查视频流地址`;
          } else if (errorDetail === 'NetworkError') {
            errorMessage = `播放器 ${playerIndex} 网络连接失败，正在尝试重连...`;
            shouldReconnect = true;
          }
        } else if (errorType === 'NetworkError') {
          // 检测到网络错误，可能是自动断流
          errorMessage = `播放器 ${playerIndex} 视频流已断开，正在尝试重连...`;
          shouldReconnect = true;
        }

        if (shouldReconnect && videoPlayers.value[playerIndex]) {
          const deviceCode = videoPlayers.value[playerIndex].deviceCode;
          console.log(`检测到播放器 ${playerIndex} 自动断流，尝试重连设备: ${deviceCode}`);
          ElMessage.warning(`播放器 ${playerIndex} 视频流已断开，正在尝试重连...`);

          // 清理当前播放器
          if (player && !player.destroyed) {
            try {
              player.pause();
              player.unload();
              player.detachMediaElement();
              player.destroy();
            } catch (e) {
              console.error(`清理播放器 ${playerIndex} 失败:`, e);
            }
          }

          // 延迟2秒后重新发送控制命令
          setTimeout(() => {
            if (videoPlayers.value[playerIndex] && deviceCode) {
              console.log(`重新发送控制命令给设备: ${deviceCode}`);
              sendControlCommandForDevice(deviceCode, playerIndex);
            }
          }, 2000);
        } else {
          ElMessage.error(errorMessage);
          // 移除失败的播放器
          if (videoPlayers.value[playerIndex]) {
            removeVideoPlayer(playerIndex);
          }
        }
      });

      // 加载并播放
      player.load();
      
      // 存储播放器实例
      if (videoPlayers.value[playerIndex]) {
        videoPlayers.value[playerIndex].flvPlayer = player;
      }

      // 尝试播放
      try {
        await videoElement.play();
        console.log(`播放器 ${playerIndex} 开始播放`);
      } catch (playError) {
        console.warn(`播放器 ${playerIndex} 自动播放失败:`, playError);
      }

    } else {
      console.error('浏览器不支持FLV播放');
      ElMessage.error('浏览器不支持FLV播放');
    }

  } catch (error) {
    console.error(`初始化播放器 ${playerIndex} 失败:`, error);
  }
};

// 设置视频元素引用（新增函数）
const setVideoRef = (el, index) => {
  if (el) {
    videoRefs.value[index] = el;
  }
};

// 移除视频播放器（新增函数）
const removeVideoPlayer = (index) => {
  if (videoPlayers.value[index] && videoPlayers.value[index].flvPlayer) {
    const player = videoPlayers.value[index].flvPlayer;
    try {
      if (!player.destroyed) {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
      }
    } catch (e) {
      console.warn(`移除播放器 ${index} 时出错:`, e);
    }
  }
  videoPlayers.value.splice(index, 1);
  videoRefs.value.splice(index, 1);
};

// 获取视频网格样式类（新增函数）
const getVideoGridClass = () => {
  const count = videoPlayers.value.length;
  if (count === 1) return 'single-video';
  if (count === 2) return 'dual-video';
  if (count <= 4) return 'quad-video';
  return 'multi-video';
};

// 处理摄像设备选择变化（保留原函数但标记为废弃）
const handleCameraDeviceChange = (deviceCode) => {
  console.warn('handleCameraDeviceChange 函数已废弃，请使用 handleMultipleCameraDeviceChange');
  // 为了兼容性，暂时保留但不执行任何操作
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

// 清理播放器资源
const cleanup = () => {
  // 清理原有的单个播放器
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

  // 清理多个播放器
  if (videoPlayers.value && videoPlayers.value.length > 0) {
    videoPlayers.value.forEach((player, index) => {
      if (player.flvPlayer) {
        try {
          if (!player.flvPlayer.destroyed) {
            player.flvPlayer.pause();
            player.flvPlayer.unload();
            player.flvPlayer.detachMediaElement();
            player.flvPlayer.destroy();
          }
        } catch (error) {
          console.error(`清理播放器 ${index} 失败:`, error);
        }
      }
    });
    videoPlayers.value = [];
    videoRefs.value = [];
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
  currentAction.value = action;
  if (action === 'open') {
    dialogTitle.value = '确认开闸';
  } else if (action === 'close') {
    dialogTitle.value = '确认关闸';
  } else if (action === 'opening') {
    dialogTitle.value = '闸口开度控制确认';
  }
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
    } else if (currentAction.value === 'opening') {
      executeGateOpening();
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
  console.log('执行全部开闸逻辑...');
  if (!controlDeviceCode.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }

  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) {
    ElMessage.error('未获取到闸门信息');
    return;
  }

  try {
    // 获取所有闸口信息
    const gate1Info = gateExtInfo.value.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
    const gate2Info = gateExtInfo.value.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');

    // 先开一号闸口
    if (gate1Info) {
      console.log('开启一号闸口...');
      // 根据选中的闸口确定devpoint
      let devpoint1 = 'IRDA1.DEVICE.GATE.PROGRESS';
      await setGateOpeningRate(controlDeviceCode.value, devpoint1, '100');
      console.log('一号闸口开启成功');
    }

    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 再开二号闸口
    if (gate2Info) {
      console.log('开启二号闸口...');
      // 根据选中的闸口确定devpoint
      let devpoint2 = 'IRDA2.DEVICE.GATE.PROGRESS';
      await setGateOpeningRate(controlDeviceCode.value, devpoint2, '100');
      console.log('二号闸口开启成功');
    }

    ElMessage.success('全部开闸操作成功');
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('全部开闸操作失败:', error);
    ElMessage.error('全部开闸操作失败');
  }
};

const closeGateLogic = async () => {
  console.log('执行全部关闸逻辑...');
  if (!controlDeviceCode.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }

  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) {
    ElMessage.error('未获取到闸门信息');
    return;
  }

  try {
    // 获取所有闸口信息
    const gate1Info = gateExtInfo.value.find(item => item.devpoint === 'IRDA1.DEVICE.GATE.OPENING');
    const gate2Info = gateExtInfo.value.find(item => item.devpoint === 'IRDA2.DEVICE.GATE.OPENING');

    // 同时关闭所有闸口
    const closePromises = [];

    if (gate1Info) {
      console.log('关闭一号闸口...');
      // 根据选中的闸口确定devpoint
      let devpoint1 = 'IRDA1.DEVICE.GATE.PROGRESS';
      closePromises.push(setGateOpeningRate(controlDeviceCode.value, devpoint1, '0'));
    }

    if (gate2Info) {
      console.log('关闭二号闸口...');
      // 根据选中的闸口确定devpoint
      let devpoint2 = 'IRDA2.DEVICE.GATE.PROGRESS';
      closePromises.push(setGateOpeningRate(controlDeviceCode.value, devpoint2, '0'));
    }

    // 等待所有关闸操作完成
    await Promise.all(closePromises);

    ElMessage.success('全部关闸操作成功');
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('全部关闸操作失败:', error);
    ElMessage.error('全部关闸操作失败');
  }
};

const stopGate = async () => {
  if (!controlDeviceCode.value || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }

  try {
    if (selectedGatePort.value === 'ALL_GATES') {
      // 全部闸口模式：同时停止两个闸口
      const operations = [
        {
          devpoint: 'IRDA1.DEVICE.GATE.OPENING',
          name: '一号闸口'
        },
        {
          devpoint: 'IRDA2.DEVICE.GATE.OPENING',
          name: '二号闸口'
        }
      ];

      let successCount = 0;
      let errorMessages = [];

      // 并行执行两个闸口的停止指令
      const promises = operations.map(async (op) => {
        try {
          const stopPayload = {
            devpoint: op.devpoint,
            controlVal: '3' // 停止
          };
          await gateOnOrOff(controlDeviceCode.value, JSON.stringify(stopPayload));
          successCount++;
          return { success: true, name: op.name };
        } catch (error) {
          console.error(`${op.name}停闸操作失败:`, error);
          errorMessages.push(`${op.name}停闸失败`);
          return { success: false, name: op.name };
        }
      });

      await Promise.all(promises);

      // 显示执行结果
      if (successCount === 2) {
        ElMessage.success('全部闸口停闸操作成功');
      } else if (successCount === 1) {
        ElMessage.warning(`部分闸口停闸成功。错误信息: ${errorMessages.join('; ')}`);
      } else {
        ElMessage.error(`全部闸口停闸失败。错误信息: ${errorMessages.join('; ')}`);
      }
    } else {
      // 单个闸口模式：原有逻辑
      const stopPayload = {
        devpoint: selectedGatePort.value,
        controlVal: '3' // 停止
      };
      await gateOnOrOff(controlDeviceCode.value, JSON.stringify(stopPayload));
      ElMessage.success('停闸操作成功');
    }
    
    // 更新闸门状态
    await refreshGateStatus();
  } catch (error) {
    console.error('停闸操作失败:', error);
    ElMessage.error('停闸操作失败');
  }
};

// 刷新闸门状态
const refreshGateStatus = async () => {
  const currentNode = selectedDamNode.value;
  if (currentNode && currentNode.gateStationCode) {
    // 只刷新闸门扩展信息，不重新获取摄像设备列表
    await fetchGateExtendedInfo(currentNode.gateStationCode);
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
  // 停止之前的定时器
  stopGateExtInfoTimer();

  // 清空视频相关状态
  cameraDevices.value = [];
  selectedCameraDevice.value = '';
  cleanup();

  // 清空表单数据（切换节点时才清空）
  gateOpeningForm.openingValue = null;
  gateOpeningForm.gate1OpeningValue = null;
  gateOpeningForm.gate2OpeningValue = null;

  if (newNode) {
    console.log('Control页面: 检测到选中节点变化', newNode);

    // 获取设备管理信息和闸门扩展信息
    if (newNode.gateStationCode) {
      await fetchGateExtendedInfo(newNode.gateStationCode);
      await fetchControlDeviceCode(newNode.gateStationCode);
      
      // 获取摄像设备列表
      await fetchCameraDevices(newNode.gateStationCode);
      
      // 查询完成后自动播放所有摄像设备的视频
      if (cameraDevices.value && cameraDevices.value.length > 0) {
        console.log('自动播放摄像设备视频，设备数量:', cameraDevices.value.length);
        // 自动播放所有摄像设备
        await handleMultipleCameraDeviceChange(cameraDevices.value);
      }
      
      // 启动定时器
      startGateExtInfoTimer(newNode.gateStationCode);
    }

    // 加载任务列表
    await loadTaskList();
  } else {
    // 清空数据
    gateExtInfo.value = null;
    selectedGatePort.value = '';
    currentGateInfo.value = null;
    taskList.value = [];
    // 重置闸门位置
    gate1Position.value = -45;
    gate2Position.value = -45;
  }
}, { immediate: true });

// 获取任务类型标签
const getTaskTypeLabel = (taskType) => {
  const option = taskTypeOptions.value.find(opt => opt.value === taskType);
  return option ? option.label : taskType;
};

// 执行闸口开度控制
const executeGateOpening = async () => {
  if (!selectedGatePort.value) {
    ElMessage.warning('请选择闸口');
    return;
  }

  if (!controlDeviceCode.value) {
    ElMessage.warning('未获取到设备编码');
    return;
  }

  try {
    gateOpeningLoading.value = true;

    if (selectedGatePort.value === 'ALL_GATES') {
      // 全部闸口模式：同时控制两个闸口
      if (gateOpeningForm.gate1OpeningValue === null || gateOpeningForm.gate1OpeningValue === undefined ||
          gateOpeningForm.gate2OpeningValue === null || gateOpeningForm.gate2OpeningValue === undefined) {
        ElMessage.warning('请为一号和二号闸口都输入开度值');
        return;
      }

      const operations = [
        {
          devpoint: 'IRDA1.DEVICE.GATE.PROGRESS',
          value: gateOpeningForm.gate1OpeningValue.toString(),
          name: '一号闸口'
        },
        {
          devpoint: 'IRDA2.DEVICE.GATE.PROGRESS',
          value: gateOpeningForm.gate2OpeningValue.toString(),
          name: '二号闸口'
        }
      ];

      let successCount = 0;
      let errorMessages = [];

      // 并行执行两个闸口的控制指令
      const promises = operations.map(async (op) => {
        try {
          await setGateOpeningRate(controlDeviceCode.value, op.devpoint, op.value);
          
          // 检查指令发送结果
          try {
            // 等待1秒后再获取回调结果
            await new Promise(resolve => setTimeout(resolve, 2000));
            const callbackResult = await getGateControlCallback(controlDeviceCode.value, op.devpoint);
            if (callbackResult === "1") {
              successCount++;
              return { success: true, name: op.name };
            } else {
              errorMessages.push(`${op.name}控制指令发送失败`);
              return { success: false, name: op.name };
            }
          } catch (callbackError) {
            console.error(`获取${op.name}指令回调结果失败:`, callbackError);
            errorMessages.push(`${op.name}指令已发送，但无法确认执行状态`);
            return { success: false, name: op.name };
          }
        } catch (error) {
          console.error(`${op.name}开度控制失败:`, error);
          errorMessages.push(`${op.name}开度控制失败: ${error.message || '未知错误'}`);
          return { success: false, name: op.name };
        }
      });

      await Promise.all(promises);

      // 显示执行结果
      if (successCount === 2) {
        ElMessage.success('全部闸口开度控制指令发送成功');
        // 只有全部成功时才清空输入框
        gateOpeningForm.gate1OpeningValue = null;
        gateOpeningForm.gate2OpeningValue = null;
      } else if (successCount === 1) {
        ElMessage.warning(`部分闸口控制成功。错误信息: ${errorMessages.join('; ')}`);
        // 部分成功时不清空输入框，让用户可以重试失败的部分
      } else {
        ElMessage.error(`全部闸口控制失败。错误信息: ${errorMessages.join('; ')}`);
        // 全部失败时不清空输入框，让用户可以重试
      }

    } else {
      // 单个闸口模式：原有逻辑
      if (gateOpeningForm.openingValue === null || gateOpeningForm.openingValue === undefined) {
        ElMessage.warning('请输入开度值');
        return;
      }

      // 根据选中的闸口确定devpoint
      let devpoint = '';
      if (selectedGatePort.value === 'IRDA1.DEVICE.GATE.OPENING') {
        devpoint = 'IRDA1.DEVICE.GATE.PROGRESS';
      } else if (selectedGatePort.value === 'IRDA2.DEVICE.GATE.OPENING') {
        devpoint = 'IRDA2.DEVICE.GATE.PROGRESS';
      } else {
        ElMessage.error('无效的闸口选择');
        return;
      }

      // 调用封装的接口发送控制指令
      await setGateOpeningRate(controlDeviceCode.value, devpoint, gateOpeningForm.openingValue.toString());

      // 检查指令发送结果
      try {
         await new Promise(resolve => setTimeout(resolve, 2000));
        const callbackResult = await getGateControlCallback(controlDeviceCode.value, devpoint);
        if (callbackResult === "1") {
          ElMessage.success('闸口开度控制指令发送成功');
          // 只有成功时才清空输入框
          gateOpeningForm.openingValue = null;
        } else {
          ElMessage.error('闸口开度控制指令发送失败');
          // 失败时不清空输入框，让用户可以重试
        }
      } catch (callbackError) {
        console.error('获取指令回调结果失败:', callbackError);
        ElMessage.warning('指令已发送，但无法确认执行状态');
        // 无法确认状态时不清空输入框
      }
    }

  } catch (error) {
    console.error('闸口开度控制失败:', error);
    ElMessage.error('闸口开度控制失败: ' + (error.message || '未知错误'));
  } finally {
    gateOpeningLoading.value = false;
  }
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
    await loadControlDataForReservoir(selectedDamNode.value);
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

.gate-control-container>.el-row {
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

.content-col>.el-card[shadow="never"] {
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
  position: relative;
  margin-bottom: 20px;
  text-align: center;

  // width:100%;
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
  z-index: 1000;
  position:absolute;
  top: 100px;  
  left: 10px;
  width:85px;
  text-align: center;
  // margin-top: auto; /* Push to bottom of flex column */
  padding-top: 30px;
  display: flex;
  gap:15px;
  flex-direction: column;
  /* Space above buttons */
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

// 多视频播放区域样式
.multi-video-display-area {
  position: relative;
  width: 100%;
  min-height: 450px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.video-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  height: 100%;
  
  &.single-video {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    // height: 900px;
  }
  
  &.dual-video {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    // height: 450px;
  }
  
  &.quad-video {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: 450px;
  }
  
  &.multi-video {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 200px;
    height: auto;
    // min-height: 450px;
  }
}

.video-container {
  position: relative;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
  min-height: 450px;
  .video-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
    color: white;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
    
    .video-title {
      font-size: 12px;
      font-weight: 500;
    }
    
    .el-button {
      padding: 2px 6px;
      font-size: 10px;
      height: auto;
      line-height: 1.2;
    }
  }
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
  bottom: 10px;
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