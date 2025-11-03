<template>
  <subtitleFrame>
    <template #title>
      <p>位移监测</p>
    </template>
    <template #subtitle>
      <p>每5分钟更新一次</p>
    </template>
    <template #content>
      <div class="table-wrapper">
        <div class="table-header">
          <div>最后监测时间</div>
          <div>安全状态</div>
          <div>实测值</div>
        </div>
        <div class="scrollable-table-container" ref="tableContainerRef" @mouseenter="haltAutoScroll" @mouseleave="initiateAutoScroll">
          <div v-if="allSourceData.length === 0" class="no-data">
            暂无数据
          </div>
          <div v-else class="data-table" ref="dataTableRef">
            <div class="table-row" v-for="(item, index) in scrollableData" :key="index">
              <div>{{ item.time }}</div>
              <div :class="{'alarm-status-warning': item.status !== '正常'}">{{ item.status }}</div>
              <div>{{ item.value }}</div>
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
import { getDisplaceList } from '@/api/reservoir';
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

// 获取位移监测数据
const fetchDisplacementData = async () => {
  if (!selectedDamNode.value?.gateStationCode) {
    console.warn('缺少gateStationCode，无法获取位移监测数据');
    allSourceData.value = [];
    prepareScrollableData();
    return;
  }

  try {
    loading.value = true;
    const params = {
      analyseTimeType: "24h",
      gateStationCode: selectedDamNode.value.gateStationCode,
      limit: 1000,
      page: 1
    };

    const response = await getDisplaceList(params);
    
    if (response ) {
      // 转换数据格式以匹配原有的显示格式
      allSourceData.value = response.list.map((item, index) => ({
        device: `位移监测#${String(index + 1).padStart(2, '0')}`,
        value: `${item.displaceRealValue}${item.unit || 'mm'}`,
        time: item.mvcTime || formatDateTime(new Date()),
        status: item.warnStatus || '正常'
      }));
    } else {
      allSourceData.value = [];
    }
  } catch (error) {
    console.error('获取位移监测数据失败:', error);
    ElMessage.error('获取位移监测数据失败');
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

  // Only scroll if content is taller than container
  // and we have enough content for seamless looping (at least one full original set beyond the viewport)
  if (content.scrollHeight <= container.clientHeight || content.scrollHeight / 2 < container.clientHeight && allSourceData.value.length <= 5) {
     // If not enough content to make seamless scroll worthwhile, or content fits, do not scroll.
     // The 'allSourceData.value.length <= 5' is a heuristic to avoid scrolling very short lists that are duplicated.
    return;
  }

  scrollInterval.value = setInterval(() => {
    if (container && content) {
      // Check if we've scrolled past the first half of the duplicated content
      if (container.scrollTop >= content.scrollHeight / 2) {
        container.scrollTop -= content.scrollHeight / 2; // Reset to the start of the visual equivalent
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
    // Always duplicate the source data for seamless scrolling if source is not empty
    scrollableData.value = [...source, ...source];
}

// 监听选中节点变化
watch(selectedDamNode, (newNode) => {
  if (newNode?.gateStationCode) {
    fetchDisplacementData();
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
  /* background-color: #0A214D; */ /* Optional: if subtitleFrame doesn't provide a bg for its slot */
}

.scrollable-table-container {
  width: 100%;
  max-height: 230px;
  min-height: 230px;
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
  width: 100%;
}

.data-table {
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 5px;
  padding: 8px 5px;
  font-size: 12px;
  text-align: center;
}

.table-header {
  font-weight: bold;
  color: #14c5ff;
  border-bottom: 1px solid rgba(20, 197, 255, 0.3);
  /* No longer sticky, no specific background needed here if .table-wrapper has one */
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