<template>
  <div class="dam-layout">
    <aside v-if="!isOverviewRoute" class="dam-sider" >
      <div v-loading="loading" class="tree-container">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
          class="dam-tree"
          ref="treeRef"
        />
      </div>
    </aside>
    <main class="dam-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getDamDirectoryListApi } from '@/api/reservoir';
import { useStore } from '@/store/pinia';

const route = useRoute();
const store = useStore();
const isOverviewRoute = computed(() => route.path.includes('/overview'));

const treeData = ref([]);
const loading = ref(false);
const treeRef = ref(); // 树组件的引用

// 获取大坝目录列表
const fetchDamDirectoryList = async () => {
  try {
    loading.value = true;
    const response = await getDamDirectoryListApi();
    
    // 判断是否为环境监测页面，决定是否显示闸站层级
    const isEnvironmentRoute = route.path.includes('/environment')||route.path.includes('/stress')||route.path.includes('/seepage')||route.path.includes('/flow')||route.path.includes('/displacement');
    
    // 转换接口数据为树形结构（省-市-区-镇-水库-闸站）
    const transformedData = response.map((provinceData, provinceIndex) => ({
      id: `province_${provinceIndex}`,
      label: provinceData.province,
      children: provinceData.envMcsCityVOS.map((cityData, cityIndex) => ({
        id: `city_${provinceIndex}_${cityIndex}`,
        label: cityData.city,
        children: cityData.envMcsAreaVOS.map((areaData, areaIndex) => ({
          id: `area_${provinceIndex}_${cityIndex}_${areaIndex}`,
          label: areaData.area,
          children: areaData.envMcsTownVOS.map((townData, townIndex) => ({
            id: `town_${provinceIndex}_${cityIndex}_${areaIndex}_${townIndex}`,
            label: townData.town,
            children: townData.reservoirInfoVOS.map((reservoir) => {
              // 如果是环境监测页面，直接返回水库节点，不显示闸站
              if (isEnvironmentRoute) {
                return {
                  id: reservoir.id,
                  label: reservoir.reservoirName,
                  reservoirCode: reservoir.reservoirCode,
                  reservoirName: reservoir.reservoirName
                };
              }
              
              // 其他页面显示完整的六级结构（包含闸站）
              return {
                id: reservoir.id,
                label: reservoir.reservoirName,
                reservoirCode: reservoir.reservoirCode,
                reservoirName: reservoir.reservoirName,
                children: reservoir.deviceGateStationInfoNodeVOS?.map((gateStation) => ({
                  id: gateStation.id,
                  label: gateStation.gateStationName,
                  gateStationCode: gateStation.gateStationCode,
                  gateStationName: gateStation.gateStationName,
                  reservoirManagementNo: gateStation.reservoirManagementNo
                })) || []
              };
            })
          }))
        }))
      }))
    }));
    
    treeData.value = transformedData;
    
    // 数据加载完成后，处理节点选中逻辑
    await nextTick();
    handleNodeSelection();
    
  } catch (error) {
    console.error('获取大坝目录列表失败:', error);
    // 出错时使用默认数据
    treeData.value = [
      {
        id: 1,
        label: '福州市',
        children: [
          {
            id: 11,
            label: 'AA水库大坝'
          },
          {
            id: 12,
            label: 'BB水库大坝'
          },
          {
            id: 13,
            label: 'CCC水库大坝'
          },
          {
            id: 14,
            label: 'DDD水库大坝'
          }
        ]
      }
    ];
    
    // 使用默认数据时也要处理节点选中
    await nextTick();
    handleNodeSelection();
    
  } finally {
    loading.value = false;
  }
};

// 处理节点选中逻辑
const handleNodeSelection = () => {
  console.log('=== 处理节点选中逻辑 ===');
  console.log('当前store中的选中节点:', store.selectedDamNode);
  console.log('树数据是否已加载:', treeData.value.length > 0);
  console.log('树组件是否已准备:', !!treeRef.value);
  
  // 如果store中已有选中的节点（通过跳转进入），则选中对应节点
  if (store.selectedDamNode && store.selectedDamNode.id) {
    console.log('检测到预设选中节点，尝试选中:', store.selectedDamNode);
    selectNodeById(store.selectedDamNode.id);
  } else {
    // 否则默认选中第一个节点（手动进入）
    console.log('没有预设选中节点，选中第一个节点');
    selectFirstNode();
  }
};

