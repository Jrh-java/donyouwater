<template>
  <subtitleFrame>
    <template #title>
      <p>渗压监测</p>
    </template>
    <template #subtitle>
      <p>每5分钟更新一次</p>
    </template>
    <template #content>
      <div class="table-wrapper">
        <div class="table-header">
          <div>水位(m)</div>
          <div>高程水位(m)</div>
          <div>水压(kPa)</div>
          <div>监测时间</div> 
          <div>预警状态</div>
        </div>
        <div class="scrollable-table-container" ref="tableContainerRef" @mouseenter="haltAutoScroll" @mouseleave="initiateAutoScroll">
          <div v-if="allSourceData.length === 0" class="no-data">
            暂无数据
          </div>
          <div v-else class="data-table" ref="dataTableRef">
            <div class="table-row" v-for="(item, index) in scrollableData" :key="index">
              <div>{{ item.waterLevel }}</div>
              <div>{{ item.elevationWaterLevel }}</div>
              <div>{{ item.waterPressure }}</div>
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getOsmoticPressurePage } from '@/api/reservoir';
import { useStore } from '@/store/pinia';

const store = useStore();

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const allSourceData = ref([]);
const loading = ref(false);

// 获取渗压监测数据
const fetchSeepageData = async () => {
  if (!selectedDamNode.value?.gateStationCode) {
    console.warn('缺少gateStationCode，无法获取渗压监测数据');
    allSourceData.value = [];
    prepareScrollableData();
    return;
  }

  try {
    loading.value = true;
    const params = {
      analyseTimeType: "24h",
      // gateStationCode: selectedDamNode.value.gateStationCode,
      limit: 10,
      page: 1
    };

    const response = await getOsmoticPressurePage(params);
    
    if (response && response.list) {
       // 转换数据格式以匹配原有的显示格式
       allSourceData.value = response.list.map((item, index) => ({
         waterLevel: item.waterLevel || '--',
         elevationWaterLevel: item.elevationWaterLevel || '--',
         waterPressure: item.waterPressure || '--',
         time: item.mvcTime || formatDateTime(new Date()),
         status: item.warnStatus || '正常'
       }));
    } else {
      allSourceData.value = [];
    }
  } catch (error) {
    console.error('获取渗压监测数据失败:', error);
    ElMessage.error('获取渗压监测数据失败');
    allSourceData.value = [];
  } finally {
    loading.value = false;
    prepareScrollableData();
    // 确保在数据更新后重新启动滚动
    await nextTick();
    initiateAutoScroll();
  }
};

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

  // 只有当内容高度大于容器高度时才启动滚动
  if (content.scrollHeight <= container.clientHeight) {
    return;
  }

  scrollInterval.value = setInterval(() => {
    if (container && content) {
      container.scrollTop += scrollAmount;
      
      // 当滚动到接近重复内容的一半位置时，平滑重置到开始位置
      if (container.scrollTop >= content.scrollHeight / 2 - scrollAmount) {
        container.scrollTop = 0;
      }
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

// 监听选中节点变化
watch(selectedDamNode, (newNode) => {
  if (newNode?.gateStationCode) {
    fetchSeepageData();
  }
}, { immediate: true });

onMounted(async () => {
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
  min-height: 180px;
  overflow-y: hidden;  
  position: relative;
}

.scrollable-table-container:empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  width: 100%;

  text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.data-table {
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5列 */
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