<template>
  <div class="dam-statistic-card">
    <div class="card-icon">
      <img :src="icon" alt="icon" />
    </div>
    <div class="card-info">
    
      <div class="dam-count">
  
    
          <div class="dam-name">{{ name }}</div>
          <div class="count-number">{{ count }}</div>
          <div class="count-unit">座</div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  name: string;
  count: number;
  icon: string;
}

defineProps<Props>();
</script>

<style scoped>
.dam-statistic-card {
  display: flex;
  align-items: center; /* 使图片和文字垂直居中对齐 */
  background-color: rgba(10, 22, 52, 0.5); /* 根据图片调整背景色和透明度 */
  padding: 10px 15px;
  border-radius: 8px;
  margin: 0 10px; /* 卡片间的间距 */
  color: white;
  min-width: 200px; /* 根据内容调整最小宽度 */
  backdrop-filter: blur(5px); /* 毛玻璃效果 */
}

.card-icon img {
  width: 50px; /* 根据实际图片大小调整 */
  height: 50px; /* 根据实际图片大小调整 */
  margin-right: 15px;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 文字左对齐 */
}

.dam-name {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: bold;
  margin-bottom: 5px;

}

.dam-count {
  display: flex;
  align-items: baseline; /* 使数字和单位基线对齐 */
  align-content: center;
}

.count-number {
  font-size: 28px; /* 数字大字体 */
  font-weight: bold;
  color: #00E5FF; /* 调整颜色以匹配图片风格 */
  margin: 0 10px;
}

.count-unit {
  font-size: 16px; /* 单位小字体 */
  margin-left: 3px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: bold;
}
</style> 