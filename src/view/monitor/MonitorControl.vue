<template>
  <el-container class="monitor-control-container">
    <!-- 左侧边栏 -->
    <el-aside width="400px" class="sidebar" v-show="activeTab === 'playback'">
      <div class="location-section">
        <p class="section-title">位置</p>
        <el-input placeholder="搜索水库或位置" v-model="searchKeyword" class="search-input">
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          @node-click="handleNodeClick"
          default-expand-all
          class="location-tree"
        ></el-tree>
      </div>
      <div class="device-selection-section">
        <p class="section-title">摄像枪选择</p>
        <el-select 
        :teleported="false"
          v-model="selectedDevice" 
          placeholder="请选择摄像枪" 
          @change="handleDeviceChange"
          class="device-select"
          :disabled="!currentGateStationCode"
        >
          <el-option
            v-for="device in monitorDevices"
            :key="device.deviceCode"
            :label="device.deviceName"
            :value="device.deviceCode"
          ></el-option>
        </el-select>
        <div v-if="!currentGateStationCode" class="device-tip">
          请先选择闸站
        </div>
     
      </div>
      
      <div class="control-panel-section">
        <!-- <p class="section-title">控制台</p>
        <div class="control-buttons">
          <el-row justify="space-between" class="control-row">
            <el-button circle @click="controlCamera('up-left')" title="左上">↖</el-button>
            <el-button :icon="ArrowUpBold" circle @click="controlCamera('up')" title="上"></el-button>
            <el-button circle @click="controlCamera('up-right')" title="右上">↗</el-button>
          </el-row>
          <el-row justify="space-between" class="control-row">
            <el-button :icon="ArrowLeftBold" circle @click="controlCamera('left')" title="左"></el-button>
            <el-button :icon="Refresh" circle @click="controlCamera('reset')" title="复位"></el-button>
            <el-button :icon="ArrowRightBold" circle @click="controlCamera('right')" title="右"></el-button>
          </el-row>
          <el-row justify="space-between" class="control-row">
            <el-button circle @click="controlCamera('down-left')" title="左下">↙</el-button>
            <el-button :icon="ArrowDownBold" circle @click="controlCamera('down')" title="下"></el-button>
            <el-button circle @click="controlCamera('down-right')" title="右下">↘</el-button>
          </el-row>
          <el-row justify="space-between" class="control-row zoom-row">
             <el-button :icon="ZoomIn" @click="controlCamera('zoomIn')">放大</el-button>
             <el-button :icon="ZoomOut" @click="controlCamera('zoomOut')">缩小</el-button>
          </el-row>
        </div> -->
      </div>
    </el-aside>
    <!-- <div class="video-area-header">
            <div class="window-controls">
              <el-button-group>
                <el-button :icon="FullScreen" @click="toggleSingleWindowLayout" title="单窗口"></el-button>
                <el-button :icon="Menu" @click="toggleQuadWindowLayout" title="四宫格"></el-button>
                <el-button :icon="Grid" @click="toggleNineWindowLayout" title="九宫格"></el-button>
              </el-button-group>
            </div>
          </div> -->
    <!-- 右侧主内容区 -->
    <el-main class="main-content">
      <el-tabs v-model="activeTab" class="video-tabs" @tab-change="handleTabChange" :before-leave="beforeTabLeave">
        <el-tab-pane label="实时预览" name="realtime">
          <!-- 实时预览内容 -->
        </el-tab-pane>
        <el-tab-pane label="视频回放" name="playback">
          <!-- 视频回放内容 -->
        </el-tab-pane>
      </el-tabs>

      <div class="content-wrapper">
        <!-- 时间控制区域 -->
        <div class="time-control-bar" v-show="activeTab === 'playback'">
          <div class="time-inputs">
            <div class="time-input-group">
              <label>时间范围：</label>
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :teleported="false"
                popper-class="custom-date-picker-popper"
                @change="handleTimeRangeChange"
              />
            </div>
            <el-button type="primary" :icon="VideoPlay" @click="playVideo" :disabled="!canPlay">播放</el-button>
          </div>
        </div>
        
        <!-- 实时预览状态信息 -->
        <div class="realtime-control-bar" v-show="activeTab === 'realtime'">
          <div class="realtime-controls">
            <span class="batch-info" v-if="realtimeDevices.length > 0">
              第 {{ currentBatch + 1 }} 批 / 共 {{ getTotalBatches() }} 批 
              ({{ currentPlayingDevices.length }}/{{ realtimeDevices.length }} 个设备)
            </span>
            <div class="layout-controls">
              <el-button-group>
                <el-button 
                  :type="videoLayout === 'three-per-row' ? 'primary' : 'default'"
                  @click="changeVideoLayout('three-per-row')"
                  title="一行三个"
                >
                  3列
                </el-button>
                <el-button 
                  :type="videoLayout === 'four-per-row' ? 'primary' : 'default'"
                  @click="changeVideoLayout('four-per-row')"
                  title="一行四个"
                >
                  4列
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>

        <!-- 视频显示区域 -->
        <div class="video-section">
          <!-- 实时预览网格布局 -->
          <div v-if="activeTab === 'realtime'" class="video-grid-area" :class="{ 'transitioning': isTransitioning, 'layout-three-per-row': videoLayout === 'three-per-row', 'layout-four-per-row': videoLayout === 'four-per-row' }">
            <div 
              v-for="(device, index) in currentPlayingDevices" 
              :key="device.deviceCode"
              class="video-grid-cell"
            >
              <video 
                :ref="el => setVideoRef(el, realtimeDevices.findIndex(d => d.deviceCode === device.deviceCode))"
                class="video-player"
                controls
                muted
                autoplay
                playsinline
                webkit-playsinline
                x5-video-player-type="h5"
                x5-video-orientation="portraint"
              >
                您的浏览器不支持视频播放
              </video>
              <div v-if="!device.videoUrl" class="video-placeholder">
                <p>{{ device.deviceName || `设备 ${index + 1}` }}</p>
                <p class="device-code">{{ device.deviceCode }}</p>
              </div>
              <div class="video-status-overlay">
                <span>{{ device.deviceName || `设备 ${index + 1}` }}</span>
                <span v-if="device.connectTime">{{ device.connectTime }}</span>
              </div>
              
              <!-- 方向控制按钮 -->
              <div class="direction-controls">
                <!-- 第一排：上按钮（位于下按钮正上方） -->
                <div class="direction-row first-row">
                  <button 
                    class="direction-btn direction-up" 
                    @click="handleDirectionControl('up', device.deviceCode)"
                    title="向上"
                  >
                    ↑
                  </button>
                </div>
                <!-- 第二排：左、下、右 -->
                <div class="direction-row second-row">
                  <button 
                    class="direction-btn direction-left" 
                    @click="handleDirectionControl('left', device.deviceCode)"
                    title="向左"
                  >
                    ←
                  </button>
                  <button 
                    class="direction-btn direction-down" 
                    @click="handleDirectionControl('down', device.deviceCode)"
                    title="向下"
                  >
                    ↓
                  </button>
                  <button 
                    class="direction-btn direction-right" 
                    @click="handleDirectionControl('right', device.deviceCode)"
                    title="向右"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 滚动提示 -->
            <div v-if="!isTransitioning && realtimeDevices.length > batchSize" class="scroll-hint">
              <p v-if="currentBatch < getTotalBatches() - 1">向下滚动查看更多设备</p>
              <p v-if="currentBatch > 0">向上滚动返回前面的设备</p>
            </div>
          </div>
          
          <!-- 视频回放单窗口布局 -->
          <div v-else class="video-display-area">
            <div class="video-cell">
              <video 
                ref="videoElement"
                class="video-player"
                controls
                muted
                autoplay
                playsinline
                webkit-playsinline
                x5-video-player-type="h5"
                x5-video-orientation="portraint"
              >
                您的浏览器不支持视频播放
              </video>
              <div v-if="!videoUrl" class="video-placeholder">
                <p>请选择摄像枪查看视频,回放还需要选择时间范围</p>
              </div>
              <div class="video-status-overlay">
                <!-- <span>连接状态: {{ connectionStatus }}</span> -->
                <span v-if="connectTime">连接时间: {{ connectTime }}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import {
  Search,
  ArrowUpBold,
  ArrowDownBold,
  ArrowLeftBold,
  ArrowRightBold,
  Refresh,
  ZoomIn,
  ZoomOut,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue';
import { getMonitorDevicesByGateStationCodeApi, sendDeviceCommandApi, sendBackCommandApi, getDamDirectoryListApi } from '@/api/reservoir';
import { getDeviceManagementPage } from '@/api/device';
import { ElMessage } from 'element-plus';
import flvjs from 'flv.js';

const searchKeyword = ref('');
const activeTab = ref('realtime');
const timeRange = ref([]);
const currentTimestamp = ref('');
const currentVideoLocation = ref('大坝中间'); // 默认或根据选择更新

// 更新时间戳
const updateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const dayOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];
  currentTimestamp.value = `${year}-${month}-${day} ${dayOfWeek} ${hours}:${minutes}:${seconds}`;
};

