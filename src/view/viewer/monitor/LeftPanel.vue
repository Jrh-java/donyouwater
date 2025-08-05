<template>
  <div class="side-panel monitor-main-panel">
    <div class="dam-selection-area">
      <div class="selection-row">
        <span class="dam-select-label">选择闸站:</span>
        <el-tree-select
          v-model="selectedGateStation"
          :data="treeData"
          :props="{ label: 'label', children: 'children', value: 'id' }"
          :loading="loading"
          placeholder="请选择闸站"
          check-strictly
          default-expand-all
          :render-after-expand="false"
          class="dam-select"
          :teleported="false"
          @change="handleGateStationChange"
        />
      </div>
      <div class="selection-row">
        <span class="device-type-label">设备类型:</span>
        <el-select
          v-model="selectedDeviceType"
          placeholder="请选择"
          class="device-type-select"
          :teleported="false"
          :disabled="!selectedGateStation"
          @change="handleDeviceTypeChange"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <!-- <el-button type="primary" link class="dam-detail-link" @click="openDamDetailModal">查看详情</el-button> -->
    </div>
    <device-summary />
    <environment-monitor />

    <DamDetailModal 
      :show="showDamDetailModal" 
      :dam-id="selectedDamForDetail"
      @close="closeDamDetailModal"
      @navigate-to-monitor="handleNavigateToMonitor"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import EnvironmentMonitor from './leftComponent/EnvironmentMonitor.vue';
import DeviceSummary from './leftComponent/DeviceSummary.vue';
import DamDetailModal from './leftComponent/DamDetailModal.vue';
import { getDamDirectoryListApi, getReservoirDeviceManagementInfo } from '@/api/reservoir';
import { useStore } from '@/store/pinia';
import { storeToRefs } from 'pinia';

const store = useStore();
const { selectedDamNode, deviceTypeFilter } = storeToRefs(store);

// 闸站选择相关
const treeData = ref([]);
const selectedGateStation = ref('');
const loading = ref(false);
const showDamDetailModal = ref(false);
const selectedDamForDetail = ref(null);

// 设备类型选择相关
const selectedDeviceType = ref('');
const deviceTypeOptions = ref([
  { value: '', label: '全部' },
  { value: 'env', label: '环境监测' },
  { value: 'stress', label: '应力监测' },
  { value: 'displacement', label: '位移监测' },
  { value: 'pressure', label: '渗压监测' },
  { value: 'seepage', label: '渗流监测' },
  { value: 'safemvs', label: '安防监测' },
  { value: 'gate', label: '闸门管理' },
  { value: 'gateStation', label: '闸站管理' }
]);

// 获取闸站目录列表
const fetchGateStationList = async () => {
  try {
    loading.value = true;
    const response = await getDamDirectoryListApi();
    
    // 转换接口数据为六级树形结构（省-市-区-镇-水库-闸站）
    const transformedData = response.map((provinceData, provinceIndex) => ({
      id: `province_${provinceIndex}`,
      label: provinceData.province,
      disabled: true, // 省份节点不可选择
      children: provinceData.envMcsCityVOS.map((cityData, cityIndex) => ({
        id: `city_${provinceIndex}_${cityIndex}`,
        label: cityData.city,
        disabled: true, // 城市节点不可选择
        children: cityData.envMcsAreaVOS.map((areaData, areaIndex) => ({
          id: `area_${provinceIndex}_${cityIndex}_${areaIndex}`,
          label: areaData.area,
          disabled: true, // 区域节点不可选择
          children: areaData.envMcsTownVOS.map((townData, townIndex) => ({
            id: `town_${provinceIndex}_${cityIndex}_${areaIndex}_${townIndex}`,
            label: townData.town,
            disabled: true, // 镇节点不可选择
            children: townData.reservoirInfoVOS.map((reservoir) => ({
              id: reservoir.id,
              label: reservoir.reservoirName,
              reservoirCode: reservoir.reservoirCode,
              reservoirName: reservoir.reservoirName,
              disabled: false, // 水库节点可选择
              children: reservoir.deviceGateStationInfoNodeVOS?.map((gateStation) => ({
                id: gateStation.id,
                label: gateStation.gateStationName,
                gateStationCode: gateStation.gateStationCode,
                gateStationName: gateStation.gateStationName,
                reservoirManagementNo: gateStation.reservoirManagementNo,
                disabled: false // 闸站节点可选择
              })) || []
            }))
          }))
        }))
      }))
    }));
    
    treeData.value = transformedData;
    
  } catch (error) {
    console.error('获取闸站目录列表失败:', error);
    ElMessage.error('获取闸站目录列表失败');
  } finally {
    loading.value = false;
    // 数据加载完成后，尝试恢复之前的选择状态
    await nextTick();
    restoreSelectionState();
  }
};

