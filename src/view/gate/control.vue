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
            <div class="video-grid video-grid-4">
              <div v-for="(videoUrl, index) in ys7VideoUrls" :key="`video-${index}`" class="video-container">
                <div class="video-header">
                  <span class="video-title">通道 {{ index + 1 }}</span>
                  <div class="video-status">
                    <span v-if="videoLoadingStates[index]" class="loading-text">加载中...</span>
                    <span v-else-if="videoUrl" class="connected-text">已连接</span>
                    <span v-else class="disconnected-text">未连接</span>
                  </div>
                </div>
                <div class="video-wrapper">
                  <div 
                    v-if="videoUrl" 
                    :id="`video-container-${index}`"
                    class="video-player" 
                    style="width: 100%; height: 100%; background-color: #000;"
                  >
                  </div>
                  <div v-else class="video-placeholder">
                    <div style="text-align: center; color: #999;">
                      <div style="font-size: 32px; margin-bottom: 8px;">📹</div>
                      <div style="font-size: 14px;">暂无视频</div>
                    </div>
                  </div>
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
import { gateOnOrOff, getMonitorDevicesByGateStationCodeApi, sendDeviceCommandApi, getDeviceManagementInfo, getGateExtInfo, getGateTaskList, taskSend, setGateOpeningRate } from '@/api/reservoir';
import flvjs from 'flv.js';
import { buildFlvUrl } from '@/utils/config';
import { generateLiveUrl } from '@/utils/generateLiveUrl';
import { getYs7TokenApi, getYs7LiveAddressApi, getYs7DeviceInfoApi, getYs7DeviceListApi } from '@/api/ys7';
// 引入 EZUIKit 播放器
import EZUIKit from "ezuikit-js";


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

// 闸站代码到闸站名称的映射
const CODE_TO_NAME_MAPPING = {
  'FJ.JODY.FH01.Z05.STATION': '松溪左岸1号闸站',
  'FJ.JODY.FH01.Z04.STATION': '松溪左岸2号闸站',
  'FJ.JODY.FH01.Z03.STATION': '松溪左岸3号闸站',
  'FJ.JODY.FH01.Z02.STATION': '松溪右岸1号闸站',
  'FJ.JODY.FH01.Z01.STATION': '松溪右岸2号闸站'
};

// 闸站名称到设备序列号的映射
const GATE_STATION_MAPPING = {
  '松溪左岸1号闸站': 'FT8680159',
  '松溪左岸2号闸站': 'FT4489510', 
  '松溪左岸3号闸站': 'FT8680213',
  '松溪右岸1号闸站': 'FT4489479',
  '松溪右岸2号闸站': 'FT4489367'
};

// 萤石云视频相关
const ys7AccessToken = ref('');
const ys7TokenExpireTime = ref(0);
const videoLoadingStates = ref([false, false, false, false]); // 四个通道的加载状态
const ys7VideoUrls = ref(['', '', '', '']); // 四个通道的视频URL
const ys7VideoPlayers = ref([null, null, null, null]); // 四个通道的 EZUIKit 播放器实例

// 网络异常自动重连相关状态
const reconnectStates = ref([
  { isReconnecting: false, retryCount: 0, maxRetries: 5, retryInterval: 5000 },
  { isReconnecting: false, retryCount: 0, maxRetries: 5, retryInterval: 5000 },
  { isReconnecting: false, retryCount: 0, maxRetries: 5, retryInterval: 5000 },
  { isReconnecting: false, retryCount: 0, maxRetries: 5, retryInterval: 5000 }
]); // 四个通道的重连状态
const reconnectTimers = ref([null, null, null, null]); // 重连定时器

// 获取闸站对应的设备序列号（支持闸站名称或闸站代码）
const getDeviceSerialByStationName = (stationNameOrCode) => {
  // 如果直接是闸站名称，直接查找
  if (GATE_STATION_MAPPING[stationNameOrCode]) {
    return GATE_STATION_MAPPING[stationNameOrCode];
  }
  
  // 如果是闸站代码，先转换为闸站名称，再查找设备序列号
  const stationName = CODE_TO_NAME_MAPPING[stationNameOrCode];
  if (stationName && GATE_STATION_MAPPING[stationName]) {
    return GATE_STATION_MAPPING[stationName];
  }
  
  console.warn(`未找到闸站 ${stationNameOrCode} 对应的设备序列号`);
  return null;
};

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

