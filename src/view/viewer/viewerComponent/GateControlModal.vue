<template>
  <div v-if="show" class="gate-control-modal-overlay" @click.self="closeModal">

    <div class="gate-control-modal">
      <!-- 弹窗头部 -->
      <div class="modal-header">
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <button class="close-button" @click="closeModal">
          <el-icon>
            <Close />
          </el-icon>
        </button>
      </div>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="闸门详情" name="second">
          <div class="gate-details-content">
            <!-- 安全概况 -->
            <div class="safety-overview">
              <!-- <div class="section-title">安全概况</div> -->
        
              <div class="safety-content">
                <div class="safety-header">
                  <!-- <div class="reservoir-table">
                  <el-table :data="reservoirTableData" border style="width: 100%">
                    <el-table-column prop="label" label="项目" width="120" />
                    <el-table-column prop="value" label="内容" />
                  </el-table>
                </div> -->
                </div>

                <div class="safety-stats">


                  <!-- 设备选择 -->
                  <div class="device-selector" style="margin: 10px; text-align: left;">
                    <el-form :inline="true">
                      <el-form-item label="选择位移设备" style="margin-left: 0;">
                        <el-select v-model="selectedDeviceCode" placeholder="请选择设备" :teleported="false"
                          style="width: 200px;">
                          <el-option v-for="device in deviceList" :key="device.deviceCode" :label="device.deviceName"
                            :value="device.deviceCode">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-form>
                  </div>

                  <div class="monitoring-table">
                    <DisplacementTable :height="250" :show-pagination="false"
                      :filter-form="{ timeRange: '24h', direction: 'all' }" :device-code="selectedDeviceCode" />
                  </div>

                  <!-- 环境监测模块 -->
                  <div class="environment-monitoring">
         
                    
                    <!-- 环境设备选择 -->
                    <div class="env-device-selector" style="margin: 10px; text-align: left;">
                      <el-form :inline="true">
                        <el-form-item label="选择环境设备" style="margin-left: 0;">
                          <el-select v-model="selectedEnvDeviceCode" placeholder="请选择环境设备" :teleported="false"
                            style="width: 200px;" @change="onEnvDeviceChange" :loading="envDeviceLoading">
                            <el-option v-for="device in envDeviceList" :key="device.deviceCode" :label="device.deviceName"
                              :value="device.deviceCode">
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-form>
                    </div>

                    <!-- 环境指标卡片 -->
                    <div class="env-metrics-grid" 
                         v-loading="envDataLoading"
                         element-loading-background="rgba(14, 42, 90, 0.8)"
                         element-loading-text="加载中..."
                         element-loading-spinner="el-icon-loading">
                      <div class="env-metric-card">
                        <div class="metric-header">
                          <div class="metric-title">风速</div>
                          <div class="metric-unit">m/s</div>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ envOverviewData.windSpeed.value }}</div>
                        </div>
                      </div>

                      <div class="env-metric-card">
                        <div class="metric-header">
                          <div class="metric-title">气压</div>
                          <div class="metric-unit">kPa</div>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ envOverviewData.pressure.value }}</div>
                        </div>
                      </div>

                      <div class="env-metric-card">
                        <div class="metric-header">
                          <div class="metric-title">气温</div>
                          <div class="metric-unit">°C</div>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ envOverviewData.temperature.value }}</div>
                        </div>
                      </div>

                      <div class="env-metric-card">
                        <div class="metric-header">
                          <div class="metric-title">湿度</div>
                          <div class="metric-unit">%</div>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ envOverviewData.humidity.value }}</div>
                        </div>
                      </div>

                      <div class="env-metric-card">
                        <div class="metric-header">
                          <div class="metric-title">降水</div>
                          <div class="metric-unit">mm</div>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ envOverviewData.rainfall.value }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 渗压和渗流量监测 -->
            <div class="seepage-section">
              <div class="seepage-cards">
                <div class="seepage-card-with-chart">
                  <div class="card-header">
                    <div class="card-title">
                      <el-icon class="card-icon">
                        <Histogram />
                      </el-icon>
                      <span>渗压监测</span>
                    </div>
                    <el-button type="text" class="detail-btn" @click="gotoSeepage">查看详情</el-button>
                  </div>
                  <div class="card-content">
                    <div class="status-info">

                    </div>
                    <div class="chart-title">渗压值 (kPa)</div>
                    <div ref="seepagePressureChart" class="chart" style="height:300px"></div>
                  </div>
                </div>

                <div class="seepage-card-with-chart">
                  <div class="card-header">
                    <div class="card-title">
                      <el-icon class="card-icon">
                        <DataLine />
                      </el-icon>
                      <span>渗流量监测</span>
                    </div>
                    <el-button type="text" class="detail-btn" @click="gotoFlow">查看详情</el-button>
                  </div>
                  <div class="card-content">

                    <div class="chart-title">渗流量值 (L/s)</div>
                    <div class="no-device-tip" style="display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 18px;
    margin-top: 15%;">
                      <el-icon class="tip-icon" style="margin-right: 8px; font-size: 20px;">
                        <InfoFilled />
                      </el-icon>
                      <span>暂未接入该类型设备</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="闸门控制" name="first">
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

                  <!-- 一号闸口状态图片 -->
                  <img v-show="gate1Info && gate1Info.controlStatus === '1'" src="/src/assets/images/gate-up.png"
                    alt="闸门-开启" class="gate-status-up gate-1" />
                  <img v-show="gate1Info && gate1Info.controlStatus === '2'" src="/src/assets/images/gate-down.png"
                    alt="闸门-关闭" class="gate-status-down gate-1" />
                  <img v-show="gate1Info && gate1Info.controlStatus === '3'" src="/src/assets/images/gate-stop.png"
                    alt="闸门-停止" class="gate-status-stop gate-1" />

                  <!-- 二号闸口状态图片 -->
                  <img v-show="gate2Info && gate2Info.controlStatus === '1'" src="/src/assets/images/gate-up.png"
                    alt="闸门-开启" class="gate-status-up gate-2" />
                  <img v-show="gate2Info && gate2Info.controlStatus === '2'" src="/src/assets/images/gate-down.png"
                    alt="闸门-关闭" class="gate-status-down gate-2" />
                  <img v-show="gate2Info && gate2Info.controlStatus === '3'" src="/src/assets/images/gate-stop.png"
                    alt="闸门-停止" class="gate-status-stop gate-2" />
                </div>
                <el-descriptions title="闸门情况" :column="2" border class="gate-status-info">
                  <el-descriptions-item label="闸门控制">
                    
                      {{ currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? '自动可远程' : '手动' }}
                  
                  </el-descriptions-item>
                  <el-descriptions-item label="最新时间" style="color: white !important;">{{ currentGateInfo ? currentGateInfo.crtTime : '--' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="河道液位">{{ gateExtInfo && gateExtInfo.length > 0 ?
                    gateExtInfo[0].riverLevel : '--'
                    }}米
                  </el-descriptions-item>
                  <el-descriptions-item label="渠道液位">{{ gateExtInfo && gateExtInfo.length > 0 ?
                    gateExtInfo[0].channelLevel :
                    '--' }}米
                  </el-descriptions-item>
                </el-descriptions>
                <!-- 闸口选择和开度控制 -->
                <div class="gate-control-section" style="margin: 20px 0;">
                  <!-- 第一行：选择闸口和开度控制 -->
                  <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: end;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <label style="font-size: 16px; white-space: nowrap;">选择闸口:</label>
                      <el-select v-model="selectedGatePort" placeholder="请选择闸口" style="width: 200px;"
                        :teleported="false" @change="handleGatePortChange">
                        <el-option v-for="option in gatePortOptions" :key="option.value" :label="option.label"
                          :value="option.value"></el-option>
                      </el-select>
                    </div>
                    
                    <!-- 单个闸口开度控制 -->
                    <div v-if="selectedGatePort !== 'ALL_GATES'" style="display: flex; align-items: center; gap: 10px;">
                      <label style="font-size: 16px; white-space: nowrap;">闸口开度:</label>
                      <el-input v-model.number="gateOpeningForm.openingValue" type="number" :min="0" :max="100"
                        placeholder="请输入开度" style="width: 200px;" :disabled="!selectedGatePort"
                        @input="handleOpeningValueInput">
                        <template #suffix>
                          <span>%</span>
                        </template>
                      </el-input>
                    </div>
                    
                    <!-- 全部闸口开度控制 - 第一行一号闸口 -->
                    <div v-if="selectedGatePort === 'ALL_GATES'" style="display: flex; align-items: center; gap: 10px;">
                      <label style="font-size: 16px; white-space: nowrap;">一号闸口:</label>
                      <el-input v-model.number="gateOpeningForm.gate1OpeningValue" type="number" :min="0" :max="100"
                        placeholder="请输入一号闸口开度" style="width: 200px;" @input="handleGate1OpeningValueInput">
                        <template #suffix>
                          <span>%</span>
                        </template>
                      </el-input>
                    </div>
                  </div>
                  
                  <!-- 全部闸口模式下的第二行 -->
                  <div v-if="selectedGatePort === 'ALL_GATES'" style="display: flex; gap: 20px; align-items: end; margin-top: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <label style="font-size: 16px; white-space: nowrap;">二号闸口:</label>
                      <el-input v-model.number="gateOpeningForm.gate2OpeningValue" type="number" :min="0" :max="100"
                        placeholder="请输入二号闸口开度" style="width: 200px;" @input="handleGate2OpeningValueInput">
                        <template #suffix>
                          <span>%</span>
                        </template>
                      </el-input>
                    </div>
                  </div>

                  <!-- 执行和停闸按钮 -->
                  <div style="text-align: center; margin-top: 15px;">
                    <el-button type="primary" @click="showConfirmationDialog('opening')"
                      :disabled="isExecuteButtonDisabled"
                      :loading="gateOpeningLoading">
                      执行
                    </el-button>
                    <el-button type="warning" @click="stopGate" style="margin-left: 10px;"
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
                  
                          </div>
                        </div>
                        <div class="video-wrapper">
                          <div 
                            :id="`video-container-${index}`"
                            class="video-player" 
                            style="width: 100%; height: 100%; background-color: #000;"
                          >
                            <div v-if="!videoUrl" class="video-placeholder">
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
        </el-tab-pane>

      </el-tabs>

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
import { ref, watch, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Picture, VideoCamera, CaretRight, Close, Histogram, DataLine, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElDialog, ElInput, ElButton, ElDivider } from 'element-plus';
import { gateOnOrOff, getMonitorDevicesByGateStationCodeApi, sendDeviceCommandApi, getDeviceManagementInfo, getGateExtInfo, getGateTaskList, taskSend, setGateOpeningRate, getOsmoticPressureWeekMaxApi, getEnvMcvTitleCollect, getCurrentPrecipitation } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';
import { getYs7TokenApi, getYs7LiveAddressApi, getYs7DeviceInfoApi, getYs7DeviceListApi } from '@/api/ys7';
import DisplacementTable from '@/components/DisplacementTable.vue';
import flvjs from 'flv.js';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import { buildFlvUrl } from '@/utils/config';
// 引入 EZUIKit 播放器
import EZUIKit from "ezuikit-js";

const router = useRouter();

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

const handleClick = (tab) => {
  activeName.value = tab.name;
};
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

const activeName = ref('second');

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
  { label: '一号闸口', value: 'IRDA1.DEVICE.GATE.OPENING' },
  { label: '二号闸口', value: 'IRDA2.DEVICE.GATE.OPENING' },
  { label: '全部闸口', value: 'ALL_GATES' }
]);

