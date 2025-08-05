<template>
  <SubtitleFrame style="margin-top: 15px;">
    <template #title>
      <p style="font-size: 16px; font-weight: bold; color: white; margin-bottom: 5px;">坝龄分布情况</p>
    </template>
    <template #content>
      <div class="dam-age-distribution-content">
        <div class="tabs-container">
          <div 
            v-for="tab in tabs" 
            :key="tab" 
            :class="['tab-item', { active: activeTab === tab }]" 
            @click="selectTab(tab)"
          >
            {{ tab }}
          </div>
        </div>
        <BarChart />
      </div>
    </template>
  </SubtitleFrame>
</template>

<script setup>
import SubtitleFrame from '@/components/subtitleFrame.vue';
import BarChart from './barChart.vue'; // Adjusted path for BarChart
import { ref } from 'vue';

const activeTab = ref('全部');
const tabs = ['全部', '大水闸站', '中水闸站', '小水闸站'];

const selectTab = (tab) => {
  activeTab.value = tab;
  // Here you would typically fetch or filter data based on the selected tab
  // For now, it just changes the active tab state
  console.log(`Selected tab: ${tab}`);
};
</script>

<style scoped>
.tabs-container {
  display: flex;
  margin-bottom: 5px;
}

.tab-item {
  padding: 8px 15px;
  margin-right: 5px;
  color: white;
  cursor: pointer;
  background-color: rgba(0, 191, 255, 0.3); /* Default tab background */
  border-radius: 3px 3px 0 0;
  font-size: 14px;
}

.tab-item.active {
  background-color: #007bff; /* Active tab background - matches image's blue */
  color: white;
  font-weight: bold;
}

.dam-age-distribution-content {
  width: 100%;
  color: white;
}

p {
  margin: 0;
}
</style>