// 旧的视频获取逻辑已删除，将使用新的 Yingshiyun 视频流

// 新的 Yingshiyun 视频相关函数将在这里添加

// 获取萤石云访问令牌
const getYs7AccessToken = async () => {
  try {
    // 检查令牌是否还有效（提前5分钟刷新）
    const now = Date.now();
    if (ys7AccessToken.value && ys7TokenExpireTime.value > now + 5 * 60 * 1000) {
      return ys7AccessToken.value;
    }

    console.log('获取萤石云访问令牌...');
    const tokenData = await getYs7TokenApi();
    
    if (tokenData && tokenData.accessToken) {
      ys7AccessToken.value = tokenData.accessToken;
      // 设置过期时间（通常为7天，这里设置为6天23小时以确保提前刷新）
      ys7TokenExpireTime.value = now + (tokenData.expireTime || 7 * 24 * 60 * 60 * 1000) - 60 * 60 * 1000;
      console.log('萤石云令牌获取成功:', tokenData.accessToken);
      return tokenData.accessToken;
    } else {
      throw new Error('获取令牌失败：响应数据无效');
    }
  } catch (error) {
    console.error('获取萤石云访问令牌失败:', error);
    ElMessage.error('获取萤石云访问令牌失败');
    return null;
  }
};

// 检查设备状态和权限
const checkDeviceStatusAndPermissions = async (accessToken, deviceSerial) => {
  try {
    console.log('检查设备信息:', deviceSerial);
    
    // 1. 检查设备信息和在线状态
    try {
      const deviceInfoRes = await getYs7DeviceInfoApi(accessToken, deviceSerial);
      console.log('设备信息查询结果:', deviceInfoRes);
      
      if (deviceInfoRes.code === '200') {
        const deviceInfo = deviceInfoRes.data;
        console.log('设备详细信息:', deviceInfo);
        console.log('设备在线状态:', deviceInfo.status === 1 ? '在线' : '离线');
        
        if (deviceInfo.status === 0) {
          ElMessage.warning(`设备 ${deviceSerial} 当前离线，可能无法获取视频流`);
        } else {
          console.log('✓ 设备在线，状态正常');
        }
      } else {
        console.error('设备信息查询失败:', deviceInfoRes.msg);
        if (deviceInfoRes.code === '20002') {
          ElMessage.error(`设备 ${deviceSerial} 不存在或无访问权限`);
        }
      }
    } catch (error) {
      console.error('设备信息查询异常:', error);
    }

    // 2. 检查设备列表中是否包含该设备（验证权限）
    try {
      const deviceListRes = await getYs7DeviceListApi(accessToken);
      console.log('设备列表查询结果:', deviceListRes);
      
      if (deviceListRes.code === '200') {
        const devices = deviceListRes.data;
        const targetDevice = devices.find(device => device.deviceSerial === deviceSerial);
        
        if (targetDevice) {
          console.log('✓ 在设备列表中找到目标设备:', targetDevice);
          console.log('设备权限验证通过');
        } else {
          console.warn('⚠ 在设备列表中未找到目标设备，可能无访问权限');
          ElMessage.warning(`账号可能没有设备 ${deviceSerial} 的访问权限`);
        }
        
        console.log('账号下所有设备:', devices.map(d => ({
          serial: d.deviceSerial,
          name: d.deviceName,
          status: d.status === 1 ? '在线' : '离线'
        })));
      } else {
        console.error('设备列表查询失败:', deviceListRes.msg);
      }
    } catch (error) {
      console.error('设备列表查询异常:', error);
    }
    
  } catch (error) {
    console.error('设备状态检查异常:', error);
  }
};

// 网络状态检查功能
const checkNetworkStatus = async () => {
  try {
    // 检查浏览器网络连接状态
    if (!navigator.onLine) {
      console.warn('浏览器检测到网络离线');
      return false;
    }

    // 尝试发送网络请求验证连接
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const response = await fetch('/api/health-check', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('网络连接检查失败:', fetchError);
      return false;
    }
  } catch (error) {
    console.error('网络状态检查异常:', error);
    return false;
  }
};

// 清理重连定时器
const clearReconnectTimer = (channelIndex) => {
  if (reconnectTimers.value[channelIndex]) {
    clearTimeout(reconnectTimers.value[channelIndex]);
    reconnectTimers.value[channelIndex] = null;
  }
};