// 初始化并每秒更新时间
updateTime();
setInterval(updateTime, 1000);



const treeData = ref([]);
const loading = ref(false);
const monitorDevices = ref([]);
const selectedDevice = ref('');
const currentGateStationCode = ref('');
const flvPlayer = ref(null);
const videoElement = ref(null);
const videoUrl = ref('');
const connectionStatus = ref('未连接');
const connectTime = ref('');
const isPlaying = ref(false);

// 实时预览相关变量
const realtimeDevices = ref([]);
const videoElements = ref([]);
const flvPlayers = ref([]);
const streamRequestInterval = ref(null);

// 分批播放相关变量
const batchSize = ref(10); // 每批播放的视频数量
const currentBatch = ref(0); // 当前播放的批次（从0开始）
const isScrolling = ref(false); // 是否正在滚动
const scrollDirection = ref(''); // 滚动方向：'up' 或 'down'
const currentPlayingDevices = ref([]); // 当前正在播放的设备列表
const videoGridContainer = ref(null); // 视频网格容器引用
const isTransitioning = ref(false); // 是否正在过渡中

// 视频布局相关变量
const videoLayout = ref('four-per-row'); // 默认一行三个

// 设置视频元素引用
const setVideoRef = (el, index) => {
  if (el) {
    videoElements.value[index] = el;
  }
};



// 获取大坝目录列表
const fetchDamDirectoryList = async () => {
  try {
    loading.value = true;
    const response = await getDamDirectoryListApi();
    
    // 转换接口数据为树形结构（省-市-区-镇-水库-闸站）
    const transformedData = response.map((provinceData, provinceIndex) => ({
      id: `province_${provinceIndex}`,
      label: provinceData.province,
      children: provinceData.envMcsCityVOS.map((cityData, cityIndex) => ({
        id: `city_${provinceIndex}_${cityIndex}`,
        label: cityData.city,
        children: cityData.envMcsAreaVOS.map((areaData, areaIndex) => ({
          id: `area_${provinceIndex}_${cityIndex}_${areaIndex}`,
          label: areaData.area,
          children: areaData.envMcsTownVOS.map((townData, townIndex) => ({
            id: `town_${provinceIndex}_${cityIndex}_${areaIndex}_${townIndex}`,
            label: townData.town,
            children: townData.reservoirInfoVOS.map((reservoir) => ({
              id: reservoir.id,
              label: reservoir.reservoirName,
              reservoirCode: reservoir.reservoirCode,
              reservoirName: reservoir.reservoirName,
              children: reservoir.deviceGateStationInfoNodeVOS?.map((gateStation) => ({
                id: gateStation.id,
                label: gateStation.gateStationName,
                gateStationCode: gateStation.gateStationCode,
                gateStationName: gateStation.gateStationName,
                reservoirManagementNo: gateStation.reservoirManagementNo
              })) || []
            }))
          }))
        }))
      }))
    }));
    
    treeData.value = transformedData;
    
  } catch (error) {
    console.error('获取大坝目录列表失败:', error);
    ElMessage.error('获取大坝目录列表失败');
  } finally {
    loading.value = false;
  }
};