// 设备编码（用于控制操作）
const controlDeviceCode = ref('');

// 荧石云视频播放相关
const ys7AccessToken = ref('');
const ys7TokenExpireTime = ref(0);
const videoLoadingStates = ref([false, false, false, false]);
const ys7VideoUrls = ref(['', '', '', '']); // 四个通道的视频URL
const ys7VideoPlayers = ref([null, null, null, null]); // 四个通道的 EZUIKit 播放器实例
const reconnectStates = ref([false, false, false, false]);

// 兼容性保留的变量（用于其他功能）
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

// 确认弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const userAnswer = ref('');
const mathProblem = ref({ question: '', answer: 0 });
const pendingAction = ref('');

// 安全概况相关
const deviceList = ref([]);
const selectedDeviceCode = ref('');

// 环境监测相关
const envDeviceList = ref([]);
const selectedEnvDeviceCode = ref('');
const envDeviceLoading = ref(false);
const envDataLoading = ref(false);

// 环境数据
const envOverviewData = ref({
  pressure: {
    value: 0,
    state: 'normal'
  },
  windSpeed: {
    value: 0,
    state: 'normal'
  },
  temperature: {
    value: 0,
    state: 'normal'
  },
  humidity: {
    value: 0,
    state: 'normal'
  },
  rainfall: {
    value: 0,
    state: 'normal'
  }
});