// 重置重连状态
const resetReconnectState = (channelIndex) => {
  reconnectStates.value[channelIndex] = {
    isReconnecting: false,
    retryCount: 0,
    maxRetries: 5,
    retryInterval: 5000
  };
  clearReconnectTimer(channelIndex);
};

// 自动重连功能
const attemptReconnect = async (channelIndex) => {
  const reconnectState = reconnectStates.value[channelIndex];
  const channelNumber = channelIndex + 1;
  
  if (reconnectState.isReconnecting) {
    console.log(`通道 ${channelNumber} 正在重连中，跳过此次重连请求`);
    return;
  }

  if (reconnectState.retryCount >= reconnectState.maxRetries) {
    console.error(`通道 ${channelNumber} 已达到最大重试次数 (${reconnectState.maxRetries})，停止重连`);
    ElMessage.error(`通道 ${channelNumber} 网络连接失败，已达到最大重试次数`);
    return;
  }

  // 获取该通道对应的视频URL
  const videoUrl = ys7VideoUrls.value[channelIndex];
  
  // 如果该通道本身就没有视频源，不进行重连
  if (!videoUrl || videoUrl.trim() === '') {
    console.log(`通道 ${channelNumber} 本身无视频源，跳过重连`);
    return;
  }

  reconnectState.isReconnecting = true;
  reconnectState.retryCount++;
  
  console.log(`通道 ${channelNumber} 开始第 ${reconnectState.retryCount} 次重连尝试...`);
  ElMessage.info(`通道 ${channelNumber} 正在尝试重连 (${reconnectState.retryCount}/${reconnectState.maxRetries})`);

  // 检查网络状态
  const networkOk = await checkNetworkStatus();
  if (!networkOk) {
    console.warn(`通道 ${channelNumber} 网络状态异常，延迟重连`);
  }

  // 设置重连定时器
  reconnectTimers.value[channelIndex] = setTimeout(async () => {
    try {
      // 销毁现有播放器
      if (ys7VideoPlayers.value[channelIndex]) {
        try {
          // 检查容器是否还存在再销毁播放器
          const containerId = `video-container-${channelIndex}`;
          const container = document.getElementById(containerId);
          
          if (container) {
            ys7VideoPlayers.value[channelIndex].destroy();
          } else {
            console.warn(`通道 ${channelNumber} 重连时容器已不存在，跳过播放器销毁`);
          }
        } catch (destroyError) {
          console.warn(`销毁通道 ${channelNumber} 播放器时出错:`, destroyError);
        }
        ys7VideoPlayers.value[channelIndex] = null;
      }

      // 重新创建播放器
      const containerId = `video-container-${channelIndex}`;
      const container = document.getElementById(containerId);
      
      if (container && videoUrl) {
        // 确保容器已经完全渲染并且可用
        if (container.offsetParent !== null || container.offsetWidth > 0 || container.offsetHeight > 0) {
          const player = new EZUIKit.EZUIKitPlayer({
            id: containerId,
            url: videoUrl,
            accessToken: ys7AccessToken.value,
            template: "pcLive", // 添加模板参数
            talkChannelNo: 1, // 添加对讲通道号
            width: "550px",
            height: "300px",
            autoPlay: true,
            audio: false, // 禁用音频以确保默认静音
            download: false, // 禁用下载功能
            downloadRecord: false, // 禁用录制下载
            controls: true,
            muted: true, // 确保静音
            // 完全隐藏视频技术信息显示
            showInfo: false,
            showStats: false,
            showDebugInfo: false,
            displayStreamInfo: false, // 隐藏流信息
            showStreamInfo: false, // 隐藏流信息
            hideStreamInfo: true, // 隐藏流信息
            showFps: false, // 隐藏帧率
            showBitrate: false, // 隐藏码率
            showResolution: false, // 隐藏分辨率
            showCodec: false, // 隐藏编码信息
            hideOverlay: true, // 隐藏覆盖层
            hideInfo: true // 隐藏信息显示
          });
          
          // 播放器创建后立即隐藏流信息
          if (player && typeof player.displayStreamInfo === 'function') {
            player.displayStreamInfo(false);
          }
          
          // 检查播放器实例是否创建成功
          if (player) {
            // 确保播放器静音 - 在播放器实例验证后调用
            if (typeof player.closeSound === 'function') {
              player.closeSound();
            }
            
            // 添加错误监听
            setupPlayerErrorHandling(player, channelIndex);
            
            ys7VideoPlayers.value[channelIndex] = player;
            
            console.log(`通道 ${channelNumber} 重连成功`);
          } else {
            console.error(`通道 ${channelNumber} 重连时播放器实例创建失败`);
            console.log('重连播放器实例:', player);
            throw new Error('播放器实例创建失败');
          }
          ElMessage.success(`通道 ${channelNumber} 重连成功`);
          
          // 重连成功，重置状态
          resetReconnectState(channelIndex);
        } else {
          throw new Error('容器尚未完全渲染');
        }
        
      } else {
        throw new Error('容器元素不存在或视频URL无效');
      }
      
    } catch (error) {
      console.error(`通道 ${channelNumber} 重连失败:`, error);
      reconnectState.isReconnecting = false;
      
      // 如果还有重试机会，继续尝试
      if (reconnectState.retryCount < reconnectState.maxRetries) {
        // 递增重连间隔（指数退避）
        const nextInterval = Math.min(reconnectState.retryInterval * Math.pow(1.5, reconnectState.retryCount - 1), 30000);
        console.log(`通道 ${channelNumber} 将在 ${nextInterval/1000} 秒后进行下次重连尝试`);
        
        reconnectTimers.value[channelIndex] = setTimeout(() => {
          attemptReconnect(channelIndex);
        }, nextInterval);
      } else {
        ElMessage.error(`通道 ${channelNumber} 重连失败，已达到最大重试次数`);
        resetReconnectState(channelIndex);
      }
    }
  }, reconnectState.retryInterval);
};