// 恢复选择状态
const restoreSelectionState = () => {
  // 如果store中有缓存的选中节点，恢复闸站选择
  if (selectedDamNode.value && selectedDamNode.value.id) {
    console.log('恢复闸站选择:', selectedDamNode.value);
    selectedGateStation.value = selectedDamNode.value.id;
  }
  
  // 如果store中有缓存的设备类型过滤条件，恢复设备类型选择
  if (deviceTypeFilter.value !== undefined) {
    console.log('恢复设备类型选择:', deviceTypeFilter.value);
    selectedDeviceType.value = deviceTypeFilter.value;
  }
};

// 处理闸站选择变化
const handleGateStationChange = (value) => {
  console.log('选择的节点ID:', value);
  
  if (!value) {
    console.warn('选择的节点ID为空');
    // 重置设备类型选择
    selectedDeviceType.value = '';
    store.setSelectedDamNode(null);
    store.setDeviceTypeFilter('');
    return;
  }
  
  // 递归查找选中的节点（闸站或水库）
  const findSelectedNode = (nodes, targetId) => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return node;
      }
      if (node.children) {
        const found = findSelectedNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const selectedNode = findSelectedNode(treeData.value, value);
  if (selectedNode) {
    // 重置设备类型选择
    selectedDeviceType.value = '';
    
    // 判断是闸站节点还是水库节点
    if (selectedNode.gateStationCode) {
      // 闸站节点
      store.setSelectedDamNode({
        ...selectedNode,
        nodeType: 'gateStation',
        gateStationCode: selectedNode.gateStationCode
      });
      console.log('已选择闸站:', selectedNode.gateStationName, 'Code:', selectedNode.gateStationCode);
    } else if (selectedNode.reservoirCode) {
      // 水库节点
      store.setSelectedDamNode({
        ...selectedNode,
        nodeType: 'reservoir',
        reservoirCode: selectedNode.reservoirCode
      });
      console.log('已选择水库:', selectedNode.reservoirName, 'Code:', selectedNode.reservoirCode);
    }
    
    // 通知Viewer组件更新设备数据（初始为空，等待设备类型选择）
    store.setDeviceTypeFilter('');
  } else {
    console.warn('未找到对应的节点:', value);
  }
};

const openDamDetailModal = () => {
  if (selectedGateStation.value) {
    selectedDamForDetail.value = selectedGateStation.value;
    showDamDetailModal.value = true;
    console.log('打开详情弹窗，节点ID:', selectedGateStation.value);
  } else {
    ElMessage.warning('请先选择一个闸站或水库');
  }
};

const closeDamDetailModal = () => {
  showDamDetailModal.value = false;
  selectedDamForDetail.value = null;
};

// 处理设备类型选择变化
const handleDeviceTypeChange = (value) => {
  console.log('选择的设备类型:', value);
  
  // 确保已选择节点（闸站或水库）
  if (!selectedGateStation.value) {
    ElMessage.warning('请先选择闸站或水库');
    selectedDeviceType.value = '';
    return;
  }
  
  // 通知Viewer组件更新设备数据
  store.setDeviceTypeFilter(value);
};