// 渗压监测相关
const seepagePressureChart = ref();

// 计算属性：表格数据
const reservoirTableData = computed(() => [
  {
    label: '流域名称',
    value: '火星一号水库大坝'
  },
  {
    label: '工程地址',
    value: '火星xxxx市xx县xx镇'
  },
  {
    label: '管理单位',
    value: '火星水库管理所'
  }
]);

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

// 关闭弹窗
const closeModal = () => {
  // 清理所有资源
  cleanupResources();
  emit('close');
};

// 清理荧石云视频播放器
const cleanupYs7Videos = () => {
  console.log('清理 EZUIKit 视频播放器...');
  
  ys7VideoPlayers.value.forEach((player, index) => {
    if (player) {
      try {
        // 销毁 EZUIKit 播放器实例
        player.destroy();
        console.log(`✓ 清理 EZUIKit 播放器 ${index + 1} 成功`);
      } catch (error) {
        console.warn(`清理 EZUIKit 播放器 ${index + 1} 时出错:`, error);
      }
    }
  });
  
  // 重置播放器数组
  ys7VideoPlayers.value = [null, null, null, null];
  
  // 重置视频URL数组
  ys7VideoUrls.value = ['', '', '', ''];
};

// 清理所有资源
const cleanupResources = () => {
  // 停止定时器
  stopGateExtInfoTimer();

  // 停止视频播放
  stopVideo();

  // 清理荧石云视频播放器
  cleanupYs7Videos();

  // 销毁图表实例
  if (seepagePressureChart.value && seepagePressureChart.value.dispose) {
    seepagePressureChart.value.dispose();
    seepagePressureChart.value = null;
  }

  // 重置所有状态
  resetAllStates();
};