// 设置播放器错误处理（使用定时检查机制替代事件监听）
const setupPlayerErrorHandling = (player, channelIndex) => {
  if (!player) return;
  
  const channelNumber = channelIndex + 1;
  console.log(`通道 ${channelNumber} 播放器初始化完成`);
  
  // 由于EZUIKit播放器不支持事件监听，我们可以实现定时检查机制
  // 或者依赖播放器方法的Promise返回值来处理错误
  
  // 可以在这里添加定时检查播放状态的逻辑
  // 例如：定期调用播放器的状态检查方法
  
  // 存储播放器引用以便后续操作
  console.log(`通道 ${channelNumber} 播放器设置完成，可以使用 play()、stop()、pause() 等方法控制播放`);
};

// 获取指定闸站的四个通道视频URL
const getGateStationVideoUrls = async (gateStationName) => {
  try {
    console.log('=== 开始获取闸站视频URL ===');
    console.log('闸站名称:', gateStationName);
    
    // 获取设备序列号
    const deviceSerial = getDeviceSerialByStationName(gateStationName);
    console.log('获取到的设备序列号:', deviceSerial);
    console.log('设备序列号映射表:', GATE_STATION_MAPPING);
    
    if (!deviceSerial) {
      console.error('未找到闸站对应的设备序列号:', gateStationName);
      ElMessage.error(`未找到闸站 ${gateStationName} 对应的设备`);
      return [];
    }

    // 获取访问令牌
    const accessToken = await getYs7AccessToken();
    console.log('访问令牌:', accessToken ? '已获取' : '获取失败');
    if (!accessToken) {
      return [];
    }

    // 检查设备状态和权限
    console.log('=== 开始检查设备状态和权限 ===');
    await checkDeviceStatusAndPermissions(accessToken, deviceSerial);

    console.log(`开始获取闸站 ${gateStationName} (${deviceSerial}) 的视频URL...`);
    
    // 重置加载状态
    videoLoadingStates.value = [true, true, true, true];
    
    // 尝试获取四个独立通道的视频URL
    console.log('=== 开始获取四个独立通道的视频URL ===');
    
    const videoUrls = ['', '', '', ''];
    const channelPromises = [];
    
    // 为每个通道创建独立的获取任务
    for (let channel = 1; channel <= 4; channel++) {
      channelPromises.push(
        getYs7LiveAddressApi(accessToken, deviceSerial, channel)
          .then(response => ({ channel, response, success: true }))
          .catch(error => ({ channel, error, success: false }))
      );
    }
    
    // 并行获取所有通道的结果
    const channelResults = await Promise.all(channelPromises);
    let successCount = 0;
    
    // 处理每个通道的结果，保持通道独立性
    channelResults.forEach(result => {
      const { channel, response, error, success } = result;
      const urlIndex = channel - 1; // 通道1对应索引0
      
      if (success && response && response.url) {
        console.log(`✓ 通道 ${channel} 获取成功:`, response.url);
        videoUrls[urlIndex] = response.url;
        successCount++;
      } else {
        if (error && error.code === 20017) {
          console.log(`通道 ${channel} 不存在 (错误码: 20017)，窗口 ${channel} 将保持空白`);
        } else {
          console.error(`通道 ${channel} 获取失败:`, error, `，窗口 ${channel} 将保持空白`);
        }
        // 保持该位置为空字符串，不使用其他通道替代
        videoUrls[urlIndex] = '';
      }
    });
    
    console.log(`✓ 成功获取 ${successCount} 个独立通道的视频源`);
    
    if (successCount > 0) {
      ElMessage.success(`成功获取 ${successCount} 个独立通道的视频源`);
    } else {
      console.error('所有通道都无法获取视频URL');
      ElMessage.error('无法获取任何视频源');
    }

    // 重置加载状态
    videoLoadingStates.value = [false, false, false, false];
    ys7VideoUrls.value = videoUrls;
    
    console.log('=== 四个独立通道视频URL配置 ===');
    videoUrls.forEach((url, index) => {
      console.log(`窗口 ${index + 1} (通道 ${index + 1}) URL:`, url ? `已配置: ${url.substring(0, 50)}...` : '未配置（将保持空白）');
    });
    
    // 初始化 EZUIKit 播放器
    // await nextTick(); // 确保 DOM 已更新
    initEZUIKitPlayers(videoUrls);

    return videoUrls;
  } catch (error) {
    console.error('获取闸站视频URL失败:', error);
    ElMessage.error('获取视频地址失败');
    // 重置加载状态
    videoLoadingStates.value = [false, false, false, false];
    return [];
  }
};

