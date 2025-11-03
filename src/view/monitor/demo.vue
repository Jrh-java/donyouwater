<template>
  <!-- FLV视频播放器 -->
  <div class="video-container">
    <div class="video-wrapper">
      <!-- 视频播放区域 -->
      <video 
        id="flvVideo" 
        ref="videoElement"
        controls
        autoplay
        muted
        playsinline
        class="video-player"
      ></video>
      
      <!-- 连接状态显示 -->
      <div class="status-overlay" :class="statusClass">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button @click="startPlay" class="btn btn-primary" :disabled="isPlaying">
          <span>▶</span> 播放
        </button>
        <button @click="stopPlay" class="btn btn-danger" :disabled="!isPlaying">
          <span>⏹</span> 停止
        </button>
        <button @click="reconnect" class="btn btn-secondary">
          <span>🔄</span> 重连
        </button>
      </div>
      
      <!-- 视频信息 -->
      <div class="video-info">
        <p><strong>视频源:</strong> {{ videoUrl }}</p>
        <p><strong>类型:</strong> FLV</p>
        <p><strong>状态:</strong> {{ connectionStatus }}</p>
        <p><strong>连接时间:</strong> {{ connectTime || '未连接' }}</p>
        <p><strong>认证:</strong> 已配置Token</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'flvPlayer',
  data() {
    return {
      flvPlayer: null,
      videoUrl: 'http://192.168.1.160:8866/live?url=rtmp://119.3.245.90/live/YN16320506000001',
      authToken: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6IjEyMSIsIm5hbWUiOiLmgLvoo4EiLCJvcmdJZCI6Ii0xIiwiZXhwIjoxNzk0ODE2MDk4fQ.BosQRpQahIzcKby9-TI7mmlaa-PzVi5x2y7gyTejVmLWCxYGIR_vIINEOqvyyi0LKj_kt-IVkq0aQh2wNgQd88OZSy07lMSnJsQB9N8W9NL83HHg9u1t_ozTa-23TEVUfGnTx_ZnSEdGpLUg8PUvA3zrCGNNvF07vhdaB4CR4nM',
      connectionStatus: '未连接',
      isPlaying: false,
      connectTime: null,
      retryCount: 0,
      maxRetries: 3
    };
  },
  
  computed: {
    statusClass() {
      return {
        'status-connecting': this.connectionStatus === '连接中',
        'status-connected': this.connectionStatus === '已连接',
        'status-playing': this.connectionStatus === '播放中',
        'status-error': this.connectionStatus === '连接失败'
      };
    },
    
    statusText() {
      return this.connectionStatus;
    }
  },
  
  mounted() {
    console.log('🚀 FLV视频播放器组件已挂载');
    this.checkLibraries();
    this.initPlayer();
  },
  
  beforeUnmount() {
    console.log('🔄 组件卸载，清理播放器资源');
    this.cleanup();
  },
  
  methods: {
    checkLibraries() {
      console.log('🔍 检查flv.js库是否加载...');
      
      // 检查flv.js库
      if (typeof flvjs === 'undefined') {
        console.warn('⚠️ flv.js库未加载，FLV播放将不可用');
      } else {
        console.log('✅ flv.js库已加载');
      }
    },
    
    initPlayer() {
      console.log('🎬 开始初始化FLV播放器...');
      
      const videoDom = document.getElementById('flvVideo');
      if (!videoDom) {
        console.error('❌ 找不到video元素');
        return;
      }
      
      console.log('📺 Video元素已找到:', videoDom);
      this.connectionStatus = '连接中';
      
      this.initFLVPlayer(videoDom);
    },
    
    initFLVPlayer(videoDom) {
      console.log('🎬 初始化FLV播放器...');
      
      if (typeof flvjs === 'undefined') {
        console.error('❌ flv.js库未加载！');
        this.connectionStatus = '库未加载';
        return;
      }
      
      if (!flvjs.isSupported()) {
        console.error('❌ 浏览器不支持FLV播放');
        this.connectionStatus = '不支持FLV';
        return;
      }
      
      try {
         this.flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: this.videoUrl,
            isLive: true
          }, {
            enableWorker: false,
            enableStashBuffer: false,
            stashInitialSize: 128
          });
        
        this.flvPlayer.attachMediaElement(videoDom);
        this.flvPlayer.load();
        
        // FLV播放器事件监听
        this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
          console.log('📡 FLV加载完成');
        });
        
        this.flvPlayer.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
          console.log('📋 FLV媒体信息:', mediaInfo);
        });
        
        this.flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
          console.error('❌ FLV播放错误:', errorType, errorDetail);
          this.handlePlayError();
        });
        
        // 视频元素事件
        videoDom.addEventListener('canplay', () => {
          console.log('📹 FLV视频可以播放了');
          this.connectionStatus = '播放中';
          this.isPlaying = true;
          this.connectTime = new Date().toLocaleTimeString();
          
          videoDom.play().then(() => {
            console.log('✅ FLV视频播放成功');
          }).catch(err => {
            console.error('❌ FLV视频播放失败:', err);
            this.handlePlayError();
          });
        });
        
        this.setupVideoEvents(videoDom);
        
        console.log('🎮 FLV播放器实例已创建:', this.flvPlayer);
        
      } catch (error) {
        console.error('❌ 创建FLV播放器失败:', error);
        this.connectionStatus = '初始化失败';
      }
    },
    
    setupVideoEvents(videoDom) {
      videoDom.addEventListener('loadstart', () => {
        console.log('📡 开始加载视频数据');
      });
      
      videoDom.addEventListener('loadeddata', () => {
        console.log('📊 视频数据已加载');
      });
      
      videoDom.addEventListener('loadedmetadata', () => {
        console.log('📋 视频元数据已加载');
        console.log('📐 视频尺寸:', videoDom.videoWidth + 'x' + videoDom.videoHeight);
      });
    },
    
    handlePlayError() {
      this.connectionStatus = '连接失败';
      this.isPlaying = false;
      
      // 自动重试
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 自动重试 (${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.reconnect(), 2000);
      } else {
        console.error('❌ 重试次数已达上限，停止重试');
      }
    },
    
    startPlay() {
      console.log('▶️ 手动开始播放');
      if (this.player) {
        this.initPlayer();
      } else {
        this.initPlayer();
      }
    },
    
    stopPlay() {
      console.log('⏹️ 停止播放');
      this.cleanup();
      this.connectionStatus = '已停止';
      this.isPlaying = false;
    },
    
    reconnect() {
      console.log('🔄 重新连接...');
      this.cleanup();
      this.retryCount = 0;
      setTimeout(() => {
        this.initPlayer();
      }, 1000);
    },
    
    cleanup() {
      console.log('🧹 清理FLV播放器资源');
      
      // 清理FLV播放器
      if (this.flvPlayer) {
        try {
          this.flvPlayer.pause();
          this.flvPlayer.unload();
          this.flvPlayer.detachMediaElement();
          this.flvPlayer.destroy();
          console.log('✅ FLV播放器已销毁');
        } catch (error) {
          console.error('❌ 销毁FLV播放器时出错:', error);
        }
        this.flvPlayer = null;
      }
      
      const videoDom = document.getElementById('flvVideo');
      if (videoDom) {
        videoDom.pause();
        videoDom.src = '';
        videoDom.srcObject = null;
        videoDom.load(); // 重置video元素
        console.log('📺 Video元素已清理');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.video-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.video-player {
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: 8px;
  border: 2px solid #00d4ff;
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
  object-fit: contain;
}

.status-overlay {
  position: relative;
  padding: 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #666;
  animation: pulse 2s infinite;
}

.status-connecting .status-dot {
  background: #ffa500;
}

.status-connected .status-dot {
  background: #00ff00;
}

.status-playing .status-dot {
  background: #00d4ff;
}

.status-error .status-dot {
  background: #ff4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.control-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  color: white;
}

.btn-danger {
  background: linear-gradient(45deg, #ff4444, #cc3333);
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #666, #444);
  color: white;
}

.video-info {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 8px;
  color: white;
  font-family: 'Courier New', monospace;
}

.video-info p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.4;
}

.video-info strong {
  color: #00d4ff;
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-container {
    padding: 15px;
  }
  
  .video-player {
    height: 250px;
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .video-info {
    font-size: 12px;
  }
}

/* 加载动画 */
.video-player:empty::before {
  content: '正在加载视频...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00d4ff;
  font-size: 16px;
}
</style>