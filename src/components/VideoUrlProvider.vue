<template>
  <div class="video-url-provider">
    <slot :videoUrl="videoUrl" :loading="loading" :error="error" :refreshUrl="refreshVideoUrl"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getYs7TokenApi, getYs7LiveAddressApi, type Ys7TokenResponse, type Ys7LiveAddressResponse } from '@/api/ys7';
import { ElMessage } from 'element-plus';

// Props
interface Props {
  deviceSerial?: string;
  channelNo?: number;
  autoRefresh?: boolean; // 是否自动刷新token
}

const props = withDefaults(defineProps<Props>(), {
  deviceSerial: 'FT8680213',
  channelNo: 1,
  autoRefresh: true
});

// 响应式数据
const videoUrl = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');

// Token管理
const accessToken = ref<string>('');
const tokenExpireTime = ref<number>(0);
let refreshTimer: NodeJS.Timeout | null = null;

// 检查token是否过期（提前5分钟刷新）
const isTokenExpired = (): boolean => {
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5分钟缓冲时间
  return !accessToken.value || now >= (tokenExpireTime.value - bufferTime);
};

// 获取访问token
const getAccessToken = async (): Promise<string> => {
  try {
    const response: any = await getYs7TokenApi();
    
    if (response.code === '200' && response.data) {
      accessToken.value = response.data.accessToken;
      tokenExpireTime.value = response.data.expireTime;
      
      // 设置自动刷新定时器
      if (props.autoRefresh) {
        setupTokenRefresh();
      }
      
      return accessToken.value;
    } else {
      throw new Error(response.msg || '获取token失败');
    }
  } catch (err: any) {
    console.error('获取萤石云token失败:', err);
    throw new Error(`获取token失败: ${err.message}`);
  }
};

// 设置token自动刷新
const setupTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  const now = Date.now();
  const refreshTime = tokenExpireTime.value - now - (10 * 60 * 1000); // 提前10分钟刷新
  
  if (refreshTime > 0) {
    refreshTimer = setTimeout(async () => {
      try {
        await getAccessToken();
        console.log('Token自动刷新成功');
      } catch (err) {
        console.error('Token自动刷新失败:', err);
        error.value = 'Token自动刷新失败';
      }
    }, refreshTime);
  }
};

// 获取视频直播地址
const getVideoUrl = async (): Promise<string> => {
  try {
    // 检查token是否需要刷新
    if (isTokenExpired()) {
      await getAccessToken();
    }
    
    const response: any = await getYs7LiveAddressApi(
      accessToken.value,
      props.deviceSerial,
      props.channelNo
    );
    
    if (response.code === '200' && response.data) {
      return response.data.url;
    } else {
      throw new Error(response.msg || '获取视频地址失败');
    }
  } catch (err: any) {
    console.error('获取萤石云视频地址失败:', err);
    throw new Error(`获取视频地址失败: ${err.message}`);
  }
};

// 刷新视频URL
const refreshVideoUrl = async () => {
  if (loading.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const url = await getVideoUrl();
    videoUrl.value = url;
    ElMessage({
      message: '视频地址获取成功',
      type: 'success'
    });
  } catch (err: any) {
    error.value = err.message;
    videoUrl.value = '';
    ElMessage({
      message: err.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

// 初始化
const init = async () => {
  await refreshVideoUrl();
};

// 清理定时器
const cleanup = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

// 生命周期
onMounted(() => {
  init();
});

onUnmounted(() => {
  cleanup();
});

// 暴露方法给父组件
defineExpose({
  refreshVideoUrl,
  getVideoUrl: () => videoUrl.value,
  getError: () => error.value,
  isLoading: () => loading.value
});
</script>

<style lang="scss" scoped>
.video-url-provider {
  width: 100%;
  height: 100%;
}
</style>