// 重置所有状态
const resetAllStates = () => {
  // 重置闸门相关状态
  gateExtInfo.value = null;
  currentGateInfo.value = null;
  selectedGatePort.value = '';
  controlDeviceCode.value = '';

  // 重置荧石云视频相关状态
  ys7AccessToken.value = '';
  ys7TokenExpireTime.value = 0;
  videoLoadingStates.value = [false, false, false, false];
  ys7VideoUrls.value = ['', '', '', ''];
  ys7VideoPlayers.value = [null, null, null, null];
  reconnectStates.value = [false, false, false, false];

  // 重置兼容性视频相关状态
  cameraDevices.value = [];
  selectedCameraDevice.value = '';
  videoUrl.value = '';
  connectionStatus.value = '未连接';
  connectTime.value = '';
  isPlaying.value = false;

  // 重置任务相关状态
  taskList.value = [];
  taskLoading.value = false;
  showAddTaskDialogVisible.value = false;
  addTaskLoading.value = false;
  addTaskForm.taskType = '';

  // 重置开度控制状态
  gateOpeningForm.openingValue = null;
  gateOpeningForm.gate1OpeningValue = null;
  gateOpeningForm.gate2OpeningValue = null;
  gateOpeningLoading.value = false;

  // 重置确认弹窗状态
  dialogVisible.value = false;
  dialogTitle.value = '';
  userAnswer.value = '';
  mathProblem.value = { question: '', answer: 0 };
  pendingAction.value = '';

  // 重置设备选择状态
  deviceList.value = [];
  selectedDeviceCode.value = '';

  // 重置闸门位置
  gate1Position.value = -45;
  gate2Position.value = -45;
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
    if (item.devpoint === 'IRDA1.DEVICE.GATE.OPENING') {
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
          // 先添加具体闸口选项，再添加"全部闸口"选项
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

// 生成数学题
// 根据闸站名称获取设备序列号
const getDeviceSerialByStationName = (stationName) => {
  return GATE_STATION_MAPPING[stationName] || null;
};

// 获取萤石云访问令牌
const getYs7AccessToken = async () => {
  try {
    // 检查令牌是否还有效（提前5分钟刷新）
    const now = Date.now();
    if (ys7AccessToken.value && ys7TokenExpireTime.value > now + 5 * 60 * 60 * 1000) {
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

// 生成数学验证题
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

// 获取闸站视频URL
const getGateStationVideoUrls = async (gateStationCode) => {
  try {
    console.log('开始获取闸站视频URL:', gateStationCode);
    
    // 通过闸站代码获取闸站名称
    const gateStationName = CODE_TO_NAME_MAPPING[gateStationCode];
    if (!gateStationName) {
      console.error('未找到对应的闸站名称:', gateStationCode);
      ElMessage.error('未找到对应的闸站配置');
      return [];
    }

    // 通过闸站名称获取设备序列号
    const deviceSerial = getDeviceSerialByStationName(gateStationName);
    if (!deviceSerial) {
      console.error('未找到对应的设备序列号:', gateStationName);
      ElMessage.error('未找到对应的设备配置');
      return [];
    }

    console.log(`闸站映射: ${gateStationCode} -> ${gateStationName} -> ${deviceSerial}`);

    // 获取访问令牌
    const accessToken = await getYs7AccessToken();
    if (!accessToken) {
      return [];
    }

    console.log(`开始获取闸站 ${gateStationName} (${deviceSerial}) 的视频URL...`);
    
    // 重置加载状态
    videoLoadingStates.value = [true, true, true, true];
    
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
    
    // 处理每个通道的结果
    channelResults.forEach(result => {
      const { channel, response, error, success } = result;
      const urlIndex = channel - 1;
      
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
    
    // 初始化 EZUIKit 播放器
    initEZUIKitPlayers(videoUrls);

    return videoUrls;
  } catch (error) {
    console.error('获取闸站视频URL失败:', error);
    ElMessage.error('获取视频地址失败');
    videoLoadingStates.value = [false, false, false, false];
    return [];
  }
};

// 初始化 EZUIKit 播放器
const initEZUIKitPlayers = async (videoUrls) => {
  console.log('初始化 EZUIKit 播放器...');
  
  // 清理现有播放器
  cleanupYs7Videos();
  
  // 等待DOM更新
  await nextTick();
  
  for (let index = 0; index < videoUrls.length; index++) {
    const videoUrl = videoUrls[index];
    const channelNumber = index + 1;
    const containerId = `video-container-${index}`;
    
    try {
      console.log(`初始化通道 ${channelNumber} 播放器...`);
      
      // 检查DOM元素是否存在
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error(`✗ 通道 ${channelNumber} 容器元素不存在: ${containerId}`);
        ys7VideoPlayers.value[index] = null;
        continue;
      }
      
      if (!videoUrl) {
        console.log(`通道 ${channelNumber} 无视频URL，跳过初始化`);
        ys7VideoPlayers.value[index] = null;
        continue;
      }
      
      // 创建 EZUIKit 播放器实例
      const player = new EZUIKit.EZUIKitPlayer({
        id: containerId,
        accessToken: ys7AccessToken.value,
        url: videoUrl,
        template: 'simple',
        plugin: ['talk'],
        width: 300,
        height: 200,
        autoplay: true,
        split: 1,
        audio: 1,
        openSoundCallBack: (data) => console.log('开启声音回调:', data),
        closeSoundCallBack: (data) => console.log('关闭声音回调:', data),
        startTalkCallBack: (data) => console.log('开启对讲回调:', data),
        stopTalkCallBack: (data) => console.log('关闭对讲回调:', data)
      });

      // 播放器创建后立即隐藏流信息
      if (player && typeof player.displayStreamInfo === 'function') {
        player.displayStreamInfo(false);
      }

      ys7VideoPlayers.value[index] = player;
      console.log(`✓ 通道 ${channelNumber} EZUIKit 播放器初始化成功`);
    } catch (error) {
      console.error(`✗ 初始化通道 ${channelNumber} EZUIKit 播放器失败:`, error);
      ys7VideoPlayers.value[index] = null;
    }
  }
};



// 初始化萤石云视频播放
const initYs7VideoPlayback = async (gateStationCode) => {
  if (!gateStationCode) {
    console.log('闸站代码为空，跳过视频初始化');
    return;
  }

  console.log('初始化萤石云视频播放:', gateStationCode);
  
  // 清理现有播放器
  cleanupYs7Videos();
  
  // 获取视频URL
  await getGateStationVideoUrls(gateStationCode);
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
      let devpoint1 = 'IRDA1.DEVICE.GATE.PROGRESS';
      await setGateOpeningRate(controlDeviceCode.value, devpoint1, '100');
      console.log('一号闸口开启成功');
    }

    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 再开二号闸口
    if (gate2Info) {
      console.log('开启二号闸口...');
      let devpoint2 = 'IRDA2.DEVICE.GATE.PROGRESS';
      await setGateOpeningRate(controlDeviceCode.value, devpoint2, '100');
      console.log('二号闸口开启成功');
    }

    ElMessage.success('全部开闸操作成功');
  } catch (error) {
    console.error('全部开闸操作失败:', error);
    ElMessage.error('全部开闸操作失败');
  }
};

// 关闸逻辑
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
      let devpoint1 = 'IRDA1.DEVICE.GATE.PROGRESS';
      closePromises.push(setGateOpeningRate(controlDeviceCode.value, devpoint1, '0'));
    }

    if (gate2Info) {
      console.log('关闭二号闸口...');
      let devpoint2 = 'IRDA2.DEVICE.GATE.PROGRESS';
      closePromises.push(setGateOpeningRate(controlDeviceCode.value, devpoint2, '0'));
    }

    // 等待所有关闸操作完成
    await Promise.all(closePromises);

    ElMessage.success('全部关闸操作成功');
  } catch (error) {
    console.error('全部关闸操作失败:', error);
    ElMessage.error('全部关闸操作失败');
  }
};

// 设置闸口开度逻辑
const setGateOpeningLogic = async () => {
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

      if (gateOpeningForm.openingValue < 0 || gateOpeningForm.openingValue > 100) {
        ElMessage.error('开度值必须在0-100之间');
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

// 停闸操作
const stopGate = async () => {
  if (!selectedGatePort.value) {
    ElMessage.error('请先选择闸口');
    return;
  }

  if (!controlDeviceCode.value) {
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

// 获取摄像设备
const fetchCameraDevices = async (gateStationCode) => {
  try {
    const devices = await getMonitorDevicesByGateStationCodeApi(gateStationCode);

    if (devices && Array.isArray(devices)) {
      cameraDevices.value = devices;
      console.log('获取到摄像设备:', devices.length, '个');

      // 自动播放所有摄像设备的视频
      if (devices.length > 0) {
        console.log('自动播放摄像设备视频，设备数量:', devices.length);
        await handleMultipleCameraDeviceChange(devices);
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
      const flvUrl = await buildFlvUrl(deviceCode);
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
          
          // 延迟2秒后重新连接
          setTimeout(() => {
            if (videoPlayers.value[playerIndex] && deviceCode) {
              console.log(`重新发送控制命令: ${deviceCode}`);
              sendControlCommandForDevice(deviceCode, playerIndex);
            }
          }, 2000);
        } else {
          ElMessage.error(errorMessage);
        }
      });

      // 加载并播放
      player.load();
      
      // 等待一段时间后开始播放
      setTimeout(() => {
        if (videoPlayers.value[playerIndex]) {
          player.play();
          videoPlayers.value[playerIndex].flvPlayer = player;
        }
      }, 1000);

    } else {
      console.error('浏览器不支持FLV播放');
      ElMessage.error('浏览器不支持FLV播放');
    }
  } catch (error) {
    console.error(`FLV播放器 ${playerIndex} 初始化失败:`, error);
    ElMessage.error(`视频播放器 ${playerIndex} 初始化失败`);
  }
};

// 设置视频引用
const setVideoRef = (el, index) => {
  if (el) {
    videoRefs.value[index] = el;
  }
};

// 移除视频播放器
const removeVideoPlayer = (index) => {
  if (videoPlayers.value[index] && videoPlayers.value[index].flvPlayer) {
    const player = videoPlayers.value[index].flvPlayer;
    try {
      player.pause();
      player.unload();
      player.detachMediaElement();
      player.destroy();
    } catch (error) {
      console.error(`移除播放器 ${index} 失败:`, error);
    }
  }
  videoPlayers.value.splice(index, 1);
  videoRefs.value.splice(index, 1);
};

// 获取视频网格样式类
const getVideoGridClass = () => {
  const count = videoPlayers.value.length;
  if (count === 1) return 'single-video';
  if (count === 2) return 'dual-video';
  if (count <= 4) return 'quad-video';
  return 'multi-video';
};

// 处理摄像设备变化（保留原有函数但不再使用）
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
      const flvUrl = await buildFlvUrl(deviceCode);

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

  // 清理原有的单个播放器
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

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const params = {
      page: 1,
      limit: 100,
      mcsType: 'displacement'
    };

    const response = await getDeviceManagementPage(params);
    if (response && response.list) {
      deviceList.value = response.list;
      // 如果有设备且当前没有选中设备，默认选中第一个
      if (deviceList.value.length > 0 && !selectedDeviceCode.value) {
        selectedDeviceCode.value = deviceList.value[0].deviceCode;
      }
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
  }
};

// 获取环境设备列表
const fetchEnvDeviceList = async () => {
  try {
    envDeviceLoading.value = true;
    const params = {
      page: 1,
      limit: 100,
      mcsType: 'env'
    };

    const response = await getDeviceManagementPage(params);
    if (response && response.list) {
      envDeviceList.value = response.list;
      // 如果有设备且当前没有选中设备，默认选中第一个
      if (envDeviceList.value.length > 0 && !selectedEnvDeviceCode.value) {
        selectedEnvDeviceCode.value = envDeviceList.value[0].deviceCode;
        // 自动获取第一个设备的环境数据
        await fetchEnvironmentData(selectedEnvDeviceCode.value);
      }
    }
  } catch (error) {
    console.error('获取环境设备列表失败:', error);
  } finally {
    envDeviceLoading.value = false;
  }
};

// 环境设备变化处理
const onEnvDeviceChange = async () => {
  if (selectedEnvDeviceCode.value) {
    await fetchEnvironmentData(selectedEnvDeviceCode.value);
  }
};

// 获取环境数据
const fetchEnvironmentData = async (deviceCode) => {
  if (!deviceCode) return;
  
  try {
    envDataLoading.value = true;
    
    // 获取环境概览数据
    const envResponse = await getEnvMcvTitleCollect({ id: deviceCode });
    if (envResponse) {
      envOverviewData.value.windSpeed.value = envResponse.windSpeed || 0;
      envOverviewData.value.pressure.value = envResponse.airPressure || 0;
      envOverviewData.value.temperature.value = envResponse.temperature || 0;
      envOverviewData.value.humidity.value = envResponse.humidity || 0;
    }
    
    // 获取降水量数据
    const precipitationResponse = await getCurrentPrecipitation({ id: deviceCode });
    if (precipitationResponse) {
      envOverviewData.value.rainfall.value = precipitationResponse.precipitation || 0;
    }
    
  } catch (error) {
    console.error('获取环境数据失败:', error);
    // 设置默认值
    envOverviewData.value = {
      pressure: { value: 0, state: 'normal' },
      windSpeed: { value: 0, state: 'normal' },
      temperature: { value: 0, state: 'normal' },
      humidity: { value: 0, state: 'normal' },
      rainfall: { value: 0, state: 'normal' }
    };
  } finally {
    envDataLoading.value = false;
  }
};



// 获取渗压数据
const fetchOsmoticPressureData = async (gateStationCode) => {
  try {
       const gateStationCode = 'FJ.JODY.FH01.Z01.STATION' //临时替换固定值
    const data = await getOsmoticPressureWeekMaxApi(gateStationCode);
    updateSeepagePressureChart(data);
  } catch (error) {
    console.error('获取渗压数据失败:', error);
  }
};

// 更新渗压图表
const updateSeepagePressureChart = (data) => {
  if (seepagePressureChart.value) {
    const chart = echarts.getInstanceByDom(seepagePressureChart.value) || echarts.init(seepagePressureChart.value);

    // 如果没有数据，显示暂无数据
    if (!data || data.length === 0) {
      const option = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        grid: { top: 20, right: 20, bottom: 40, left: 40 },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: '#999' } },
          axisTick: { show: false },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#999' } },
          splitLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#666' }
        },
        series: [{
          data: [],
          type: 'line'
        }]
      };
      chart.setOption(option);
      return;
    }

    // 处理数据：提取日期（MM-DD格式）和渗压值
    const dates = data.map(item => {
      const date = new Date(item.daily);
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    const pressureValues = data.map(item => item.maxWaterPressure);

    const option = {
      title: {
        text: '',
        show: false
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#fff' },
        formatter: function (params) {
          return `${params[0].name}<br/>渗压值: ${params[0].value}kPa`;
        }
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#999' } },
        axisTick: { show: false },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#666' }
      },
      series: [{
        data: pressureValues,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff', width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }]
    };

    chart.setOption(option);
  }
};

// 跳转到渗压详情页面
const gotoSeepage = () => {
  router.push('/main/gate/seepage');
};

// 跳转到渗流量详情页面
const gotoFlow = () => {
  router.push('/main/gate/flow');
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
    // 弹窗打开时，先清理之前的资源，然后重新初始化
    cleanupResources();

    // 重新初始化所有数据和状态
    nextTick(() => {
      initializeModal(props.gateStationCode);
    });
  } else {
    // 弹窗关闭时，清理所有资源
    cleanupResources();
  }
});