const defaultProps = {
  children: 'children',
  label: 'label',
};

// 获取监控设备列表
const fetchMonitorDevices = async (gateStationCode) => {
  try {
    const devices = await getMonitorDevicesByGateStationCodeApi(gateStationCode);
    monitorDevices.value = devices;
    selectedDevice.value = ''; // 重置选择的设备
    console.log('获取到监控设备:', devices);
  } catch (error) {
    console.error('获取监控设备失败:', error);
    ElMessage.error('获取监控设备失败');
    monitorDevices.value = [];
  }
};

// 获取实时预览设备列表
const fetchRealtimeDevices = async () => {
  try {
    const response = await getDeviceManagementPage({
      page: 1,
      limit: 100,
      mcsType: 'safemvs'
    });
    
    // 转换设备数据格式
    realtimeDevices.value = response.list.map(device => ({
      deviceCode: device.deviceCode,
      deviceName: device.deviceName,
      videoUrl: '',
      connectionStatus: '未连接',
      connectTime: '',
      isPlaying: false,
      flvPlayer: null
    }));
    
    console.log('获取到实时预览设备:', realtimeDevices.value);
  } catch (error) {
    console.error('获取实时预览设备失败:', error);
    ElMessage.error('获取实时预览设备失败');
    realtimeDevices.value = [];
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
      const originalUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${deviceCode}`;
      const flvUrl = convertUrlProtocol(originalUrl);
      // const flvUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/YN16320506000713`;
      
      // 测试用的公开FLV流地址（如果上面的地址不可用）
      // const testFlvUrl = 'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv';
      
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
        isLive: activeTab.value === 'realtime', // 根据模式动态设置
        hasAudio: false, // 明确指定无音频
        hasVideo: true,
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: undefined,
        lazyLoad: false, // 禁用懒加载，立即加载
        lazyLoadMaxDuration: 3 * 60,
        lazyLoadRecoverDuration: 30,
        // 新增配置项以提高兼容性
        accurateSeek: false, // 禁用精确seek，提高兼容性
        seekType: 'range', // 使用range seek
        rangeLoadZeroStart: false,
        deferLoadAfterSourceOpen: false,
        autoCleanupSourceBuffer: true, // 自动清理缓冲区
        autoCleanupMaxBackwardDuration: 30, // 保留30秒历史数据
        autoCleanupMinBackwardDuration: 10,
        fixAudioTimestampGap: true, // 修复音频时间戳间隙
        reuseRedirectedURL: true,
        // 错误恢复配置
        enableEarlyEofReconnect: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; flv.js)',
          'Cache-Control': 'no-cache'
        }
      });
      
      flvPlayer.value.attachMediaElement(videoElement.value);
      
      // 监听播放器事件
      flvPlayer.value.on(flvjs.Events.LOADING_COMPLETE, () => {
        console.log('FLV加载完成');
        connectionStatus.value = '已连接';
      });
      
      flvPlayer.value.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
        console.log('媒体信息:', mediaInfo);
        // 检查是否有音频流
        if (!mediaInfo.hasAudio) {
          console.log('检测到无音频流，这是正常的');
        }
      });
      
      // 新增：监听元数据加载事件
      flvPlayer.value.on(flvjs.Events.METADATA_ARRIVED, (metadata) => {
        console.log('元数据到达:', metadata);
      });
      
      // 新增：监听统计信息
      flvPlayer.value.on(flvjs.Events.STATISTICS_INFO, (statisticsInfo) => {
        console.log('统计信息:', statisticsInfo);
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
          } else if (errorDetail === 'FormatError') {
            errorMessage = '视频格式错误，可能是编码问题';
          }
        } else if (errorType === 'NetworkError') {
          // 检测到网络错误，可能是自动断流
          errorMessage = '视频流已断开，正在尝试重连...';
          shouldReconnect = true;
        }
        
        if (shouldReconnect && selectedDevice.value) {
          console.log('检测到自动断流，尝试重连...');
          ElMessage.warning('视频流已断开，正在尝试重连...');
          
          // 清理当前播放器
          cleanup();
          
          // 延迟2秒后重新连接
          setTimeout(() => {
            if (selectedDevice.value) {
              console.log('重新发送控制命令:', selectedDevice.value);
              sendControlCommand(selectedDevice.value);
            }
          }, 2000);
        } else {
          ElMessage.error(errorMessage);
          // 清理播放器
          cleanup();
        }
      });
      
      flvPlayer.value.load();
      
      // 等待一段时间后开始播放，并添加更多错误处理
      setTimeout(() => {
        if (flvPlayer.value && videoElement.value) {
          const playPromise = flvPlayer.value.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('视频开始播放');
              isPlaying.value = true;
              connectTime.value = new Date().toLocaleTimeString();
            }).catch((error) => {
              console.error('播放失败:', error);
              // 尝试静音播放
              if (videoElement.value) {
                videoElement.value.muted = true;
                videoElement.value.play().then(() => {
                  console.log('静音播放成功');
                  isPlaying.value = true;
                  connectTime.value = new Date().toLocaleTimeString();
                }).catch((mutedError) => {
                  console.error('静音播放也失败:', mutedError);
                  ElMessage.error('视频播放失败，请检查浏览器设置');
                });
              }
            });
          }
        }
      }, 2000);
      
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

