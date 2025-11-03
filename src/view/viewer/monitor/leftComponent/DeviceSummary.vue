<template>
  <subtitle-frame>
    <template #title>
      <p>设备概况</p>
    </template>
    <template #subtitle>
      <!-- 副标题空着 -->
    </template>
    <template #content>
      <div class="device-summary-content">
        <div class="device-summary-left">
          <div class="summary-item">
            <img src="@/assets/viewer/flag.png" alt="icon" class="item-icon" />
            <div class="item-text-content">
              <span class="item-label">监测设备</span>
              <div class="item-value-unit">
                <span class="item-value white-text">{{ deviceCount }}</span>
                <span class="item-unit">台</span>
              </div>
            </div>
          </div>
          <div class="summary-item">
            <img src="@/assets/viewer/flag.png" alt="icon" class="item-icon" />
            <div class="item-text-content">
              <span class="item-label">设备异常</span>
              <div class="item-value-unit">
                <span class="item-value orange-text">0</span>
                <span class="item-unit">台</span>
              </div>
            </div>
          </div>
        </div>
        <div class="device-summary-right">
          <div class="summary-item">
            <img src="@/assets/viewer/flag.png" alt="icon" class="item-icon" />
            <div class="item-text-content">
              <span class="item-label">测值异常</span>
              <div class="item-value-unit">
                <span class="item-value orange-text">0</span>
                <span class="item-unit">台</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </subtitle-frame>
</template>

<script setup>
import SubtitleFrame from '@/components/subtitleFrame.vue';
import { ref, onMounted } from 'vue';
import { getDeviceManagementPage } from '@/api/device';

// 设备总数
const deviceCount = ref(0);

// 获取设备总数
const fetchDeviceCount = async () => {
  try {
    const params = {
      page: 1,
      limit: 10
    };
    
    const response = await getDeviceManagementPage(params);
    if (response && response.totalCount !== undefined) {
      deviceCount.value = response.totalCount;
    }
  } catch (error) {
    console.error('获取设备总数失败:', error);
  }
};

onMounted(() => {
  fetchDeviceCount();
});
</script>

<style scoped>
.device-summary-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.device-summary-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.device-summary-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* 让右侧 item 垂直居中 */
}
.summary-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
}
.item-icon {
  width: 55px;
  height: 55px;
  margin-right: 20px;
  margin-left: 25px;
}
.item-text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.1;
}
.item-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2px;
}
.item-value-unit {
  display: flex;
  align-items: baseline;
}
.item-value {
  font-size: 20px;
  font-weight: bold;
}
.white-text {
  color: #FFFFFF;
}
.orange-text {
  color: #FF9800;
}
.item-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 3px;
  font-weight: normal;
}
</style>