// 初始化弹窗
const initializeModal = (gateStationCode) => {
  // 重置tab到默认状态
  activeName.value = 'second';

  // 初始化数据
  fetchGateExtendedInfo(gateStationCode);
  fetchControlDeviceCode(gateStationCode);
  startGateExtInfoTimer(gateStationCode);
  fetchTaskList(gateStationCode);
  fetchDeviceList();
  fetchOsmoticPressureData(gateStationCode);
  fetchEnvDeviceList();

  // 初始化荧石云视频播放
  initYs7VideoPlayback(gateStationCode);

  // 初始化图表
  nextTick(() => {
    if (seepagePressureChart.value) {
      updateSeepagePressureChart([]);
    }
  });
};

// 组件卸载时清理资源
onBeforeUnmount(() => {
  cleanupResources();
});
</script>

<style scoped lang="scss">
.gate-control-modal-overlay {
  position: fixed;
  top: 10%;
  left: 15%;

  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.gate-control-modal {
  background: #0a214d; /* Dark blue background */
  color: white;
  border-radius: 8px;

  max-width: 1500px;

  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #1e4a8c;
  background: #10306a; /* Slightly lighter blue for header */
}

.modal-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #1890ff;
    background: #153e7a;
  }
}

.modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #0a214d;
  max-height: 800px;
  color: white;
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
  border-bottom: 2px solid #1e4a8c;

  span {
    font-size: 18px;
    font-weight: 600;
    color: white;
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
  border-color: #1e4a8c;
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
    top: 10%;
    left: 0;
    right: 45px;
    z-index: 10;
    display: flex;
    justify-content: center;
    padding: 0 5%;
    gap: 20px;

    .gate-info {
      background: rgba(14, 42, 90, 0.9); /* Blue background with transparency */
      border: 1px solid #1e4a8c;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      min-width: 120px;

      .gate-info-title {
        font-weight: bold;
        font-size: 14px;
        color: #a0cfff;
        margin-bottom: 8px;
        text-align: center;
        border-bottom: 1px solid #1e4a8c;
        padding-bottom: 4px;
      }

      .gate-info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 14px;

        .info-label {
          color: #a0cfff;
          margin-right: 8px;
        }

        .info-value {
          color: #ffffff;
          font-weight: 500;
        }
      }
    }

    .gate-info-1 {
      order: 2;
      /* 一号闸口显示在右侧 */
    }

    .gate-info-2 {
      order: 1;
      /* 二号闸口显示在左侧 */
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

  // 闸门状态图片样式
  .gate-status-up,
  .gate-status-down,
  .gate-status-stop {
    position: absolute;
    width: 30px;

    &.gate-1 {
      top: 43%;
      left: 54%;
      transform: translateX(-50%);
    }

    &.gate-2 {
      top: 43%;
      left: 36%;
      transform: translateX(-50%);
    }
  }
}