// 处理从详情弹窗发出的导航请求
const handleNavigateToMonitor = (damId) => {
  console.log(`请求导航到大坝 ${damId} 的监测告警页面`);
  // 在这里实现具体的页面跳转逻辑
  // 例如：router.push({ name: 'MonitorPanel', params: { damId: damId } });
  // 或者通过emit事件通知父组件
  // emit('switch-to-monitor-panel', damId);
};

// 初始化时获取闸站数据
onMounted(async () => {
  await fetchGateStationList();
});
</script>

<style scoped>
.monitor-main-panel {
  background-image: url('@/assets/viewer/panel_background.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  height: calc(100% - 70px);
  box-sizing: border-box;
  margin-top: 50px;
  width: 380px;
  position: fixed;
  left: 20px;
  z-index: 100;
  padding: 8px 12px 12px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dam-selection-area {
  display: flex;
  flex-direction: column;
  padding: 10px 0px;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  gap: 10px;
}

.selection-row {
  display: flex;
  align-items: center;
  height: 40px;
}

.dam-select-label,
.device-type-label {
  font-size: 14px;
  color: #E0F2F7;
  margin-right: 8px;
  width: 80px;
  flex-shrink: 0;
}

.dam-select,
.device-type-select {
  width: 180px;
  margin-right: auto;
}

.dam-detail-link {
  font-size: 14px;
}

/* el-tree-select 和 el-select 样式调整 */
.dam-select :deep(.el-select .el-input__wrapper),
.device-type-select :deep(.el-input__wrapper) {
  background-color: transparent !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
  box-shadow: none !important;
  height: 28px;
}

.dam-select :deep(.el-select .el-input__inner),
.device-type-select :deep(.el-input__inner) {
  color: #E0F2F7 !important;
  height: 26px;
  line-height: 26px;
}

.dam-select :deep(.el-select .el-input__placeholder),
.device-type-select :deep(.el-input__placeholder) {
  color: rgba(224, 242, 247, 0.6) !important;
}

.dam-select :deep(.el-select__selected-item span),
.dam-select :deep(.el-select__placeholder span),
.device-type-select :deep(.el-select__selected-item span),
.device-type-select :deep(.el-select__placeholder span) {
  color: #fff !important;
}

.dam-select :deep(.el-select .el-select__caret),
.dam-select :deep(.el-select .el-select__suffix),
.device-type-select :deep(.el-select__caret),
.device-type-select :deep(.el-select__suffix) {
  color: #E0F2F7 !important;
}

/* 下拉框样式 - 由于设置了 teleported="false"，下拉框会在当前组件内 */
.dam-select :deep(.el-select-dropdown),
.device-type-select :deep(.el-select-dropdown) {
  background-color: rgba(3,27,56,0.95) !important;
  border: 1px solid rgba(0,122,255,0.7) !important;
}

:deep(.el-select__wrapper){
    color: #E0F2F7 !important;
  background-color: transparent !important;
}

:deep(.el-tree .dam-select){
    background: rgba(3,27,56,0.95) !important;
}

:deep(.el-tree-node){
      background: rgba(3,27,56,0.95) !important;
}

.dam-select :deep(.el-select__wrapper .el-select-dropdown ),
.device-type-select :deep(.el-select__wrapper .el-select-dropdown ) {
  color: #E0F2F7 !important;
  background-color: transparent !important;
}

.dam-select :deep(.el-select-dropdown .el-node__content:hover) {
  background-color: rgba(0,122,255,0.3) !important;
  color: #E0F2F7 !important;
}

.dam-select :deep(.el-select-dropdown .el-node.is-current > .el-node__content) {
  color: #409EFF !important;
  background-color: rgba(0,122,255,0.2) !important;
  font-weight: bold;
}

.device-type-select :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(0,122,255,0.3) !important;
  color: #E0F2F7 !important;
}

.device-type-select :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  color: #409EFF !important;
  background-color: rgba(0,122,255,0.2) !important;
  font-weight: bold;
}

.environment-monitor-container {
  flex-grow: 1;
  overflow-y: auto;
}
</style>