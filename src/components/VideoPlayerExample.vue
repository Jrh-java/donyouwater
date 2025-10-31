<template>
  <div class="video-player-example">
    <div class="video-container">
      <VideoUrlProvider 
        :device-serial="deviceSerial" 
        :channel-no="channelNo"
        :auto-refresh="true"
        ref="videoProvider"
      >
        <template #default="{ videoUrl, loading, error, refreshUrl }">
          <div class="video-content">
            <!-- 视频播放器区域 -->
            <div class="video-player" v-if="videoUrl && !loading">
              <video 
                :src="videoUrl" 
                controls 
                autoplay 
                muted
                class="video-element"
                @error="handleVideoError"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
            
            <!-- 加载状态 -->
            <div class="loading-state" v-else-if="loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <p>正在获取视频地址...</p>
            </div>
            
            <!-- 错误状态 -->
            <div class="error-state" v-else-if="error">
              <el-icon class="error-icon"><Warning /></el-icon>
              <p>{{ error }}</p>
              <el-button type="primary" @click="refreshUrl">重新获取</el-button>
            </div>
            
            <!-- 控制面板 -->
            <div class="control-panel">
              <div class="info-section">
                <p><strong>设备序列号:</strong> {{ deviceSerial }}</p>
                <p><strong>通道号:</strong> {{ channelNo }}</p>
                <p><strong>视频地址:</strong> 
                  <span class="url-text" v-if="videoUrl">{{ videoUrl.substring(0, 50) }}...</span>
                  <span v-else>暂无</span>
                </p>
              </div>
              
              <div class="button-section">
                <el-button 
                  type="primary" 
                  @click="refreshUrl" 
                  :loading="loading"
                  :disabled="loading"
                >
                  刷新视频地址
                </el-button>
                
                <el-button 
                  type="success" 
                  @click="copyVideoUrl" 
                  :disabled="!videoUrl"
                >
                  复制视频地址
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </VideoUrlProvider>
    </div>
    
    <!-- 设备配置 -->
    <div class="config-panel">
      <h3>设备配置</h3>
      <el-form :model="config" label-width="120px">
        <el-form-item label="设备序列号:">
          <el-input 
            v-model="config.deviceSerial" 
            placeholder="请输入设备序列号"
            @change="updateConfig"
          />
        </el-form-item>
        <el-form-item label="通道号:">
          <el-input-number 
            v-model="config.channelNo" 
            :min="1" 
            :max="16"
            @change="updateConfig"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElIcon } from 'element-plus';
import { Loading, Warning } from '@element-plus/icons-vue';
import VideoUrlProvider from './VideoUrlProvider.vue';

// 组件引用
const videoProvider = ref();

// 配置数据
const config = reactive({
  deviceSerial: 'FT8680213',
  channelNo: 1
});

// 当前使用的配置
const deviceSerial = ref(config.deviceSerial);
const channelNo = ref(config.channelNo);

// 更新配置
const updateConfig = () => {
  deviceSerial.value = config.deviceSerial;
  channelNo.value = config.channelNo;
  
  // 重新获取视频地址
  if (videoProvider.value) {
    videoProvider.value.refreshVideoUrl();
  }
};

// 复制视频地址
const copyVideoUrl = async () => {
  if (!videoProvider.value) return;
  
  const url = videoProvider.value.getVideoUrl();
  if (!url) {
    ElMessage({
      message: '暂无视频地址可复制',
      type: 'warning'
    });
    return;
  }
  
  try {
    await navigator.clipboard.writeText(url);
    ElMessage({
      message: '视频地址已复制到剪贴板',
      type: 'success'
    });
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error'
    });
  }
};

// 视频播放错误处理
const handleVideoError = (event: Event) => {
  console.error('视频播放错误:', event);
  ElMessage({
    message: '视频播放失败，请检查网络连接或视频地址',
    type: 'error'
  });
};
</script>

<style lang="scss" scoped>
.video-player-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.video-container {
  margin-bottom: 30px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.video-content {
  background: #f5f7fa;
}

.video-player {
  position: relative;
  background: #000;
  
  .video-element {
    width: 100%;
    height: 400px;
    object-fit: contain;
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
  
  .loading-icon, .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .loading-icon {
    animation: rotate 2s linear infinite;
  }
  
  .error-icon {
    color: #f56c6c;
  }
  
  p {
    margin: 0 0 16px 0;
    font-size: 16px;
  }
}

.control-panel {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  
  .info-section {
    margin-bottom: 20px;
    
    p {
      margin: 8px 0;
      color: #606266;
      
      strong {
        color: #303133;
      }
    }
    
    .url-text {
      font-family: monospace;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
  
  .button-section {
    display: flex;
    gap: 12px;
  }
}

.config-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  
  h3 {
    margin: 0 0 20px 0;
    color: #303133;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>