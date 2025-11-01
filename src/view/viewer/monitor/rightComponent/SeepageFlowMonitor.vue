<template>
  <subtitleFrame>
    <template #title>
      <p>渗流量监测</p>
    </template>
    <template #subtitle>
      <p>每5分钟更新一次</p>
    </template>
    <template #content>
      <div class="table-wrapper">
        <div class="table-header">
          <div>监测设备</div>
          <div>监测值</div>
          <div>监测时间</div>
          <div>告警状态</div>
        </div>
        <div class="scrollable-table-container" ref="tableContainerRef" @mouseenter="haltAutoScroll" @mouseleave="initiateAutoScroll">
          <div v-if="allSourceData.length === 0" class="no-data">
            暂无数据
          </div>
          <div v-else class="data-table" ref="dataTableRef">
            <div class="table-row" v-for="(item, index) in scrollableData" :key="index">
              <div>{{ item.device }}</div>
              <div>{{ item.value }}</div>
              <div>{{ item.time }}</div>
              <div :class="{'alarm-status-warning': item.status !== '正常'}">{{ item.status }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </subtitleFrame>
</template>

<script setup>
import subtitleFrame from '@/components/subtitleFrame.vue';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const allSourceData = ref([]);

const scrollableData = ref([]);
const tableContainerRef = ref(null);
const dataTableRef = ref(null);
const scrollInterval = ref(null);
const scrollSpeed = 50; 
const scrollAmount = 1; 

function initiateAutoScroll() {
  if (!tableContainerRef.value || !dataTableRef.value || !scrollableData.value.length) return;
  haltAutoScroll(); 

  const container = tableContainerRef.value;
  const content = dataTableRef.value;

  if (content.scrollHeight <= container.clientHeight || content.scrollHeight / 2 < container.clientHeight && allSourceData.value.length <= 5) {
    return;
  }

  scrollInterval.value = setInterval(() => {
    if (container && content) {
      if (container.scrollTop >= content.scrollHeight / 2) {
        container.scrollTop -= content.scrollHeight / 2; 
      }
      container.scrollTop += scrollAmount;
    }
  }, scrollSpeed);
}

function haltAutoScroll() {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  }
}

function prepareScrollableData() {
    const source = allSourceData.value;
    if (source.length === 0) {
        scrollableData.value = [];
        return;
    }
    scrollableData.value = [...source, ...source];
}

onMounted(async () => {
  prepareScrollableData();
  await nextTick(); 
  initiateAutoScroll();
});

onUnmounted(() => {
  haltAutoScroll();
});
</script>

<style scoped>
.table-wrapper {
  width: 100%;
}

.scrollable-table-container {
  width: 100%;
  max-height: 230px;
  min-height: 200px;
  overflow-y: hidden;  
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.data-table {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.data-table {
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  padding: 8px 5px;
  font-size: 12px;
  text-align: center;
}

.table-header {
  font-weight: bold;
  color: #14c5ff;
  border-bottom: 1px solid rgba(20, 197, 255, 0.3);
}

.table-row > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.alarm-status-warning {
  color: orange; 
  font-weight: bold;
}
</style>