// EZUIKit 预初始化
const preInitEZUIKit = async (channelNo = 1) => {
  try {
    // 获取当前选中闸站的设备序列号
    const currentStationName = selectedDamNode.value?.gateStationName;
    let deviceSerial = 'FT8680159'; // 默认设备序列号（松溪左岸1号闸站）
    
    if (currentStationName) {
      const stationDeviceSerial = getDeviceSerialByStationName(currentStationName);
      if (stationDeviceSerial) {
        deviceSerial = stationDeviceSerial;
      }
    }
    
    console.log(`预初始化使用的设备序列号: ${deviceSerial}, 通道: ${channelNo}`);
    
    // 使用实际的设备序列号和通道号构建 ezopen URL
    const preInitUrl = `ezopen://open.ys7.com/${deviceSerial}/${channelNo}.live`;
    console.log('预初始化 URL:', preInitUrl);
    
    // 使用当前的 access token 进行预初始化
    const res = await EZUIKit.EZUIKitPlayer.preInit({
      url: preInitUrl,
      accessToken: ys7AccessToken.value,
      width: "550px",
      height: "300px",
    });
    res.displayStreamInfo(false)
    console.log(`EZUIKit 通道 ${channelNo} preInit success:`, res);
    return true;
  } catch (err) {
    console.log(`EZUIKit 通道 ${channelNo} preInit fail:`, err);
    return false;
  }
};

// 清理萤石云视频播放器
const cleanupYs7Videos = () => {
  console.log('清理 EZUIKit 视频播放器...');
  
  ys7VideoPlayers.value.forEach((player, index) => {
    if (player) {
      try {
        // 检查对应的DOM容器是否还存在
        const containerId = `video-container-${index}`;
        const container = document.getElementById(containerId);
        
        if (container) {
          console.log(`销毁通道 ${index + 1} 播放器，容器存在`);
          // 销毁 EZUIKit 播放器实例
          player.destroy();
        } else {
          console.warn(`通道 ${index + 1} 容器已不存在，跳过播放器销毁`);
        }
      } catch (error) {
        console.warn(`清理 EZUIKit 播放器 ${index + 1} 时出错:`, error);
      }
    }
  });
  
  // 重置播放器状态，但暂时保留URL状态以维持DOM结构
  ys7VideoPlayers.value = [null, null, null, null];
  videoLoadingStates.value = [false, false, false, false];
  
  // 延迟清空URL状态，确保DOM有时间完成清理
  nextTick(() => {
    ys7VideoUrls.value = ['', '', '', ''];
  });
};