.gate-status-info {
  margin: 20px 0;
  
  :deep(.el-descriptions__header) {
    .el-descriptions__title {
      color: white !important;
    }
  }
  
  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      .el-descriptions__cell {
        background-color: #0e2a5a !important;
        border-color: #1e4a8c !important;
        color:#fff;
        .el-descriptions__label {
          color: #a0cfff !important;
        }
        
        .el-descriptions__content {
          color: white !important;
        }
      }
    }
  }
}

.gate-port-selection {
  :deep(.el-form-item__label) {
    color: #a0cfff !important;
  }
  
  :deep(.el-select) {
    .el-input {
      .el-input__wrapper {
        background-color: #071a3b !important;
        border: 1px solid #1e4a8c !important;
        
        .el-input__inner {
          background-color: transparent !important;
          color: white !important;
        }
        
        .el-input__suffix {
          .el-input__suffix-inner {
            .el-select__caret {
              color: #a0cfff !important;
            }
          }
        }
      }
    }
  }
}

.gate-opening-control {
  :deep(.el-form-item__label) {
    color: #a0cfff !important;
  }
  
  :deep(.el-input) {
    .el-input__wrapper {
      background-color: #071a3b !important;
      border: 1px solid #1e4a8c !important;
      
      .el-input__inner {
        background-color: transparent !important;
        color: white !important;
      }
      
      .el-input__suffix {
        .el-input__suffix-inner {
          color: #a0cfff !important;
        }
      }
    }
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
    color: white;
    font-weight: 600;
  }
}

