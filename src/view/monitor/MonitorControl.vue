<template>
  <div class="monitor-control-container">
    <!-- 顶部闸站选择按钮 -->
    <div class="gate-station-selector">
      <div class="station-buttons">
        <el-button
          v-for="(deviceSerial, stationName) in GATE_STATION_MAPPING"
          :key="stationName"
          :type="selectedGateStation === stationName ? 'primary' : 'default'"
          @click="handleGateStationSelect(stationName)"
          class="station-button"
        >
          {{ stationName }}
        </el-button>
      </div>
    </div>



    <!-- 主内容区 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" class="video-tabs" @tab-change="handleTabChange">
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
              <label>通道选择：</label>
              <el-select 
                :teleported="false"
                v-model="selectedChannel" 
                placeholder="请选择通道" 
                @change="handleChannelChange"
                class="channel-select"
                :disabled="!currentGateStationName"
              >
                <el-option
                  v-for="channel in channelOptions"
                  :key="channel.value"
                  :label="channel.label"
                  :value="channel.value"
                ></el-option>
              </el-select>
            </div>
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
                @change="handleTimeRangeChange"
              />
            </div>
            <el-button type="primary" :icon="VideoPlay" @click="playVideo" :disabled="!canPlay">播放</el-button>
          </div>
          <div v-if="!currentGateStationName" class="device-tip">
            请先选择闸站
          </div>
        </div>
        
        <!-- 实时预览状态信息 -->
        <div class="realtime-control-bar" v-show="activeTab === 'realtime'">
          <div class="realtime-controls">
            <span class="station-info" v-if="currentGateStationName">
              当前闸站: {{ currentGateStationName }}
            </span>
            <span class="video-count-info">
              ({{ ys7VideoUrls.filter(url => url).length }}/4 个通道有视频源)
            </span>
          </div>
        </div>

        <!-- 视频显示区域 -->
        <div class="video-section">
          <!-- 实时预览四宫格布局 -->
          <div v-if="activeTab === 'realtime'" class="video-grid-container">
            <div class="video-grid">
              <div 
                v-for="(url, index) in ys7VideoUrls" 
                :key="`video-${index}`"
                class="video-grid-item"
              >
                <div 
                  :id="`video-container-${index}`" 
                  class="video-container"
                  v-loading="videoLoadingStates[index]"
                  element-loading-text="加载中..."
                  element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                  <div v-if="!url && !videoLoadingStates[index]" class="video-placeholder">
                    <p>通道 {{ index + 1 }} 暂无视频源</p>
                  </div>
                </div>
                <div class="video-info">
                  <span>通道 {{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 视频回放单窗口布局 -->
          <div v-else class="video-playback-container">
            <div class="video-playback-item">
              <div 
                id="playback-video-container" 
                class="playback-video-container"
                v-loading="playbackLoading"
                element-loading-text="加载中..."
                element-loading-background="rgba(0, 0, 0, 0.8)"
              >
                <div v-if="!playbackVideoUrl && !playbackLoading" class="video-placeholder">
                  <p>请选择通道和时间范围进行回放</p>
                </div>
              </div>
              <div class="video-info" v-if="selectedChannel">
                <span>通道 {{ selectedChannel }} 回放</span>
                <span v-if="timeRange && timeRange.length === 2">
                  {{ timeRange[0] }} 至 {{ timeRange[1] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { Search, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EZUIKit from 'ezuikit-js'
import { 
  getYs7TokenApi, 
  getYs7LiveAddressApi, 
  getYs7DeviceInfoApi,
  getYs7DeviceListApi 
} from '@/api/ys7'

// 闸站名称到设备序列号的映射
const GATE_STATION_MAPPING = {
  '松溪左岸1号闸站': 'FT8680159',
  '松溪左岸2号闸站': 'FT4489510', 
  '松溪左岸3号闸站': 'FT8680213',
  '松溪右岸1号闸站': 'FT4489479',
  '松溪右岸2号闸站': 'FT4489367'
}

// 基础状态
const activeTab = ref('realtime')
const selectedGateStation = ref('') // 当前选中的闸站
const currentGateStationName = ref('')
const currentGateStationCode = ref('')
const selectedChannel = ref('')
const timeRange = ref([])
const loading = ref(false)

// 萤石云相关状态
const ys7AccessToken = ref('')
const ys7TokenExpireTime = ref(0)
const ys7VideoUrls = ref(['', '', '', '']) // 四个通道的视频URL
const ys7VideoPlayers = ref([]) // EZUIKit播放器实例数组
const videoLoadingStates = ref([false, false, false, false])
const playbackLoading = ref(false)
const playbackVideoUrl = ref('')
const playbackPlayer = ref(null)

// 通道选项
const channelOptions = computed(() => [
  { label: '通道 1', value: '1' },
  { label: '通道 2', value: '2' },
  { label: '通道 3', value: '3' },
  { label: '通道 4', value: '4' }
])

// 计算属性
const canPlay = computed(() => {
  return selectedChannel.value && timeRange.value && timeRange.value.length === 2
})

// 时间格式化函数：将日期字符串转换为YYYYMMDDHHmmSS格式
const formatTimeForPlayback = (dateTimeString) => {
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// URL转换函数：将直播URL转换为回放URL
const convertLiveUrlToPlaybackUrl = (liveUrl, startTime, endTime) => {
  // 将直播URL从 "ezopen://open.ys7.com/FT4489367/1.hd.live" 
  // 转换为 "ezopen://open.ys7.com/FT4489367/1.hd.local.rec?begin=20251101000000&end=20251101235959"
  
  if (!liveUrl || !startTime || !endTime) {
    throw new Error('缺少必要的参数')
  }
  
  // 移除 .live 后缀并替换为 .local.rec
  const baseUrl = liveUrl.replace('.live', '.local.rec')
  
  // 格式化时间参数
  const beginTime = formatTimeForPlayback(startTime)
  const endTimeStr = formatTimeForPlayback(endTime)
  
  // 添加时间参数
  const playbackUrl = `${baseUrl}?begin=${beginTime}&end=${endTimeStr}`
  
  return playbackUrl
}

// 获取萤石云访问令牌
const getYs7AccessToken = async () => {
  try {
    const now = Date.now()
    if (ys7AccessToken.value && ys7TokenExpireTime.value > now) {
      return ys7AccessToken.value
    }
    
    const response = await getYs7TokenApi()
    if (response && response.accessToken) {
      ys7AccessToken.value = response.accessToken
      ys7TokenExpireTime.value = now + (response.expireTime || 7200) * 1000
      return response.accessToken
    }
    throw new Error('获取访问令牌失败')
  } catch (error) {
    console.error('获取萤石云访问令牌失败:', error)
    ElMessage.error('获取萤石云访问令牌失败')
    return null
  }
}

// 获取闸站视频URL
const getGateStationVideoUrls = async (gateStationCode) => {
  try {
    const accessToken = await getYs7AccessToken()
    if (!accessToken) return

    // 重置视频URL数组
    ys7VideoUrls.value = ['', '', '', '']
    
    // 获取四个通道的视频地址
    for (let channelNo = 1; channelNo <= 4; channelNo++) {
      try {
        const response = await getYs7LiveAddressApi(
          accessToken,
          gateStationCode,
          channelNo
        )
        
        if (response && response.url) {
          ys7VideoUrls.value[channelNo - 1] = response.url
        }
      } catch (error) {
        console.warn(`获取通道${channelNo}视频地址失败:`, error)
      }
    }
  } catch (error) {
    console.error('获取闸站视频URL失败:', error)
    ElMessage.error('获取视频地址失败')
  }
}

// 初始化萤石云视频播放器
const initYs7VideoPlayback = async () => {
  if (!currentGateStationCode.value) return
  
  try {
    // 清理现有播放器
    cleanupYs7Videos()
    
    // 获取访问令牌
    const accessToken = await getYs7AccessToken()
    if (!accessToken) return
    
    // 获取视频URL
    await getGateStationVideoUrls(currentGateStationCode.value)
    
    // 等待DOM更新
    await nextTick()
    
    // 初始化四个播放器
    for (let i = 0; i < 4; i++) {
      const videoUrl = ys7VideoUrls.value[i]
      if (!videoUrl) continue
      
      const containerId = `video-container-${i}`
      const container = document.getElementById(containerId)
      if (!container) continue
      
      try {
        videoLoadingStates.value[i] = true
        
        const player = new EZUIKit.EZUIKitPlayer({
          id: containerId,
          url: videoUrl,
          accessToken: accessToken,
          template: "pcLive", // 使用pcLive模板
          talkChannelNo: 1, // 添加对讲通道号
    width: '650',
          height: '400',
          autoPlay: true,
          audio: true, // 启用音频控制
          download: false,
          downloadRecord: false,
          controls: true,
          muted: true,
          showBrand: false,
          showHeader: false,
          showFooter: false,
          // 隐藏帧率相关信息
          showInfo: false,
          showStats: false,
          showDebugInfo: false,
          displayStreamInfo: false,
          showStreamInfo: false,
          hideStreamInfo: true,
          showFps: false, // 隐藏帧率
          showBitrate: false, // 隐藏码率
          showResolution: false, // 隐藏分辨率
          showCodec: false, // 隐藏编码信息
          hideOverlay: true, // 隐藏覆盖层
          hideInfo: true // 隐藏信息显示
        })
        
        // 隐藏流信息
        setTimeout(() => {
          const streamInfo = container.querySelector('.ezuikit-stream-info')
          if (streamInfo) {
            streamInfo.style.display = 'none'
          }
        }, 100)
        
        // 确保播放器静音
        if (player && typeof player.closeSound === 'function') {
          player.closeSound()
        }
        
        // 错误处理
        player.on('error', (err) => {
          console.error(`通道${i + 1}播放器错误:`, err)
          videoLoadingStates.value[i] = false
        })
        
        player.on('play', () => {
          videoLoadingStates.value[i] = false
        })
        
        ys7VideoPlayers.value[i] = player
        
      } catch (error) {
        console.error(`初始化通道${i + 1}播放器失败:`, error)
        videoLoadingStates.value[i] = false
      }
    }
    
  } catch (error) {
    console.error('初始化萤石云视频播放失败:', error)
    ElMessage.error('初始化视频播放失败')
  }
}

// 清理萤石云视频
const cleanupYs7Videos = () => {
  ys7VideoPlayers.value.forEach((player, index) => {
    if (player && typeof player.stop === 'function') {
      try {
        player.stop()
      } catch (error) {
        console.warn(`停止播放器${index + 1}失败:`, error)
      }
    }
  })
  ys7VideoPlayers.value = []
  videoLoadingStates.value = [false, false, false, false]
}

// 清理回放播放器
const cleanupPlaybackPlayer = () => {
  if (playbackPlayer.value && typeof playbackPlayer.value.stop === 'function') {
    try {
      playbackPlayer.value.stop()
    } catch (error) {
      console.warn('停止回放播放器失败:', error)
    }
  }
  playbackPlayer.value = null
  playbackVideoUrl.value = ''
  playbackLoading.value = false
}

// 事件处理函数
const handleGateStationSelect = async (stationName) => {
  selectedGateStation.value = stationName
  const deviceSerial = GATE_STATION_MAPPING[stationName]
  
  if (deviceSerial) {
    currentGateStationName.value = stationName
    currentGateStationCode.value = deviceSerial
    // 自动选择第一个通道
    selectedChannel.value = '1'
    
    // 如果当前在实时预览模式，立即加载视频
    if (activeTab.value === 'realtime') {
      await initYs7VideoPlayback()
    }
    
    ElMessage.success(`已选择${stationName}`)
  } else {
    ElMessage.error(`未找到${stationName}对应的设备序列号`)
  }
}

const handleChannelChange = (channel) => {
  selectedChannel.value = channel
}

const handleTabChange = async (tabName) => {
  activeTab.value = tabName
  
  if (tabName === 'realtime') {
    cleanupPlaybackPlayer()
    if (currentGateStationCode.value) {
      await initYs7VideoPlayback()
    }
  } else if (tabName === 'playback') {
    cleanupYs7Videos()
  }
}

const handleTimeRangeChange = (range) => {
  timeRange.value = range
  if (range && range.length === 2) {
    // 验证时间范围是否在同一天
    const startDate = new Date(range[0]).toDateString()
    const endDate = new Date(range[1]).toDateString()
    
    if (startDate !== endDate) {
      ElMessage.warning('回放时间必须在同一天内')
      timeRange.value = []
    }
  }
}

const playVideo = async () => {
  if (!canPlay.value) {
    ElMessage.warning('请选择通道和时间范围')
    return
  }
  
  try {
    playbackLoading.value = true
    cleanupPlaybackPlayer()
    
    const accessToken = await getYs7AccessToken()
    if (!accessToken) return
    
    // 获取直播视频地址
    const response = await getYs7LiveAddressApi(
      accessToken,
      currentGateStationCode.value,
      parseInt(selectedChannel.value)
    )
    
    if (!response || !response.url) {
      throw new Error('获取视频地址失败')
    }
    
    // 将直播URL转换为回放URL
    const playbackUrl = convertLiveUrlToPlaybackUrl(
      response.url,
      timeRange.value[0],
      timeRange.value[1]
    )
    
    console.log('原始直播URL:', response.url)
    console.log('转换后的回放URL:', playbackUrl)
    
    playbackVideoUrl.value = playbackUrl
    
    await nextTick()
    
    // 初始化回放播放器
    const player = new EZUIKit.EZUIKitPlayer({
      id: 'playback-video-container',
      url: playbackUrl, // 使用转换后的回放URL
      accessToken: accessToken,
      template: "pcLive", // 使用pcLive模板
      talkChannelNo: 1, // 添加对讲通道号
      width: '1000',
      height: '600',
      autoPlay: true,
      audio: true, // 启用音频控制
      download: false,
      downloadRecord: false,
      controls: true,
      muted: true,
      showBrand: false,
      showHeader: false,
      showFooter: false,
      // 隐藏帧率相关信息
      showInfo: false,
      showStats: false,
      showDebugInfo: false,
      displayStreamInfo: false,
      showStreamInfo: false,
      hideStreamInfo: true,
      showFps: false, // 隐藏帧率
      showBitrate: false, // 隐藏码率
      showResolution: false, // 隐藏分辨率
      showCodec: false, // 隐藏编码信息
      hideOverlay: true, // 隐藏覆盖层
      hideInfo: true // 隐藏信息显示
    })
        
        // 播放器创建后立即隐藏流信息
        if (player && typeof player.displayStreamInfo === 'function') {
          player.displayStreamInfo(false)
        }
        
        // 隐藏流信息
        setTimeout(() => {
          const container = document.getElementById(containerId)
          const streamInfo = container?.querySelector('.ezuikit-stream-info')
          if (streamInfo) {
            streamInfo.style.display = 'none'
          }
        }, 100)
    
    // 确保播放器静音
    if (player && typeof player.closeSound === 'function') {
      player.closeSound()
    }
    
    player.on('error', (err) => {
      // console.error('回放播放器错误:', err)
      // playbackLoading.value = false
      // ElMessage.error('视频回放失败')
    })
    
    player.on('play', () => {
      playbackLoading.value = false
    })
    
    // 播放器创建后立即隐藏流信息
    if (player && typeof player.displayStreamInfo === 'function') {
      player.displayStreamInfo(false)
    }
    
    // 隐藏流信息
    setTimeout(() => {
      const container = document.getElementById('playback-video-container')
      const streamInfo = container?.querySelector('.ezuikit-stream-info')
      if (streamInfo) {
        streamInfo.style.display = 'none'
      }
    }, 100)
    
    playbackPlayer.value = player
    
  } catch (error) {
    // console.error('播放视频失败:', error)
    // playbackLoading.value = false
    // ElMessage.error('视频回放失败')
  }
}



// 监听选中的闸站变化
watch(() => currentGateStationCode.value, async (newCode) => {
  if (newCode && activeTab.value === 'realtime') {
    await initYs7VideoPlayback()
  }
})

// 生命周期
onMounted(async () => {
  // 默认选择第一个闸站
  const firstStationName = Object.keys(GATE_STATION_MAPPING)[0]
  if (firstStationName) {
    await handleGateStationSelect(firstStationName)
  }
})

onUnmounted(() => {
  cleanupYs7Videos()
  cleanupPlaybackPlayer()
})
</script>

<style lang="scss" scoped>
.monitor-control-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

// 闸站选择器样式
.gate-station-selector {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.station-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.station-button {
  min-width: 140px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

// 主内容区域样式
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.video-tabs {
  margin-bottom: 20px;
}

.content-wrapper {
overflow-y: auto;
}

.time-control-bar {
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input-group label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.channel-select {
  width: 150px;
}

.device-tip {
  color: #909399;
  font-size: 12px;
  text-align: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input-group label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.realtime-control-bar {
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.realtime-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.station-info {
  font-weight: 500;
  color: #303133;
}

.video-count-info {
  color: #909399;
  font-size: 14px;
}

.video-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto; // 添加滚动条
  max-height: calc(100vh - 200px); // 限制最大高度
}

.video-grid-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 600px; // 设置最小高度确保内容可滚动
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 15px;
  height: 100%;
  min-height: 600px; // 确保网格有足够高度
}

.video-grid-item {
  position: relative;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 280px; // 增加最小高度
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  background-color: #f5f7fa;
}

.video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  padding: 10px;
  font-size: 14px;
}

.video-playback-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto; // 添加滚动条
  max-height: calc(100vh - 200px); // 限制最大高度
}

.video-playback-item {
  position: relative;
  flex: 1;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px; // 设置最小高度
}

.playback-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

// 响应式设计
@media (max-width: 1200px) {
  .sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .monitor-control-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  .video-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 200px);
  }
}
</style>