// 初始化 Ezuikit-flv 播放器
const initEZUIKitPlayers = async (videoUrls) => {
  console.log('初始化 EZUIKit 播放器...');
  console.log('传入的videoUrls:', videoUrls);
  
  videoUrls.forEach(async (url, index) => {
    const channelNumber = index + 1;
    console.log(`正在处理通道 ${channelNumber}，URL: ${url || '(空)'}`);
    
    if (url && url.trim() !== '') {
      try {
        // 为每个通道分别进行预初始化
        const preInitSuccess = await preInitEZUIKit(channelNumber);
        if (!preInitSuccess) {
          console.warn(`通道 ${channelNumber} EZUIKit 预初始化失败，继续尝试创建播放器...`);
        }
        
        const containerId = `video-container-${index}`;
        const container = document.getElementById(containerId);
        
        if (container) {
          // 重置该通道的重连状态
          resetReconnectState(index);
          
          console.log(`为通道 ${channelNumber} 创建播放器，容器ID: ${containerId}`);
          
          // 确保容器已经完全渲染并且可用
          if (container.offsetParent !== null || container.offsetWidth > 0 || container.offsetHeight > 0) {
            // 创建 EZUIKit 播放器实例
            const player = new EZUIKit.EZUIKitPlayer({
              id: containerId,
              url: url,
              accessToken: ys7AccessToken.value,
              template: "pcLive", // 添加模板参数
              talkChannelNo: 1, // 添加对讲通道号
              width: "550px",
              height: "300px",
              autoPlay: true,
              audio: false, // 禁用音频以确保默认静音
              download: false, // 禁用下载功能
              downloadRecord: false, // 禁用录制下载
              // 其他初始化参数
              controls: true,
              muted: true, // 确保静音
              // 完全隐藏视频技术信息显示
              showInfo: false,
              showStats: false,
              showDebugInfo: false,
              displayStreamInfo: false, // 隐藏流信息
              showStreamInfo: false, // 隐藏流信息
              hideStreamInfo: true, // 隐藏流信息
              showFps: false, // 隐藏帧率
              showBitrate: false, // 隐藏码率
              showResolution: false, // 隐藏分辨率
              showCodec: false, // 隐藏编码信息
              hideOverlay: true, // 隐藏覆盖层
              hideInfo: true // 隐藏信息显示
            });
            
            // 播放器创建后立即隐藏流信息
            if (player && typeof player.displayStreamInfo === 'function') {
              player.displayStreamInfo(false);
            }
            
            // 检查播放器实例是否创建成功
            if (player) {
              // 确保播放器静音 - 在播放器实例验证后调用
              if (typeof player.closeSound === 'function') {
                player.closeSound();
              }
              
              // 设置错误处理和自动重连
              setupPlayerErrorHandling(player, index);
              
              ys7VideoPlayers.value[index] = player;
              console.log(`✓ 通道 ${channelNumber} EZUIKit 播放器初始化成功`);
            } else {
              console.error(`✗ 通道 ${channelNumber} EZUIKit 播放器实例创建失败`);
              console.log('播放器实例:', player);
              console.log('播放器类型:', typeof player);
            }
          } else {
            console.warn(`通道 ${channelNumber} 容器尚未完全渲染，跳过播放器初始化`);
          }
        } else {
          console.error(`未找到容器元素: ${containerId}`);
        }
      } catch (error) {
        console.error(`✗ 初始化通道 ${channelNumber} EZUIKit 播放器失败:`, error);
        // 确保播放器数组中该位置为null，表示初始化失败
        ys7VideoPlayers.value[index] = null;
      }
    } else {
      console.log(`通道 ${channelNumber} 无可用视频源，窗口将保持空白`);
      // 确保播放器数组中该位置为null
      ys7VideoPlayers.value[index] = null;
      
      // 清空对应容器的内容，显示提示信息
      const containerId = `video-container-${index}`;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            background-color: #f5f5f5; 
            color: #999; 
            font-size: 14px;
            border: 1px dashed #ddd;
          ">
            通道 ${channelNumber} 暂无视频源
          </div>
        `;
      }
    }
  });
};

// 初始化萤石云视频播放
const initYs7VideoPlayback = async (gateStationName) => {
  if (!gateStationName) {
    console.log('闸站名称为空，跳过视频初始化');
    return;
  }

  console.log('初始化萤石云视频播放:', gateStationName);
  
  // 清理现有播放器
  cleanupYs7Videos();
  
  // 获取视频URL
  await getGateStationVideoUrls(gateStationName);
};

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

  // 先清空视频相关状态，但保持DOM结构稳定
  cleanupYs7Videos();

  // 清空表单数据（切换节点时才清空）
  gateOpeningForm.openingValue = null;
  gateOpeningForm.gate1OpeningValue = null;
  gateOpeningForm.gate2OpeningValue = null;

  if (newNode) {
    console.log('Control页面: 检测到选中节点变化', newNode);

    try {
      // 获取设备管理信息和闸门扩展信息
      if (newNode.gateStationCode) {
        await fetchGateExtendedInfo(newNode.gateStationCode);
        await fetchControlDeviceCode(newNode.gateStationCode);
        
        // 等待DOM更新完成后再初始化视频播放
        await nextTick();
        
        // 检查组件是否还存在（防止在异步操作期间组件被卸载）
        if (selectedDamNode.value === newNode) {
          // 初始化 Yingshiyun 视频播放
          await initYs7VideoPlayback(newNode.gateStationCode);
          
          // 启动定时器
          startGateExtInfoTimer(newNode.gateStationCode);
        } else {
          console.log('组件已切换到其他节点，跳过视频初始化');
        }
      }

      // 加载任务列表（仅在节点未变化时）
      if (selectedDamNode.value === newNode) {
        await loadTaskList();
      }
    } catch (error) {
      console.error('切换闸站时发生错误:', error);
      ElMessage.error('切换闸站失败');
    }
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
          successCount++;
          return { success: true, name: op.name };
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

      ElMessage.success('闸口开度控制指令发送成功');
      // 清空输入框
      gateOpeningForm.openingValue = null;
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



// 组件清理函数
const cleanup = () => {
  console.log('执行组件清理...');
  
  // 清理视频播放器
  cleanupYs7Videos();
  
  // 清理所有重连定时器
  reconnectTimers.value.forEach((timer, index) => {
    if (timer) {
      clearTimeout(timer);
      reconnectTimers.value[index] = null;
    }
  });
  
  // 重置重连状态
  reconnectStates.value.forEach((state, index) => {
    resetReconnectState(index);
  });
  
  // 清理其他定时器
  stopGateExtInfoTimer();
  
  console.log('组件清理完成');
};

// 组件卸载时清理资源
onBeforeUnmount(async () => {
  console.log('GateControl组件卸载，清理资源');

  // 发送停止取流命令
  // if (selectedCameraDevice.value) {
  //   await sendStopStreamCommand(selectedCameraDevice.value);
  // }

  cleanup();
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
  }
  
  &.dual-video {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  
  &.quad-video {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: 450px;
  }
  
  &.video-grid-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: 450px;
  }
  
  &.multi-video {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 200px;
    height: auto;
  }
}

.video-container {
  position: relative;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
  min-height: 220px; 
  // 隐藏 EZUIKit 播放器的技术信息显示
  :deep(.ezuikit-info),
  :deep(.ezuikit-stats),
  :deep(.ezuikit-debug-info),
  :deep(.video-info),
  :deep(.video-stats),
  :deep(.debug-info),
  :deep(.player-info),
  :deep(.stream-info),
  :deep(.fps-info),
  :deep(.bitrate-info),
  :deep(.resolution-info),
  :deep(.codec-info),
  :deep(.overlay-info),
  :deep(.tech-info),
  :deep(.monitor-info),
  :deep(.performance-info),
  :deep(.network-info),
  :deep([class*="info"]),
  :deep([class*="stats"]),
  :deep([class*="debug"]),
  :deep([class*="fps"]),
  :deep([class*="bitrate"]),
  :deep([class*="codec"]),
  :deep([class*="resolution"]),
  :deep([class*="monitor"]),
  :deep([class*="performance"]),
  :deep([class*="network"]) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
    top: -9999px !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  
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
    
    .video-status {
      font-size: 10px;
      
      .loading-text {
        color: #ffd700;
      }
      
      .connected-text {
        color: #67c23a;
      }
      
      .disconnected-text {
        color: #f56c6c;
      }
    }
    
    .el-button {
      padding: 2px 6px;
      font-size: 10px;
      height: auto;
      line-height: 1.2;
    }
  }
  
  .video-wrapper {
    width: 100%;
    height: 100%;
    padding-top: 30px;
    position: relative;
  }
}

.video-player {
 
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