/* Element Plus 默认主题样式 */
:deep(.el-divider--vertical) {
  border-color: #1e4a8c;
}

:deep(.el-tabs__nav-scroll) {
  padding-left: 25px;
}

:deep(.el-tabs__header) {
  background-color: #0a214d;
  .el-tabs__nav-wrap:after {
    width:0px;
  }
  .el-tabs__nav-wrap {
    background-color: #0a214d;
    
    .el-tabs__nav {
      background-color: #0a214d;
      
      .el-tabs__item {
        color: #a0cfff !important;
        background-color: transparent;
        border-bottom: 2px solid #1e4a8c;
        
        &.is-active {
          color: white !important;
          // background-color: #1e4a8c;
          border-bottom-color: #1e4a8c;
        }
        
        &:hover:not(.is-active) {
          color: white !important;
          background-color: #153e7a;
        }
      }
    }
  }
  
  .el-tabs__active-bar {
    background-color: #1890ff;
  }
}

:deep(.el-tabs__content) {
  background-color: #0a214d;
  color: white;
}

/* 安全概况样式 */
.safety-overview {
  background: #0e2a5a;
  border: 1px solid #1e4a8c;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin-bottom: 16px;
  }

  .safety-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .reservoir-table {
      width: 100%;
      margin-bottom: 20px;
    }
  }

  .safety-stats {
    .stats-divider {
      width: 100%;
      height: 1px;
      background-color: #1e4a8c;
      margin: 15px 0;
    }

    .stats-row {
      display: flex;
      gap: 40px;
      margin-bottom: 20px;
      align-items: center;
      position: relative;
      justify-content: space-around;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 22px;
          color: #a0cfff;
        }

        .value {
          font-size: 18px;
          font-weight: 600;

          &.safe {
            color: #67c23a;
          }

          &.alert {
            color: #f56c6c;
          }

          &.warning {
            color: #e6a23c;
          }
        }
      }

      .stat-divider-vertical {
        width: 1px;
        height: 40px;
        background-color: #1e4a8c;
      }
    }

    .monitoring-table {
      margin-top: 16px;
      // width: 800px;
    }
  }

  // 渗压渗流量区域样式
  .seepage-section {
    margin: 30px 0;

    .seepage-cards {
      display: flex;
      gap: 24px;

      .seepage-card-with-chart {
        flex: 1;
        background: #0e2a5a;
        border: 1px solid #1e4a8c;
        border-radius: 8px;
        overflow: hidden;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #10306a;
          border-bottom: 1px solid #1e4a8c;

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: white;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;

            .el-icon {
              color: #1890ff;
            }
          }

          .detail-btn {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
            background: #1890ff;
            color: white;
            border: none;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #40a9ff;
            }
          }
        }

        .card-content {
          padding: 20px;
          background: #0e2a5a;

          .status-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .status-item {
              text-align: center;

              .label {
                font-size: 12px;
                color: #a0cfff;
                margin-bottom: 4px;
              }

              .value {
                font-size: 18px;
                font-weight: 600;

                &.safe {
                  color: #67c23a;
                }

                &.alert {
                  color: #e6a23c;
                }

                &.warning {
                  color: #f56c6c;
                }
              }
            }
          }

          .chart-title {
            font-size: 14px;
            color: #a0cfff;
            margin-bottom: 12px;
            text-align: center;
          }

          .chart {
            width: 100%;
            height: 200px;
          }

          .no-device-tip {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #a0cfff;

            .el-icon {
              font-size: 48px;
              margin-bottom: 12px;
              color: #1e4a8c;
            }

            .tip-text {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}

// 多视频播放区域样式
.multi-video-display-area {
  position: relative;
  width: 100%;
  min-height: 450px;
  border: 1px solid #1e4a8c;
  border-radius: 4px;
  overflow: hidden;
  background: #071a3b;
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
  
  // 隐藏 EZUIKit 播放器的工具栏和控制条
  :deep(.ezuikit-video-player) {
    .ezuikit-video-toolbar,
    .ezuikit-video-controls,
    .ezuikit-video-info {
      display: none !important;
    }
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
  }
}

.video-status {
  font-size: 11px;
  
  .loading-text {
    color: #faad14;
  }
  
  .connected-text {
    color: #52c41a;
  }
  
  .disconnected-text {
    color: #f56c6c;
  }
}

.video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  color: #666;
}

// 荧石云视频播放器容器
.ezuikit-video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #1e4a8c;
    border-top: 2px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.video-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  z-index: 5;
}

