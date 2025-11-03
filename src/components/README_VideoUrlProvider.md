# VideoUrlProvider 组件使用说明

## 概述

VideoUrlProvider 是一个用于获取萤石云视频直播地址的 Vue 组件，具备自动 token 管理和刷新功能。

## 功能特性

- ✅ 自动获取萤石云访问 token
- ✅ 自动刷新过期 token（提前 5-10 分钟）
- ✅ 获取视频直播地址
- ✅ 错误处理和重试机制
- ✅ 支持自定义设备和通道
- ✅ 响应式数据绑定

## 安装配置

### 1. 代理配置

已在 `vite.config.ts` 中配置萤石云 API 代理：

```typescript
'/ys7Api': {
  target: 'https://open.ys7.com',
  changeOrigin: true,
  secure: true,
  rewrite: (path) => path.replace(/^\/ys7Api/, ''),
}
```

### 2. API 接口

API 接口已封装在 `@/api/ys7.ts` 中：

- `getYs7TokenApi()` - 获取访问 token
- `getYs7LiveAddressApi()` - 获取视频地址

## 基本使用

### 简单使用

```vue
<template>
  <VideoUrlProvider>
    <template #default="{ videoUrl, loading, error, refreshUrl }">
      <div v-if="loading">加载中...</div>
      <div v-else-if="error">{{ error }}</div>
      <video v-else-if="videoUrl" :src="videoUrl" controls></video>
    </template>
  </VideoUrlProvider>
</template>

<script setup>
import VideoUrlProvider from '@/components/VideoUrlProvider.vue';
</script>
```

### 完整示例

```vue
<template>
  <VideoUrlProvider 
    :device-serial="deviceSerial" 
    :channel-no="channelNo"
    :auto-refresh="true"
    ref="videoProvider"
  >
    <template #default="{ videoUrl, loading, error, refreshUrl }">
      <!-- 视频播放器 -->
      <video 
        v-if="videoUrl && !loading"
        :src="videoUrl" 
        controls 
        autoplay 
        muted
      ></video>
      
      <!-- 加载状态 -->
      <div v-else-if="loading">
        正在获取视频地址...
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error">
        {{ error }}
        <button @click="refreshUrl">重试</button>
      </div>
      
      <!-- 控制按钮 -->
      <button @click="refreshUrl" :disabled="loading">
        刷新视频地址
      </button>
    </template>
  </VideoUrlProvider>
</template>

<script setup>
import { ref } from 'vue';
import VideoUrlProvider from '@/components/VideoUrlProvider.vue';

const videoProvider = ref();
const deviceSerial = ref('FT8680213');
const channelNo = ref(1);

// 获取当前视频地址
const getCurrentUrl = () => {
  return videoProvider.value?.getVideoUrl();
};
</script>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| deviceSerial | string | 'FT8680213' | 设备序列号 |
| channelNo | number | 1 | 通道号 |
| autoRefresh | boolean | true | 是否自动刷新 token |

## Slot 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| videoUrl | string | 视频直播地址 |
| loading | boolean | 加载状态 |
| error | string | 错误信息 |
| refreshUrl | function | 刷新视频地址的方法 |

## 暴露的方法

通过 `ref` 可以访问以下方法：

```typescript
// 刷新视频地址
videoProvider.value.refreshVideoUrl();

// 获取当前视频地址
const url = videoProvider.value.getVideoUrl();

// 获取错误信息
const error = videoProvider.value.getError();

// 获取加载状态
const isLoading = videoProvider.value.isLoading();
```

## Token 管理机制

1. **自动获取**: 组件初始化时自动获取 token
2. **过期检测**: 每次请求前检查 token 是否过期（提前 5 分钟）
3. **自动刷新**: 设置定时器在 token 过期前 10 分钟自动刷新
4. **错误处理**: token 获取失败时提供错误信息和重试机制

## 错误处理

组件会处理以下错误情况：

- 网络连接错误
- API 接口错误
- Token 获取失败
- 视频地址获取失败
- Token 过期

所有错误都会通过 `error` 参数传递给父组件，并显示用户友好的错误信息。

## 注意事项

1. 确保网络可以访问萤石云 API
2. 设备序列号必须是有效的萤石云设备
3. 通道号范围通常是 1-16
4. 视频地址有时效性，建议定期刷新
5. 组件会自动处理 token 过期，无需手动管理

## 示例组件

可以参考 `VideoPlayerExample.vue` 组件了解完整的使用示例，包括：

- 视频播放器集成
- 配置面板
- 错误处理
- 地址复制功能