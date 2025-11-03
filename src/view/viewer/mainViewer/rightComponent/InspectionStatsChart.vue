<template>
  <SubtitleFrame>
    <template #title>
      <p style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 5px;">巡检记录统计</p>
    </template>
    <template #subtitle>
      <span style="font-size: 12px; color: #a9b7c3;">更新时间: {{ updateTime }}</span>
    </template>
    <template #content>
      <div class="inspection-stats-content">
        <!-- Top Statistics -->
        <div class="top-stats">
          <div class="statistic-item">
            <img src="@/assets/viewer/actually.png" alt="累计巡检次数 icon" class="statistic-icon top-icon" />
            <div class="statistic-text">
              <p class="statistic-label">累计巡检次数</p>
              <p class="statistic-value">- <span class="statistic-unit">次</span></p>
            </div>
          </div>
          <div class="statistic-item">
            <img src="@/assets/viewer/schedule.png" alt="累计巡检告警 icon" class="statistic-icon top-icon" />
            <div class="statistic-text">
              <p class="statistic-label">累计巡检告警</p>
              <p class="statistic-value warning-value">- <span class="statistic-unit">次</span></p>
            </div>
          </div>
        </div>

        <!-- Progress Bar Statistics -->
        <div class="progress-stats">
          <div class="progress-item">
            <div class="progress-info">
              <span class="progress-label">人员逗留告警</span>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: 30%;"></div>
              </div>
              <span class="progress-value">0 次 <span class="percentage">0%</span></span>
            </div>
          </div>
          <div class="progress-item">
     
            <div class="progress-info">
              <span class="progress-label">坝面裂纹告警</span>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: 30%;"></div>
              </div>
              <span class="progress-value">0 次 <span class="percentage">0%</span></span>
            </div>
          </div>
          <div class="progress-item">
     
            <div class="progress-info">
              <span class="progress-label">坝体渗漏告警</span>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: 30%;"></div>
              </div>
              <span class="progress-value">0 次 <span class="percentage">0%</span></span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </SubtitleFrame>
</template>

<script setup>
import { ref } from 'vue';
import SubtitleFrame from '@/components/subtitleFrame.vue';

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const updateTime = ref(formatDateTime(new Date()));
</script>

<style scoped>
p {
  margin: 0;
}

.inspection-stats-content {
  padding: 10px 5px; /* Adjusted padding */
  color: white;
}

.top-stats {
  display: flex;
  justify-content: space-between; /* Distribute items evenly */
  margin-bottom: 25px; /* Increased margin */
  padding: 0 10px; /* Add some horizontal padding */
}

.statistic-item {
  display: flex;
  align-items: center;
}

.statistic-icon {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.statistic-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.statistic-label {
  font-size: 13px; /* Slightly smaller */
  color: #a9b7c3;
  margin-bottom: 5px;
}

.statistic-value {
  font-size: 26px; /* Slightly smaller */
  font-weight: bold;
  color: white;
  line-height: 1;
}

.statistic-value .statistic-unit {
  font-size: 13px; /* Slightly smaller */
  color: #a9b7c3;
  margin-left: 4px;
  font-weight: normal;
}

.warning-value {
  color: #FF4D4F;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 18px; /* Space between progress items */
}

.progress-item {
  display: flex;
  align-items: center;
}

.icon-container {
  width: 48px; /* Width for icon or empty space */
  height: 40px; /* Match progress-icon height */
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start; /* Align icon to the left */
  align-items: center;
  margin-right: 10px; /* Space between icon and info */
}

.statistic-icon.progress-icon {
  width: 40px;
  height: 40px;
}

.progress-info {
  flex-grow: 1;
  display: grid;
  grid-template-columns: minmax(70px, auto) 1fr auto; /* Label, Bar, Value */
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-size: 13px;
  color: #fff;
  text-align: left;
}

.progress-bar-container {
  background-color: rgba(80, 80, 80, 0.5); /* Darker background for the bar */
  border-radius: 3px;
  height: 8px; /* Height of the progress bar */
  overflow: hidden;
  width: 100%;
}

.progress-bar {
  background-color: #00BCD4; /* Teal color from image */
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
}

.progress-value {
  font-size: 13px;
  color: #a9b7c3;
  white-space: nowrap;
  text-align: right;
}

.progress-value .percentage {
  color: #FFEB3B; /* Yellow for percentage */
  margin-left: 5px;
  font-weight: bold;
}
</style>