.no-device-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #a0cfff;

  .el-icon {
    font-size: 48px;
    margin-bottom: 12px;
    color: #1e4a8c;
  }

  .tip-text {
    font-size: 14px;
  }
}

// 加载动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 闸门详情内容区域样式
.gate-details-content {
  width: 1500px;
  height: 800px;
  overflow-y: auto;
  padding-right: 8px;
  background: #0e2a5a;
  color: white;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1e4a8c;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1890ff;
    border-radius: 3px;

    &:hover {
      background: #40a9ff;
    }
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-descriptions) {
  .el-descriptions__header {
    .el-descriptions__title {
      color: white !important;
      font-weight: 600;
    }
  }

  .el-descriptions__body {
    .el-descriptions__table {
      .el-descriptions__cell {
        border-color: #1e4a8c;

        .el-descriptions__label {
          color: #909399 !important; /* 改为灰色 */
          background-color: #10306a;
          font-weight: 500;
        }

        .el-descriptions__content {
          color: white !important;
          background-color: #0e2a5a;
          
          /* 确保内容中的文本是白色，但排除el-tag */
          span:not(.el-tag), div:not(.el-tag), p:not(.el-tag) {
            color: white !important;
          }
          
          /* 保持el-tag的原有颜色 */
          .el-tag {
            color: inherit !important;
            
            &.el-tag--success {
              color: #67c23a !important;
              background-color: #f0f9ff !important;
              border-color: #67c23a !important;
            }
            
            &.el-tag--warning {
              color: #e6a23c !important;
              background-color: #fdf6ec !important;
              border-color: #e6a23c !important;
            }
          }
        }
      }
    }
  }
}

/* 针对闸门情况描述的特殊样式 */
:deep(.gate-status-info) {
  .el-descriptions__content {
    color: white !important;
 
    }
  }


:deep(.el-form) {
  .el-form-item {
    .el-form-item__label {
      color: white;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background-color: #071a3b;
    border: 1px solid #1e4a8c;
    box-shadow: none;

    &:hover {
      border-color: #1890ff;
    }

    &.is-focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .el-input__inner {
      color: white;
      background-color: transparent;

      &::placeholder {
        color: #a0cfff;
      }
    }

    .el-input__suffix {
      .el-input__suffix-inner {
        .el-select__caret {
          color: #a0cfff;
        }
      }
    }
  }
}

:deep(.el-select-dropdown) {
  background-color: #071a3b;
  border: 1px solid #1e4a8c;

  .el-select-dropdown__item {
    color: white;
    background-color: transparent;

    &:hover {
      background-color: #1e4a8c;
    }

    &.selected {
      background-color: #1890ff;
      color: white;
    }
  }
}

:deep(.el-button) {
  &.el-button--primary {
    background-color: #1890ff;
    border-color: #1890ff;

    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }

    &:active {
      background-color: #096dd9;
      border-color: #096dd9;
    }
  }

  &.el-button--default {
    background-color: #071a3b;
    border-color: #1e4a8c;
    color: white;

    &:hover {
      background-color: #1e4a8c;
      border-color: #1890ff;
      color: white;
    }
  }
}

:deep(.el-table) {
  background-color: #0e2a5a;
  color: white;

  .el-table__header {
    background-color: #10306a;

    th {
      background-color: #10306a;
      color: white;
      border-bottom: 1px solid #1e4a8c;
    }
  }

  .el-table__body {
    tr {
      background-color: #0e2a5a;

      &:hover {
        background-color: #1e4a8c;
      }

      td {
        border-bottom: 1px solid #1e4a8c;
        color: white;
      }
    }
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background-color: #071a3b;
    border: 1px solid #1e4a8c;
    box-shadow: none;

    &:hover {
      border-color: #1890ff;
    }

    &.is-focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .el-input__inner {
      color: white;
      background-color: transparent;

      &::placeholder {
        color: #a0cfff;
      }
    }
  }
}

:deep(.el-slider) {
  .el-slider__runway {
    background-color: #1e4a8c;
  }

  .el-slider__bar {
    background-color: #1890ff;
  }

  .el-slider__button {
    border-color: #1890ff;
    background-color: #1890ff;
  }
}

// 环境监测模块样式
.environment-monitoring {
  margin-top: 30px;
  .env-device-selector {
    margin-bottom: 20px;
    
    .el-form-item__label {
      color: white;
      font-weight: 500;
    }
  }

  .env-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-top: 16px;

    .env-metric-card {
      background: linear-gradient(135deg, #1e4a8c 0%, #071a3b 100%);
      border: 1px solid #2c5aa0;
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 6px 20px rgba(24, 144, 255, 0.25);
        transform: translateY(-3px);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #1890ff, #40a9ff);
        border-radius: 12px 12px 0 0;
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .metric-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .metric-unit {
          color: #a0cfff;
          font-size: 12px;
          font-weight: 500;
          background: rgba(160, 207, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid rgba(160, 207, 255, 0.2);
        }
      }

      .metric-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;

        .metric-value {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .metric-status {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 16px;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 60px;

          &.normal {
            background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
            color: #52c41a;
            border: 1px solid rgba(82, 196, 26, 0.4);
            box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
          }

          &.warning {
            background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
            color: #faad14;
            border: 1px solid rgba(250, 173, 20, 0.4);
            box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2);
          }

          &.danger {
            background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
            color: #ff4d4f;
            border: 1px solid rgba(255, 77, 79, 0.4);
            box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
          }
        }
      }

      // 加载状态
      &.loading {
        .metric-content {
          opacity: 0.6;
          
          .metric-value {
            color: #666;
            text-shadow: none;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .env-metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .env-metric-card {
      padding: 12px;

      .metric-content .metric-value {
        font-size: 20px;
      }
    }
  }
}
</style>