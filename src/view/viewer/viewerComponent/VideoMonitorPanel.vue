<template>
  <div v-if="show" class="video-monitor-panel-overlay" @click.self="closePanel">
    <div class="video-monitor-panel">
      <div class="panel-header">
        <span class="panel-title">{{ panelTitle }}</span>
        <button class="close-button" @click="closePanel">×</button>
      </div>

      <div class="device-info-bar">
        <div class="info-item">
          <span class="label">设备名称</span>
          <span class="value">{{ deviceInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备编号</span>
          <span class="value">{{ deviceInfo.deviceCode }}</span>
        </div>
        <div class="info-item">
          <span class="label">监测项目</span>
          <span class="value">{{ deviceInfo.monitorItem }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备状态</span>
          <span class="value" :class="statusClass">{{ deviceInfo.status }}</span>
        </div>
      </div>

      <div class="tab-navigation">
        <button 
          :class="{ active: currentTab === 'realtimeVideo' }" 
          @click="currentTab = 'realtimeVideo'"
        >
          实时视频
        </button>
        <!-- <button 
          :class="{ active: currentTab === 'basicInfo' }" 
          @click="currentTab = 'basicInfo'"
        >
          基本信息
        </button> -->
      </div>

      <div class="tab-content">
        <div v-if="currentTab === 'realtimeVideo'" class="realtime-video-tab">
          <div class="video-player-container">
            <video 
              ref="videoElement"
              class="video-player"
              controls
              muted
              autoplay
            >
              您的浏览器不支持视频播放
            </video>
            <div v-if="!videoUrl" class="video-placeholder">
              <p>{{ connectionStatus }}</p>
            </div>
            <div class="video-status-overlay" v-if="videoUrl">
              <span>连接状态: {{ connectionStatus }}</span>
              <span v-if="connectTime">连接时间: {{ connectTime }}</span>
            </div>
          </div>
          <div class="video-status-bar">
            <span class="live-indicator">● 实时视频</span>
            <button class="fullscreen-button">❐</button>
          </div>
        </div>
        <div v-if="currentTab === 'basicInfo'" class="basic-info-tab">
          <div class="info-grid">
            <div class="grid-item"><span class="grid-label">所属区域:</span> <span class="grid-value">{{ basicInfo.area }}</span></div>
            <div class="grid-item"><span class="grid-label">设备厂商:</span> <span class="grid-value">{{ basicInfo.manufacturer }}</span></div>
            <div class="grid-item"><span class="grid-label">设备型号:</span> <span class="grid-value">{{ basicInfo.model }}</span></div>
            <div class="grid-item"><span class="grid-label">负责人:</span> <span class="grid-value">{{ basicInfo.personInCharge }}</span></div>
            <div class="grid-item"><span class="grid-label">联系电话:</span> <span class="grid-value">{{ basicInfo.contact }}</span></div>
            <div class="grid-item"><span class="grid-label">经度:</span> <span class="grid-value">{{ basicInfo.longitude }}</span></div>
            <div class="grid-item"><span class="grid-label">纬度:</span> <span class="grid-value">{{ basicInfo.latitude }}</span></div>
            <div class="grid-item"><span class="grid-label">高度:</span> <span class="grid-value">{{ basicInfo.altitude }}</span></div>
            <div class="grid-item full-width"><span class="grid-label">备注:</span> <span class="grid-value">{{ basicInfo.remarks }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import flvjs from 'flv.js';
import { sendDeviceCommandApi } from '@/api/reservoir';

interface DeviceInfo {
  name: string;
  id: string;
  deviceCode: string;
  monitorItem: string;
  status: string;
}

interface BasicInfo {
  area: string;
  manufacturer: string;
  model: string;
  personInCharge: string;
  contact: string;
  longitude: string;
  latitude: string;
  altitude: string;
  remarks: string;
}

const props = defineProps<{
  show: boolean;
  panelTitle?: string;
  deviceData?: any; // 用于接收从Billboard点击事件传递的数据
  deviceCode?: string; // 新增设备编码属性，用于视频播放
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentTab = ref('realtimeVideo'); // 默认显示实时视频
const videoElement = ref<HTMLVideoElement | null>(null);
const flvPlayer = ref<any>(null);
const videoUrl = ref('');
const connectionStatus = ref('');
const connectTime = ref('');
const isPlaying = ref(false);

const deviceInfo = computed<DeviceInfo>(() => {
  // 根据 props.deviceData 解析或设置默认值
  return {
    name: props.deviceData?.name || 'XXXXXXXXXX',
    id: props.deviceData?.id || 'XXX',
    deviceCode: props.deviceData?.deviceCode || props.deviceCode || 'XXX',
    monitorItem: props.deviceData?.monitorItem || 'XXX',
    status: props.deviceData?.status || 'XXX',
  };
});

const basicInfo = computed<BasicInfo>(() => {
  // 根据 props.deviceData 解析或设置默认值
  return {
    area: props.deviceData?.basicInfo?.area || 'XXX',
    manufacturer: props.deviceData?.basicInfo?.manufacturer || 'XXX',
    model: props.deviceData?.basicInfo?.model || 'XXX',
    personInCharge: props.deviceData?.basicInfo?.personInCharge || 'XXX',
    contact: props.deviceData?.basicInfo?.contact || 'XXX',
    longitude: props.deviceData?.basicInfo?.longitude || 'XXX',
    latitude: props.deviceData?.basicInfo?.latitude || 'XXX',
    altitude: props.deviceData?.basicInfo?.altitude || 'XXX',
    remarks: props.deviceData?.basicInfo?.remarks || 'XXXXXXXXXX',
  };
});

const statusClass = computed(() => {
  // 根据设备状态返回不同的class，用于样式控制
  if (deviceInfo.value.status === '在线' || deviceInfo.value.status === '正常') {
    return 'status-online';
  }
  return 'status-offline';
});

const closePanel = async () => {
  // 发送停止推流命令
  if (deviceInfo.value.deviceCode && deviceInfo.value.deviceCode !== 'XXX') {
    await sendStopStreamCommand(deviceInfo.value.deviceCode);
  }
  cleanup(); // 关闭面板前清理播放器资源
  emit('close');
};

// 初始化FLV播放器
const initFLVPlayer = (url: string) => {
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
      
      flvPlayer.value.on(flvjs.Events.MEDIA_INFO, (mediaInfo: any) => {
        console.log('媒体信息:', mediaInfo);
      });
      
      flvPlayer.value.on(flvjs.Events.ERROR, (errorType: string, errorDetail: string, errorInfo: any) => {
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

  connectTime.value = '';
};

// 发送设备控制命令并播放视频
const playVideo = async (deviceCode: string) => {
  if (!deviceCode) {
    connectionStatus.value = '设备编码为空，无法播放视频';
    return;
  }
  
  connectionStatus.value = '正在连接...';
  
  try {
    // 先发送推流命令
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
    
    if (result.data === "发送取流命令成功！" || result === "发送取流命令成功！") {
      ElMessage.success('发送取流命令成功！');
      // 构建FLV视频流地址
      const flvUrl = `http://220.250.41.136:8866/live?url=rtmp://119.3.245.90/live/${deviceCode}`;
      
      console.log('准备播放FLV流:', flvUrl);
      videoUrl.value = flvUrl;
      
      // 等待设备准备好后开始播放视频
      setTimeout(() => {
        initFLVPlayer(flvUrl);
      }, 2000);
    } else {
      ElMessage.error('发送控制命令失败');
      connectionStatus.value = '推流命令失败';
    }
  } catch (error) {
    console.error('播放视频失败:', error);
    connectionStatus.value = '连接失败';
    ElMessage.error('播放视频失败');
  }
};

// 发送停止推流命令
const sendStopStreamCommand = async (deviceCode: string) => {
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
    console.log('发送停止推流命令结果:', result);
  } catch (error) {
    console.error('发送停止推流命令失败:', error);
  }
};

watch(() => props.show, async (newVal) => {
  if (newVal) {
    currentTab.value = 'realtimeVideo'; // 每次打开时重置到实时视频tab
    // 如果有设备编码，自动播放视频
    if (props.deviceCode) {
      playVideo(props.deviceCode);
    }
  } else {
    // 关闭面板时发送停止推流命令并清理资源
    if (deviceInfo.value.deviceCode && deviceInfo.value.deviceCode !== 'XXX') {
      await sendStopStreamCommand(deviceInfo.value.deviceCode);
    }
    cleanup();
  }
});

// 监听设备编码变化
watch(() => props.deviceCode, (newVal) => {
  if (props.show && newVal) {
    playVideo(newVal);
  }
});

// 组件卸载前清理资源
onBeforeUnmount(async () => {
  // 发送停止推流命令
  if (deviceInfo.value.deviceCode && deviceInfo.value.deviceCode !== 'XXX') {
    await sendStopStreamCommand(deviceInfo.value.deviceCode);
  }
  cleanup();
});

</script>

<style scoped>
.video-monitor-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500; /* 高于其他弹窗 */
}

.video-monitor-panel {
  width: 800px; /* 根据图片调整宽度 */
  max-height: 90vh;
  background-color: #0A1A3D; /* 深蓝背景，与图片一致 */
  border: 1px solid #1E3F66;
  border-radius: 6px;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 25px rgba(0,0,0,0.5);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #10244E; /* 头部深色背景 */
  border-bottom: 1px solid #1E3F66;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #E0F2F7;
}

.close-button {
  background: transparent;
  border: none;
  color: #E0F2F7;
  font-size: 24px;
  cursor: pointer;
}

.device-info-bar {
  display: flex;
  justify-content: space-around;
  padding: 10px 20px;
  background-color: rgba(16, 36, 78, 0.8); /* 头部下方信息栏背景 */
  border-bottom: 1px solid #1E3F66;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #A9CBFF;
}

.info-item .label {
  margin-right: 8px;
  color: #7BA0D1;
}
.info-item .value {
  color: #E0F2F7;
  font-weight: 500;
}
.status-online {
  color: #4CAF50; /* 绿色表示在线/正常 */
}
.status-offline {
  color: #FF6B6B; /* 红色表示离线/异常 */
}

.tab-navigation {
  display: flex;
  padding: 0 10px;
  background-color: #0A1A3D; /* 页签导航背景 */
  border-bottom: 1px solid #1E3F66;
}

.tab-navigation button {
  background: transparent;
  border: none;
  color: #A9CBFF; /* 未激活状态颜色 */
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: color 0.3s, border-bottom-color 0.3s;
}

.tab-navigation button.active {
  color: #00CFFF; /* 激活状态颜色 */
  border-bottom-color: #00CFFF;
  font-weight: bold;
  background-color: rgba(0, 207, 255, 0.1); /* 激活状态轻微背景 */
}

.tab-content {
  padding: 15px;
  overflow-y: auto; /* 如果内容过多则滚动 */
  flex-grow: 1;
  background-color: #061229; /* 内容区域更深的背景 */
}

.realtime-video-tab {
  /* 实时视频页签特定样式 */
}

.video-player-container {
  width: 100%;
  height: 400px; /* 根据实际视频调整 */
  background-color: #000;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  color: #A9CBFF;
  text-align: center;
}

.video-status-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #E0F2F7;
  display: flex;
  flex-direction: column;
}

.play-button-overlay {
  position: absolute;
  font-size: 60px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.video-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0px;
  font-size: 13px;
  color: #A9CBFF;
}

.live-indicator {
  color: #4CAF50; /* 绿色 */
}

.fullscreen-button {
  background: transparent;
  border: 1px solid #A9CBFF;
  color: #A9CBFF;
  padding: 3px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
}

.basic-info-tab {
  padding: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 15px 25px; /* 行间距 列间距 */
}

.grid-item {
  display: flex;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(30, 63, 102, 0.5); /* 分隔线 */
}
.grid-item:nth-last-child(-n+2) { /* 最后两项无下边框，如果是单数最后一项无 */
  border-bottom: none;
}
.grid-item.full-width {
  grid-column: 1 / -1; /* 备注项占满整行 */
}


.grid-label {
  color: #7BA0D1; /* 标签颜色 */
  width: 80px; /* 固定标签宽度 */
  flex-shrink: 0;
}

.grid-value {
  color: #E0F2F7; /* 值颜色 */
  flex-grow: 1;
  word-break: break-all; /* 长文本换行 */
}

</style>