// 清理所有实时预览播放器
const cleanupAllRealtimePlayers = () => {
  flvPlayers.value.forEach((player, index) => {
    if (player) {
      try {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
      } catch (error) {
        console.error(`清理播放器${index}失败:`, error);
      }
    }
  });
  
  flvPlayers.value = [];
  
  // 重置设备状态
  realtimeDevices.value.forEach(device => {
    device.videoUrl = '';
    device.connectionStatus = '未连接';
    device.connectTime = '';
    device.isPlaying = false;
    device.flvPlayer = null;
  });
  
  // 清理定时器
  if (streamRequestInterval.value) {
    clearInterval(streamRequestInterval.value);
    streamRequestInterval.value = null;
  }
};

// 初始化单个设备的FLV播放器（优化版本）
const initSingleFLVPlayer = (url, deviceIndex) => {
  if (!url || deviceIndex < 0 || deviceIndex >= realtimeDevices.value.length) {
    console.error('无效的播放器参数:', { url, deviceIndex });
    return;
  }
  
  const videoElement = videoElements.value[deviceIndex];
  const device = realtimeDevices.value[deviceIndex];
  
  if (!videoElement || !device) {
    console.error(`视频元素或设备数据未找到，索引: ${deviceIndex}`);
    return;
  }
  
  // 如果该设备已有播放器，先清理
  if (flvPlayers.value[deviceIndex]) {
    try {
      flvPlayers.value[deviceIndex].pause();
      flvPlayers.value[deviceIndex].unload();
      flvPlayers.value[deviceIndex].detachMediaElement();
      flvPlayers.value[deviceIndex].destroy();
    } catch (error) {
      console.warn(`清理播放器${deviceIndex}时出错:`, error);
    }
    flvPlayers.value[deviceIndex] = null;
  }
  
  // 重置视频元素状态
  videoElement.src = '';
  videoElement.load();
  
  // 检查FLV.js支持
  if (!flvjs.isSupported()) {
    console.error('浏览器不支持FLV播放');
    device.connectionStatus = 'error';
    return;
  }
  
  try {
    // 创建FLV播放器
    const player = flvjs.createPlayer({
      type: 'flv',
      url: url,
      isLive: true,
      hasAudio: false,
      hasVideo: true,
      enableWorker: false,
      enableStashBuffer: false,
      stashInitialSize: 128,
      autoCleanupSourceBuffer: true,
      autoCleanupMaxBackwardDuration: 3,
      autoCleanupMinBackwardDuration: 2,
      fixAudioTimestampGap: false,
      accurateSeek: false,
      seekType: 'range',
      seekParamStart: 'bstart',
      seekParamEnd: 'bend',
      rangeLoadZeroStart: false,
      lazyLoad: true,
      lazyLoadMaxDuration: 3 * 60,
      lazyLoadRecoverDuration: 30,
      deferLoadAfterSourceOpen: true,
      statisticsInfoReportInterval: 600,
      reuseRedirectedURL: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; flv.js)',
        'Cache-Control': 'no-cache'
      }
    });
    
    // 绑定视频元素
    player.attachMediaElement(videoElement);
    
    // 设置播放器事件监听
    player.on(flvjs.Events.LOADSTART, () => {
      console.log(`播放器${deviceIndex}开始加载`);
      device.connectionStatus = 'connecting';
    });
    
    player.on(flvjs.Events.CANPLAY, () => {
      console.log(`播放器${deviceIndex}可以播放`);
      device.connectionStatus = 'connected';
      device.connectTime = new Date().toLocaleTimeString();
      device.isPlaying = true;
      
      // 自动播放
      videoElement.play().catch(error => {
        console.warn(`播放器${deviceIndex}自动播放失败，尝试静音播放:`, error);
        videoElement.muted = true;
        videoElement.play().catch(e => {
          console.error(`播放器${deviceIndex}静音播放也失败:`, e);
          device.connectionStatus = 'error';
          device.isPlaying = false;
        });
      });
    });
    
    player.on(flvjs.Events.LOADING_COMPLETE, () => {
      console.log(`设备${deviceIndex} FLV加载完成`);
      device.connectionStatus = '已连接';
    });
    
    player.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
      console.error(`播放器${deviceIndex}错误:`, { errorType, errorDetail, errorInfo });
      device.connectionStatus = 'error';
      device.isPlaying = false;
      
      let errorMessage = '视频播放失败';
      let shouldReconnect = false;
      
      if (errorType === 'MediaError') {
        if (errorDetail === 'FormatUnsupported') {
          errorMessage = `播放器 ${deviceIndex} 视频格式不支持，请检查视频流地址`;
        } else if (errorDetail === 'NetworkError') {
          errorMessage = `播放器 ${deviceIndex} 网络连接失败，正在尝试重连...`;
          shouldReconnect = true;
        }
      } else if (errorType === 'NetworkError') {
        // 检测到网络错误，可能是自动断流
        errorMessage = `播放器 ${deviceIndex} 视频流已断开，正在尝试重连...`;
        shouldReconnect = true;
      }
      
      if (shouldReconnect && device.deviceCode) {
        console.log(`检测到播放器 ${deviceIndex} 自动断流，尝试重连设备: ${device.deviceCode}`);
        ElMessage.warning(`播放器 ${deviceIndex} 视频流已断开，正在尝试重连...`);
        
        // 清理当前播放器
        if (player && !player.destroyed) {
          try {
            player.pause();
            player.unload();
            player.detachMediaElement();
            player.destroy();
          } catch (e) {
            console.error(`清理播放器 ${deviceIndex} 失败:`, e);
          }
        }
        flvPlayers.value[deviceIndex] = null;
        
        // 延迟2秒后重新发送控制命令
        setTimeout(() => {
          if (device.deviceCode && realtimeDevices.value[deviceIndex]) {
            console.log(`重新发送控制命令给设备: ${device.deviceCode}`);
            sendRealtimeControlCommand(device.deviceCode, deviceIndex);
          }
        }, 2000);
      } else {
        ElMessage.error(errorMessage);
        
        // 清理错误的播放器
        try {
          player.destroy();
        } catch (e) {
          console.warn(`销毁错误播放器${deviceIndex}时出错:`, e);
        }
        flvPlayers.value[deviceIndex] = null;
      }
    });
    
    // 存储播放器实例
    flvPlayers.value[deviceIndex] = player;
    device.flvPlayer = player;
    device.videoUrl = url;
    
    // 延迟加载，避免同时加载太多视频造成卡顿
    setTimeout(() => {
      try {
        player.load();
      } catch (error) {
        console.error(`播放器${deviceIndex}加载失败:`, error);
        device.connectionStatus = 'error';
        device.isPlaying = false;
      }
    }, deviceIndex * 100); // 每个播放器延迟100ms加载
    
  } catch (error) {
    console.error(`创建播放器${deviceIndex}失败:`, error);
    device.connectionStatus = 'error';
    device.isPlaying = false;
  }
};