// 默认选中第一个可选节点（仅在没有预设节点时调用）
const selectFirstNode = () => {
  const isEnvironmentRoute = route.path.includes('/environment');
  
  // 深入到多级结构找到第一个可选节点
  if (treeData.value.length > 0) {
    const province = treeData.value[0];
    if (province.children && province.children.length > 0) {
      const city = province.children[0];
      if (city.children && city.children.length > 0) {
        const area = city.children[0];
        if (area.children && area.children.length > 0) {
          const town = area.children[0];
          if (town.children && town.children.length > 0) {
            const firstReservoir = town.children[0];
            
            let nodeToSelect = firstReservoir;
            
            // 如果不是环境监测页面且水库有闸站，优先选择第一个闸站
            if (!isEnvironmentRoute && firstReservoir.children && firstReservoir.children.length > 0) {
              nodeToSelect = firstReservoir.children[0];
            }
            
            // 设置树组件的选中状态
            if (treeRef.value) {
              treeRef.value.setCurrentKey(nodeToSelect.id);
            }
            
            // 更新store中的选中节点
            store.setSelectedDamNode(nodeToSelect);
            console.log('默认选中第一个节点:', nodeToSelect);
          }
        }
      }
    }
  }
};

// 根据节点ID选中对应的树节点（支持水库和闸站）
const selectNodeById = (nodeId) => {
  if (!treeData.value.length || !treeRef.value) {
    console.warn('树数据未加载或树组件未准备好');
    return;
  }

  // 递归搜索多级树结构中的目标节点
  const findTargetNode = (nodes) => {
    for (const node of nodes) {
      // 检查当前节点ID是否匹配
      if (node.id.toString() === nodeId.toString()) {
        return node;
      }
      // 如果有子节点，递归搜索
      if (node.children && node.children.length > 0) {
        const found = findTargetNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const targetNode = findTargetNode(treeData.value);

  if (targetNode) {
    // 设置树组件的选中状态
    treeRef.value.setCurrentKey(targetNode.id);
    
    // 更新store中的选中节点（确保数据完整）
    store.setSelectedDamNode(targetNode);
    console.log('根据ID选中节点成功:', targetNode);
  } else {
    console.warn('未找到对应的节点, ID:', nodeId);
    // 如果找不到对应节点，则选中第一个节点作为兜底
    selectFirstNode();
  }
};

// 监听store中选中节点的变化
watch(() => store.selectedDamNode, (newNode, oldNode) => {
  // 只有在树数据已加载且新节点与当前树选中状态不一致时才同步
  if (newNode && newNode.id && treeRef.value && treeData.value.length > 0) {
    const currentSelectedKey = treeRef.value.getCurrentKey();
    if (currentSelectedKey !== newNode.id) {
      console.log('Store节点变化，同步树选中状态:', newNode);
      selectNodeById(newNode.id);
    }
  }
}, { 
  deep: true,
  immediate: false // 不立即执行，避免在初始化时干扰
});

// 监听路由变化，处理页面切换时的节点选择逻辑
watch(() => route.path, (newPath, oldPath) => {
  console.log('路由变化:', oldPath, '->', newPath);
  
  // 当切换到environment页面时，检查当前选中的节点
  if (newPath.includes('/environment') && store.selectedDamNode) {
    const currentNode = store.selectedDamNode;
    
    // 如果当前选中的是闸站节点，需要找到对应的水库节点
    if (currentNode.gateStationCode && !currentNode.reservoirCode) {
      console.log('检测到从闸站层级切换到环境监测页面，寻找对应水库节点');
      const reservoirNode = findReservoirNodeByGateStation(currentNode);
      if (reservoirNode) {
        console.log('找到对应水库节点，重新选中:', reservoirNode);
        store.setSelectedDamNode(reservoirNode);
        if (treeRef.value) {
          treeRef.value.setCurrentKey(reservoirNode.id);
        }
      } else {
        console.log('未找到对应水库节点，选中第一个水库节点');
        selectFirstNode();
      }
    }
  }
  
  // 当从environment页面切换到其他页面时，如果当前是水库节点且有闸站，可以选中第一个闸站
  if (oldPath && oldPath.includes('/environment') && !newPath.includes('/environment') && store.selectedDamNode) {
    const currentNode = store.selectedDamNode;
    
    // 如果当前选中的是水库节点且有闸站子节点，选中第一个闸站
    if (currentNode.reservoirCode && currentNode.children && currentNode.children.length > 0) {
      console.log('从环境监测页面切换到其他页面，选中第一个闸站节点');
      const firstGateStation = currentNode.children[0];
      store.setSelectedDamNode(firstGateStation);
      if (treeRef.value) {
        treeRef.value.setCurrentKey(firstGateStation.id);
      }
    }
  }
}, { immediate: false });

// 根据闸站节点查找对应的水库节点
const findReservoirNodeByGateStation = (gateStationNode) => {
  // 递归搜索树结构，找到包含该闸站的水库节点
  const searchReservoir = (nodes) => {
    for (const node of nodes) {
      // 如果是水库节点且有子节点（闸站）
      if (node.reservoirCode && node.children && node.children.length > 0) {
        // 检查是否包含目标闸站
        const hasTargetGateStation = node.children.some(child => 
          child.id === gateStationNode.id || 
          child.gateStationCode === gateStationNode.gateStationCode
        );
        if (hasTargetGateStation) {
          return node;
        }
      }
      // 如果有子节点，继续递归搜索
      if (node.children && node.children.length > 0) {
        const found = searchReservoir(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return searchReservoir(treeData.value);
};

const defaultProps = {
  children: 'children',
  label: 'label'
};

const handleNodeClick = (data, node, component) => {
  console.log('点击节点:', data, node);
  
  const isEnvironmentRoute = route.path.includes('/environment');
  
  // 环境监测页面：只能选择水库节点（有reservoirCode且无children的节点）
  if (isEnvironmentRoute) {
    if (data.reservoirCode && (!data.children || data.children.length === 0)) {
      store.setSelectedDamNode(data);
      console.log('选中水库节点:', data);
    } else {
      console.log('环境监测页面：点击的是行政区划节点，不进行选中操作');
    }
  } else {
    // 其他页面：可以选择水库节点或闸站节点
    if (data.reservoirCode) {
      // 水库节点
      store.setSelectedDamNode(data);
      console.log('选中水库节点:', data);
    } else if (data.gateStationCode) {
      // 闸站节点
      store.setSelectedDamNode(data);
      console.log('选中闸站节点:', data);
    } else {
      console.log('点击的是行政区划节点，不进行选中操作');
    }
  }
};

// 组件挂载时获取数据
onMounted(() => {
  console.log('=== DamLayout组件挂载 ===');
  console.log('当前store中的选中节点:', store.selectedDamNode);
  fetchDamDirectoryList();
});
</script>

<style lang="scss" scoped>
.dam-layout {
  display: flex;
  height: 100%;
  background: #f5f7fa;

  .dam-sider {
    width: 380px;
    background: #fff;
    border-right: 1px solid #ebeef5;
    padding: 20px 0 20px 20px;
    box-sizing: border-box;
    border-radius: 12px;
  }
  
  .tree-container {
    height: 100%;
    min-height: 300px;
  }
  .el-tree{
    .el-tree-node__content{
      height: 35px;
    }
  }
  .dam-tree {
    background: #fff;
  }
  
  .dam-main {
    flex: 1;
    padding-left: 24px;
    overflow: auto;
  }
}
.el-tree{
  --el-tree-node-content-height:35px !important;
}
:deep(.el-tree) { /* 另一种深度选择器写法，Vue 3 推荐 */
   .el-tree-node {
    /* 根节点：直接作为 .el-tree 的子节点，且父节点是 .el-tree */
    &:not(.el-tree-node__children .el-tree-node) .el-tree-node__label {
      font-size: 16px; /* 根节点 */
      font-weight: bold;
    }

    /* 所有子节点（只要嵌套在 .el-tree-node__children 中） */
    .el-tree-node__children .el-tree-node .el-tree-node__label {
      font-size: 14px; /* 子节点 */
      font-weight: normal;
    }
  }
}
</style>