// URL协议转换函数，解决浏览器并发连接限制
const convertUrlProtocol = (url) => {
  let tempUrl = url;
  if (url.indexOf("https") !== -1) {
    tempUrl = url.replace(/https/, 'wss');
  } else if (url.indexOf("http") !== -1) {
    tempUrl = url.replace(/http/, 'ws');
  }
  return tempUrl;
};

const handleNodeClick = (data) => {
  console.log('点击节点:', data);
  currentVideoLocation.value = data.label;
  
  // 如果点击的是闸站节点（有gateStationCode），获取对应的监控设备
  if (data.gateStationCode) {
    currentGateStationCode.value = data.gateStationCode;
    fetchMonitorDevices(data.gateStationCode);
    // 清理当前视频
    cleanup();
  }
};

// 处理设备选择变化
const handleDeviceChange = (deviceCode) => {
  if (deviceCode) {
    console.log('选择设备:', deviceCode);
    // 不再自动播放，需要用户点击播放按钮
  }
};



const videoLayoutMode = ref('single'); // 'single', 'quad', 'nine'

const controlCamera = (action) => {
  console.log('控制摄像头:', action);
  // 在这里实现摄像头控制逻辑, action 可以是 'up', 'down', 'left', 'right', 'reset', 'zoomIn', 'zoomOut',
  // 'up-left', 'up-right', 'down-left', 'down-right'
};

const toggleSingleWindowLayout = () => {
  videoLayoutMode.value = 'single';
  console.log('切换到单窗口模式 (1x1)');
  // Logic to display 1 video is handled by the template and videoLayoutMode
};

const toggleQuadWindowLayout = () => {
  videoLayoutMode.value = 'quad';
  console.log('切换到四宫格模式 (2x2)');
  // Logic to display 4 videos is handled by the template and videoLayoutMode
};

const toggleNineWindowLayout = () => {
  videoLayoutMode.value = 'nine';
  console.log('切换到九宫格模式 (3x3)');
  // Logic to display 9 videos is handled by the template and videoLayoutMode
};



const startTime = ref('');
const endTime = ref('');
const selectedRecording = ref(null);

// 计算是否可以播放
const canPlay = computed(() => {
  // 只要选择了时间范围就可以点击播放按钮，设备选择在播放时验证
  return timeRange.value && timeRange.value.length === 2;
});

// 发送视频回放命令
const sendBackCommand = async (status, startTime = '', endTime = '') => {
  if (!selectedDevice.value) return;
  
  try {
    const topic = `YN/0000/769834/control/${selectedDevice.value}`;
    const result = await sendBackCommandApi(topic, status, startTime, endTime);
    
    console.log('发送回放命令结果:', result);
    return result;
  } catch (error) {
    console.error('发送回放命令失败:', error);
    ElMessage.error('发送回放命令失败');
    throw error;
  }
};

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  if (value && value.length === 2) {
    startTime.value = value[0];
    endTime.value = value[1];
  } else {
    startTime.value = '';
    endTime.value = '';
  }
};

// 播放视频回放
const playVideo = async () => {
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择摄像枪');
    return;
  }
  
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElMessage.warning('请选择时间范围');
    return;
  }
  
  try {
    await sendBackCommand(2, startTime.value, endTime.value);
    sendControlCommand(selectedDevice.value);
    ElMessage.success('开始播放视频回放');
    // 这里可以添加播放回放视频的逻辑
  } catch (error) {
    ElMessage.error('播放视频回放失败');
  }
};

// 批量发送设备控制命令
const sendBatchControlCommands = async () => {
  if (realtimeDevices.value.length === 0) {
    ElMessage.warning('没有可用的设备');
    return;
  }
  
  let successCount = 0;
  let currentIndex = 0;
  
  const sendNextCommand = async () => {
    if (currentIndex >= realtimeDevices.value.length) {
      ElMessage.success(`成功发送 ${successCount}/${realtimeDevices.value.length} 个设备的取流命令`);
      return;
    }
    
    const device = realtimeDevices.value[currentIndex];
    
    try {
      const topic = `YN/0000/769834/control/${device.deviceCode}`;
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
      console.log(`设备${device.deviceCode}控制命令结果:`, result);
      
      if (result === "发送取流命令成功！") {
        successCount++;
        
        // 构建FLV视频流地址
        const originalUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${device.deviceCode}`;
        const flvUrl = convertUrlProtocol(originalUrl);
        console.log(`准备播放设备${currentIndex}的FLV流:`, flvUrl);
        
        // 保存当前索引，避免异步调用时索引值变化
        const deviceIndex = currentIndex;
        
        // 延迟初始化播放器，让设备准备好
        setTimeout(() => {
          initSingleFLVPlayer(flvUrl, deviceIndex);
        }, 2000);
      }
    } catch (error) {
      console.error(`设备${device.deviceCode}控制命令失败:`, error);
    }
    
    currentIndex++;
    
    // 100ms间隔发送下一个命令
    setTimeout(sendNextCommand, 100);
  };
  
  // 开始发送命令
  sendNextCommand();
};

// 播放实时预览（修改为分批播放）
const playRealtime = async () => {
  if (activeTab.value !== 'realtime') {
    return;
  }
  
  if (realtimeDevices.value.length === 0) {
    ElMessage.warning('没有可用的设备，正在获取设备列表...');
    await fetchRealtimeDevices();
    if (realtimeDevices.value.length === 0) {
      ElMessage.error('获取设备列表失败');
      return;
    }
  }
  
  try {
    // 清理现有播放器
    cleanupAllRealtimePlayers();
    
    // 重置批次状态
    currentBatch.value = 0;
    isTransitioning.value = false;
    
    // 获取第一批设备
    const firstBatchDevices = getCurrentBatchDevices();
    currentPlayingDevices.value = firstBatchDevices;
    
    // 播放第一批设备
    await playCurrentBatch();
    
    ElMessage.success(`开始播放前${firstBatchDevices.length}个设备，可通过滚动切换批次`);
  } catch (error) {
    ElMessage.error('播放实时预览失败');
  }
};

// Tab切换前的验证
const beforeTabLeave = (activeName, oldActiveName) => {
  // 允许自由切换tab，不再需要预先选择设备
  return true;
};

// 处理Tab切换
const handleTabChange = async (tabName) => {
  console.log('切换到Tab:', tabName);
  
  if (tabName === 'realtime') {
    // 切换到实时预览
    // 先停止回放模式的流
    if (selectedDevice.value) {
      await sendStopStreamCommand(selectedDevice.value);
    }
    
    // 清理回放播放器
    cleanup();
    
    // 获取实时预览设备列表
    await fetchRealtimeDevices();
    
    // 自动触发播放设备功能
    if (realtimeDevices.value.length > 0) {
      setTimeout(() => {
        playRealtime();
      }, 1000); // 延迟1秒确保切换完成
    }
    
    // 发送status=0的命令
    try {
      if (selectedDevice.value) {
        await sendBackCommand(0);
      }
    } catch (error) {
      console.error('切换到实时预览失败:', error);
    }
  } else if (tabName === 'playback') {
    // 切换到视频回放
    // 清理所有实时预览播放器
    cleanupAllRealtimePlayers();
    
    // 发送status=2的命令（如果有时间范围）
    if (timeRange.value && timeRange.value.length === 2 && selectedDevice.value) {
      try {
        await sendBackCommand(2, startTime.value, endTime.value);
      } catch (error) {
        console.error('切换到视频回放失败:', error);
      }
    }
  }
};

const togglePlayPause = () => {
  if (videoElement.value) {
    if (videoElement.value.paused) {
      videoElement.value.play();
      isPlaying.value = true;
    } else {
      videoElement.value.pause();
      isPlaying.value = false;
    }
  }
};



// 计算当前批次应该显示的设备
const getCurrentBatchDevices = () => {
  const startIndex = currentBatch.value * batchSize.value;
  const endIndex = Math.min(startIndex + batchSize.value, realtimeDevices.value.length);
  return realtimeDevices.value.slice(startIndex, endIndex);
};

// 计算总批次数
const getTotalBatches = () => {
  return Math.ceil(realtimeDevices.value.length / batchSize.value);
};

// 切换视频布局
const changeVideoLayout = (layout) => {
  videoLayout.value = layout;
  
  // 根据布局调整每批显示的视频数量
  if (layout === 'three-per-row') {
    batchSize.value = 9; // 3行 x 3列 = 9个视频
  } else if (layout === 'four-per-row') {
    batchSize.value = 12; // 3行 x 4列 = 12个视频
  }
  
  // 重新计算当前批次的设备
  if (realtimeDevices.value.length > 0) {
    // 确保当前批次不超出范围
    const totalBatches = getTotalBatches();
    if (currentBatch.value >= totalBatches) {
      currentBatch.value = totalBatches - 1;
    }
    
    // 更新当前播放的设备列表
    const newBatchDevices = getCurrentBatchDevices();
    currentPlayingDevices.value = newBatchDevices;
    
    // 重新播放当前批次
    if (activeTab.value === 'realtime') {
      playCurrentBatch();
    }
  }
  
  console.log(`切换到${layout}布局，每批${batchSize.value}个视频`);
};

// 滚动监听处理函数
const handleScroll = (event) => {
  if (isTransitioning.value || activeTab.value !== 'realtime') return;
  
  const delta = event.deltaY;
  const totalBatches = getTotalBatches();
  
  if (delta > 0 && currentBatch.value < totalBatches - 1) {
    // 向下滚动，播放下一批
    scrollDirection.value = 'down';
    switchToBatch(currentBatch.value + 1);
  } else if (delta < 0 && currentBatch.value > 0) {
    // 向上滚动，播放上一批
    scrollDirection.value = 'up';
    switchToBatch(currentBatch.value - 1);
  }
};

// 切换到指定批次
const switchToBatch = async (batchIndex) => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  
  try {
    // 先清理当前播放的视频
    await cleanupCurrentBatchPlayers();
    
    // 更新当前批次
    currentBatch.value = batchIndex;
    
    // 获取新批次的设备
    const newBatchDevices = getCurrentBatchDevices();
    currentPlayingDevices.value = newBatchDevices;
    
    // 延迟一下再开始播放新批次，提供过渡效果
    setTimeout(async () => {
      await playCurrentBatch();
      isTransitioning.value = false;
    }, 300);
    
  } catch (error) {
    console.error('切换批次失败:', error);
    isTransitioning.value = false;
  }
};

// 清理当前批次的播放器（优化版本）
const cleanupCurrentBatchPlayers = async () => {
  if (currentPlayingDevices.value.length === 0) {
    return;
  }
  
  // 使用 Promise.all 并行清理所有播放器，提高性能
  const cleanupPromises = currentPlayingDevices.value.map(async (device, index) => {
    const deviceIndex = realtimeDevices.value.findIndex(d => d.deviceCode === device.deviceCode);
    if (deviceIndex === -1 || !flvPlayers.value[deviceIndex]) {
      return;
    }
    
    try {
      const player = flvPlayers.value[deviceIndex];
      
      // 先暂停播放
      if (player && typeof player.pause === 'function') {
        player.pause();
      }
      
      // 卸载媒体源
      if (player && typeof player.unload === 'function') {
        player.unload();
      }
      
      // 分离媒体元素
      if (player && typeof player.detachMediaElement === 'function') {
        player.detachMediaElement();
      }
      
      // 销毁播放器实例
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
      
      // 清空播放器引用
      flvPlayers.value[deviceIndex] = null;
      
      // 重置设备状态
      const deviceData = realtimeDevices.value[deviceIndex];
      if (deviceData) {
        deviceData.videoUrl = '';
        deviceData.connectionStatus = '未连接';
        deviceData.connectTime = '';
        deviceData.isPlaying = false;
        deviceData.flvPlayer = null;
      }
      
    } catch (error) {
      console.error(`清理设备${deviceIndex}播放器失败:`, error);
    }
  });
  
  // 等待所有清理操作完成
  await Promise.allSettled(cleanupPromises);
  
  // 清理完成后重置当前播放设备列表
  currentPlayingDevices.value = [];
};

// 播放当前批次
const playCurrentBatch = async () => {
  const currentDevices = getCurrentBatchDevices();
  
  // 批量发送控制命令
  await sendBatchControlCommandsForBatch(currentDevices);
};

// 为指定批次发送批量控制命令（优化版本）
const sendBatchControlCommandsForBatch = async (devices) => {
  if (!devices || devices.length === 0) {
    console.log('没有设备需要发送命令');
    return;
  }
  
  // 使用并发控制，避免同时发送太多请求
  const concurrencyLimit = 3; // 最多同时处理3个设备
  const results = [];
  
  for (let i = 0; i < devices.length; i += concurrencyLimit) {
    const batch = devices.slice(i, i + concurrencyLimit);
    
    const batchPromises = batch.map(async (device) => {
      const deviceIndex = realtimeDevices.value.findIndex(d => d.deviceCode === device.deviceCode);
      
      if (deviceIndex === -1) {
        return { success: false, deviceCode: device.deviceCode, error: '设备未找到' };
      }
      
      try {
        // 发送控制命令
        await sendControlCommand(device.deviceCode);
        
        // 构建FLV视频流地址
        const originalUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${device.deviceCode}`;
        const flvUrl = convertUrlProtocol(originalUrl);
        console.log(`设备${deviceIndex} FLV地址:`, flvUrl);
        
        // 初始化FLV播放器
        initSingleFLVPlayer(flvUrl, deviceIndex);
        
        return { success: true, deviceCode: device.deviceCode };
      } catch (error) {
        console.error(`设备${deviceIndex}发送命令失败:`, error);
        return { success: false, deviceCode: device.deviceCode, error: error.message };
      }
    });
    
    // 等待当前批次完成
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // 批次间延迟，避免服务器压力过大
    if (i + concurrencyLimit < devices.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // 统计结果
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failCount = results.length - successCount;
  
  console.log(`批次播放完成: 成功${successCount}个, 失败${failCount}个`);
  
  if (failCount > 0) {
    ElMessage.warning(`部分设备启动失败: ${failCount}个设备未能正常播放`);
  }
};

// 组件挂载时初始化
onMounted(async () => {
  console.log('MonitorControl组件挂载');
  fetchDamDirectoryList();
  
  // 如果当前是实时预览模式，获取设备列表并自动播放
  if (activeTab.value === 'realtime') {
    await fetchRealtimeDevices();
    // 自动触发播放设备功能
    if (realtimeDevices.value.length > 0) {
      setTimeout(() => {
        playRealtime();
      }, 1000); // 延迟1秒确保组件完全加载
    }
  }
  
  // 添加滚动监听
  const videoGridArea = document.querySelector('.video-grid-area');
  if (videoGridArea) {
    videoGridArea.addEventListener('wheel', handleScroll, { passive: false });
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

// 方向控制函数
const handleDirectionControl = async (direction, deviceCode) => {
  if (!deviceCode) {
    ElMessage.warning('设备代码不能为空');
    return;
  }
  
  console.log(`控制设备 ${deviceCode} 向 ${direction} 方向移动`);
  
  try {
    // 构建控制命令的topic和payload
    const topic = `YN/SX100/HECHENG/control/${deviceCode}`;
    
    // 根据方向设置对应的控制命令（使用pelco协议格式）
    let controlCommand = {};
    
    switch (direction) {
      case 'up':
        controlCommand = {
          "command": "config",
          "pelco": {
            "force": 255,
            "control": "up"
          }
        };
        break;
      case 'down':
        controlCommand = {
          "command": "config",
          "pelco": {
            "force": 255,
            "control": "down"
          }
        };
        break;
      case 'left':
        controlCommand = {
          "command": "config",
          "pelco": {
            "force": 255,
            "control": "left"
          }
        };
        break;
      case 'right':
        controlCommand = {
          "command": "config",
          "pelco": {
            "force": 255,
            "control": "right"
          }
        };
        break;
      default:
        console.warn('未知的方向控制命令:', direction);
        ElMessage.warning(`未知的方向控制命令: ${direction}`);
        return;
    }
    
    const payloadStr = JSON.stringify(controlCommand);
    
    // 发送控制命令
    const result = await sendDeviceCommandApi(topic, payloadStr);
    console.log(`设备 ${deviceCode} ${direction} 方向控制命令发送结果:`, result);
    
    // 根据返回结果进行相应处理
    if (result && typeof result === 'string' && result.includes('成功')) {
      ElMessage.success(`设备 ${deviceCode} 已执行${getDirectionText(direction)}控制`);
    } else {
      console.warn(`设备 ${deviceCode} ${direction} 方向控制命令返回异常结果:`, result);
      ElMessage.success(`设备 ${deviceCode} ${getDirectionText(direction)}控制命令已发送`);
    }
    
  } catch (error) {
    console.error(`设备 ${deviceCode} ${direction} 方向控制失败:`, error);
    ElMessage.error(`设备 ${deviceCode} ${getDirectionText(direction)}控制失败: ${error.message || error}`);
  }
};

// 获取方向的中文文本
const getDirectionText = (direction) => {
  const directionMap = {
    'up': '向上',
    'down': '向下',
    'left': '向左',
    'right': '向右'
  };
  return directionMap[direction] || direction;
};

// 组件卸载时清理资源
onBeforeUnmount(async () => {
  console.log('MonitorControl组件卸载，清理资源');
  
  // 移除滚动监听
  const videoGridArea = document.querySelector('.video-grid-area');
  if (videoGridArea) {
    videoGridArea.removeEventListener('wheel', handleScroll);
  }
  
  // 发送停止取流命令
  if (selectedDevice.value) {
    await sendStopStreamCommand(selectedDevice.value);
  }
  
  // 清理所有播放器
  cleanup();
  cleanupAllRealtimePlayers();
});

</script>

<style scoped>
.monitor-control-container {
  height: 100%; /* 假设顶部导航栏高度为60px */
  border: 1px solid #eee;
}

.sidebar {
  border-right: 1px solid #eee;
  padding: 15px;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.device-selection-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.device-select {
  width: 100%;
  margin-bottom: 8px;
}

.device-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.search-input {
  margin-bottom: 15px;
}

.location-tree {
  flex-grow: 1;
  overflow-y: auto;
  background-color: transparent;
}

.control-panel-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.control-buttons .el-button {
  margin: 5px;
}
.control-buttons .el-row {
    margin-bottom: 5px;
}

.control-row {
  margin-top: 5px;
  margin-bottom: 5px;
}

.zoom-row .el-button {
    width: auto; /* 让放大缩小按钮根据内容调整宽度 */
    padding-left: 15px;
    padding-right: 15px;
}

.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.video-tabs {
  width:100%;
  padding: 0 15px; /* 给tabs一些内边距，避免贴边 */
  border-bottom: 1px solid #eee;
}

.video-tabs .el-tabs__header {
  margin-bottom: 0; /* 移除tabs头部下方的默认margin */
}

.video-area-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px 15px;
  border-bottom: 1px solid #eee;
  background-color: #f1f3f5;
  position: absolute;
    right: 10px;
    z-index:10;
}

.video-display-area {
  flex-grow: 1;
  background-color: #000; /* 视频区域通常为黑色背景 */
  display: flex;
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

.video-grid-area {
  flex-grow: 1;
  background-color: #000;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  padding: 2px;
  overflow-y: auto;
  position: relative;
  transition: opacity 0.3s ease-in-out;
}

/* 一行三个布局 */
.video-grid-area.layout-three-per-row {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* 一行四个布局 */
.video-grid-area.layout-four-per-row {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.video-grid-area.transitioning {
  opacity: 0.5;
  pointer-events: none;
}

.video-grid-cell {
  position: relative;
  aspect-ratio: 16/9;
  background: #1a1a1a;
  border: 1px solid #333;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
}

.video-grid-area.transitioning .video-grid-cell {
  transform: translateY(10px);
  opacity: 0.8;
}

.scroll-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 12px;
  text-align: center;
  z-index: 10;
  animation: fadeInOut 2s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.batch-info {
  margin-left: 15px;
  font-size: 14px;
  color: #666;
  background: rgba(0, 0, 0, 0.05);
  padding: 5px 10px;
  border-radius: 15px;
}

.realtime-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.video-grid-cell .video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #2a2a2a;
}

.video-grid-cell .video-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 10px;
}

.video-grid-cell .video-placeholder .device-code {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  word-break: break-all;
}

.video-grid-cell .video-status-overlay {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 120px;
  word-break: break-all;
}

/* 方向控制按钮样式 */
/* 方向控制按钮样式 */
.video-grid-cell .direction-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.video-grid-cell:hover .direction-controls {
  opacity: 1;
  pointer-events: auto;
}

.direction-controls .direction-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: all 0.2s ease;
  user-select: none;
}

.direction-controls .direction-btn:hover {
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.direction-controls .direction-btn:active {
  transform: scale(0.95);
}

/* 按钮行布局 */
.direction-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.direction-row.first-row {
  /* 第一排：上按钮 */
}

.direction-row.second-row {
  /* 第二排：左、下、右按钮 */
}

.video-cell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #1a1a1a;
  min-height: 400px;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #2a2a2a;
}

.video-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 16px;
  text-align: center;
}

.video-status-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.video-timestamp {
  position: absolute;
  top: 15px;
  left: 15px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.video-location-overlay {
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
}

/* Element Plus Tree 自定义样式 (可选) */
:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f7ff;
  color: #1890ff;
}

.content-wrapper {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}

.video-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.video-controls {
  position: absolute;
  top: 10px;
  right: 10px;
}

.play-pause-btn {
  margin-left: 5px;
}

.time-control-bar {
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
}

.realtime-control-bar {
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
}

.time-inputs {
  display: flex;
  gap: 20px;
  align-items: center;
}

.realtime-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.layout-controls {
  display: flex;
  align-items: center;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}





/* 针对时间控制面板中的日期选择器 */
.time-control-panel :deep(.el-date-editor) {
  width: 100%;
}

.time-control-panel :deep(.el-picker-panel) {
  position: absolute !important;
}
</style>