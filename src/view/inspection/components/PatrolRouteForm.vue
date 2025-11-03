<template>
  <div class="create-route-container">
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" align-center>
      <el-step title="制定路线/区域" />
      <el-step title="完善信息" />
      <el-step title="发布路线" />
    </el-steps>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1：制定路线/区域 -->
      <div v-if="currentStep === 0" class="step-1">
        <h3>制定路线/区域</h3>
        <div class="route-method">
          <span class="method-label">选择方式</span>
          <div class="method-options">
            <div 
              :class="['method-card', { active: selectedMethod === 'draw' }]"
              @click="handleMethodChange('draw')"
              :style="{ pointerEvents: readonly ? 'none' : 'auto', opacity: readonly ? 0.6 : 1 }"
            >
              <el-icon><EditPen /></el-icon>
              <span>添加节点</span>
            </div>
            <div 
              :class="['method-card', { active: selectedMethod === 'area' }]"
              @click="handleMethodChange('area')"
              :style="{ pointerEvents: readonly ? 'none' : 'auto', opacity: readonly ? 0.6 : 1 }"
            >
              <el-icon><Operation /></el-icon>
              <span>绘制区域</span>
            </div>
          </div>
        </div>

        <!-- 添加节点模式 -->
        <div v-if="selectedMethod === 'draw'" class="route-config">
          <div class="config-panel">
            <!-- 节点输入模式选择器 -->
            <div class="input-mode-selector">
              <h4>添加节点方式</h4>
              <el-radio-group v-model="nodeInputMode" @change="handleNodeInputModeChange" :disabled="readonly">
                <el-radio value="manual">手动输入坐标</el-radio>
                <el-radio value="map-click">地图点击添加</el-radio>
              </el-radio-group>
            </div>
            
            <div class="route-points">
              <h4>路径</h4>
              
              <!-- 空状态提示 -->
              <div v-if="routeNodes.length === 0" class="empty-nodes">
                <el-icon><MapLocation /></el-icon>
                <span v-if="nodeInputMode === 'manual'">暂无路线节点，请点击下方按钮添加节点</span>
                <span v-else>暂无路线节点，请在地图上点击添加节点</span>
              </div>
              
              <div 
                v-for="(node, index) in routeNodes" 
                :key="node.id" 
                class="point-controls"
              >
                <span>节点{{ index + 1 }}</span>
                <span>{{ node.name }}</span>
                <span class="coordinates">{{ node.longitude }}, {{ node.latitude }}</span>
                <el-button 
                  v-if="!readonly"
                  type="danger" 
                  link 
                  @click="removeRouteNode(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              
              <!-- 手动输入模式的添加按钮 -->
              <el-button 
                v-if="!readonly && nodeInputMode === 'manual'" 
                text 
                type="primary" 
                @click="addRoutePoint"
              >
                + 添加路线节点
              </el-button>
              
              <!-- 地图点击模式的提示 -->
              <div v-if="!readonly && nodeInputMode === 'map-click'" class="map-click-tip">
                <el-icon><MapLocation /></el-icon>
                <span>请在右侧地图上点击添加节点</span>
              </div>
            </div>
            
            <div class="route-stats">
              <div class="stat-item">
                <el-icon><Timer /></el-icon>
                <span>总距离</span>
                <strong>{{ totalDistance }} km</strong>
              </div>
            </div>
          </div>
          
          <!-- 地图预览区域 -->
          <div class="map-container">
            <InspectionViewer 
              ref="mapViewerRef"
              @distance-calculated="onDistanceCalculated"
              @area-calculated="onAreaCalculated"
              @map-click="handleMapClick"
            />
          </div>
        </div>

        <!-- 绘制区域模式 -->
        <div v-if="selectedMethod === 'area'" class="area-config">
          <div class="config-panel">
            <!-- 自定义路径选择 -->
            <div class="route-type-selector">
              <el-radio-group v-model="routeType" @change="handleRouteTypeChange" :disabled="readonly">
                <el-radio value="circle">圆形区域</el-radio>
                <el-radio value="rectangle">矩形区域</el-radio>
              </el-radio-group>
            </div>

            <!-- 圆形区域配置 -->
            <div v-if="routeType === 'circle'" class="circle-config">
              <h4>
                <el-icon><Operation /></el-icon>
                圆形区域
              </h4>
              
              <div class="config-row">
                <label>经度</label>
                <el-input v-model="areaForm.circle.centerLng" placeholder="请输入经度" :readonly="readonly" />
              </div>
              
              <div class="config-row">
                <label>纬度</label>
                <el-input v-model="areaForm.circle.centerLat" placeholder="请输入纬度" :readonly="readonly" />
              </div>
              
              <div class="config-row">
                <label>半径</label>
                <div class="radius-input">
                  <el-input v-model="areaForm.circle.radius" placeholder="请输入半径" :readonly="readonly" />
                  <span>m</span>
                </div>
              </div>
              
              <div class="config-row">
                <label>面积</label>
                <div class="area-display">
                  <span>{{ circleArea }} km²</span>
                </div>
              </div>
              
              <div v-if="!readonly" class="action-buttons">
                <el-button @click="resetCircleArea">重置</el-button>
                <el-button type="primary" @click="showCircleArea">显示</el-button>
              </div>
            </div>
            
            <!-- 矩形区域配置 -->
            <div v-if="routeType === 'rectangle'" class="rectangle-config">
              <h4>
                <el-icon><Operation /></el-icon>
                矩形区域
              </h4>
              
              <div class="config-section">
                <h5>左上角</h5>
                <div class="config-row">
                  <label>经度</label>
                  <el-input v-model="areaForm.rectangle.topLeftLng" placeholder="左上角经度" :readonly="readonly" />
                </div>
                <div class="config-row">
                  <label>纬度</label>
                  <el-input v-model="areaForm.rectangle.topLeftLat" placeholder="左上角纬度" :readonly="readonly" />
                </div>
              </div>
              
              <div class="config-section">
                <h5>右下角</h5>
                <div class="config-row">
                  <label>经度</label>
                  <el-input v-model="areaForm.rectangle.bottomRightLng" placeholder="右下角经度" :readonly="readonly" />
                </div>
                <div class="config-row">
                  <label>纬度</label>
                  <el-input v-model="areaForm.rectangle.bottomRightLat" placeholder="右下角纬度" :readonly="readonly" />
                </div>
              </div>
              
              <div class="config-row">
                <label>面积</label>
                <div class="area-display">
                  <span>{{ rectangleArea }} km²</span>
                </div>
              </div>
              
              <div v-if="!readonly" class="action-buttons">
                <el-button @click="resetRectangleArea">重置</el-button>
                <el-button type="primary" @click="showRectangleArea">显示</el-button>
              </div>
            </div>
          </div>
          
          <!-- 地图预览区域 -->
          <div class="map-container">
            <InspectionViewer 
              ref="mapViewerRef"
              @distance-calculated="onDistanceCalculated"
              @area-calculated="onAreaCalculated"
            />
          </div>
        </div>
      </div>

      <!-- 步骤2：完善信息 -->
      <div v-if="currentStep === 1" class="step-2">
        <h3>完善信息</h3>
        <el-form :model="routeForm" :rules="routeRules" ref="routeFormRef" label-width="120px">
          <el-form-item label="路线名称" prop="routeName" required>
            <el-input v-model="routeForm.routeName" placeholder="请输入路线名称" :readonly="readonly" />
          </el-form-item>
          
          <el-form-item label="所属水库">
            <el-select 
              v-model="routeForm.reservoir" 
              placeholder="请选择所属水库" 
              :teleported="false"
              :loading="reservoirOptionsLoading"
              style="width: 100%"
              :disabled="readonly"
            >
              <el-option 
                v-for="item in reservoirOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.label" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="路线类型" required>
            <el-select v-model="routeForm.routeType" placeholder="请选择路线类型" :teleported="false" :disabled="readonly">
              <el-option label="日常巡查" value="1" />
              <el-option label="年度巡检" value="2" />
              <el-option label="特殊巡检" value="3" />
              <el-option label="维修" value="4" />
              <el-option label="保养" value="5" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注信息">
            <el-input 
              v-model="routeForm.remarks" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入备注信息"
              :readonly="readonly"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3：发布路线 -->
      <div v-if="currentStep === 2" class="step-3">
        <div class="confirm-content">
          <h3>确认路线信息</h3>
          
          <div class="route-summary">
            <div class="summary-card">
              <h4>{{ routeForm.routeName || '未命名路线' }}</h4>
              
              <div class="summary-info">
                <div class="info-section">
                  <h5>基本信息</h5>
                  <div class="detail-item">
                    <span>路线名称</span>
                    <span>{{ routeForm.routeName || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span>所属水库</span>
                    <span>{{ routeForm.reservoir || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span>路线类型</span>
                    <span>{{ getRouteTypeText(routeForm.routeType) }}</span>
                  </div>
                  <div class="detail-item">
                    <span>制定方式</span>
                    <span>{{ getMethodText(selectedMethod) }}</span>
                  </div>
                </div>
                
                <div v-if="selectedMethod === 'draw'" class="info-section">
                  <h5>路线节点</h5>
                  <div v-for="(node, index) in routeNodes" :key="node.id" class="detail-item">
                    <span>节点{{ index + 1 }}</span>
                    <span>{{ node.name }}</span>
                  </div>
                </div>
                
                <div v-if="selectedMethod === 'area'" class="info-section">
                  <h5>区域信息</h5>
                  <div v-if="routeType === 'circle'" class="detail-item">
                    <span>区域类型</span>
                    <span>圆形区域</span>
                  </div>
                  <div v-if="routeType === 'circle'" class="detail-item">
                    <span>中心坐标</span>
                    <span>{{ areaForm.circle.centerLng }}, {{ areaForm.circle.centerLat }}</span>
                  </div>
                  <div v-if="routeType === 'circle'" class="detail-item">
                    <span>半径</span>
                    <span>{{ areaForm.circle.radius }}m</span>
                  </div>
                  <div v-if="routeType === 'rectangle'" class="detail-item">
                    <span>区域类型</span>
                    <span>矩形区域</span>
                  </div>
                  <div v-if="routeType === 'rectangle'" class="detail-item">
                    <span>左上角</span>
                    <span>{{ areaForm.rectangle.topLeftLng }}, {{ areaForm.rectangle.topLeftLat }}</span>
                  </div>
                  <div v-if="routeType === 'rectangle'" class="detail-item">
                    <span>右下角</span>
                    <span>{{ areaForm.rectangle.bottomRightLng }}, {{ areaForm.rectangle.bottomRightLat }}</span>
                  </div>
                </div>
                
                <div class="info-section">
                  <h5>统计信息</h5>
                  <div v-if="selectedMethod === 'draw'" class="detail-item">
                    <span>总距离</span>
                    <span>{{ totalDistance }} km</span>
                  </div>
                  <div v-if="selectedMethod === 'area'" class="detail-item">
                    <span>总面积</span>
                    <span>{{ totalArea }} km²</span>
                  </div>
                </div>
                
                <div v-if="routeForm.remarks" class="info-section">
                  <h5>备注信息</h5>
                  <div class="remarks-content">
                    {{ routeForm.remarks }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 路线预览图 -->
            <div class="route-preview-large">
              <h5>路线预览</h5>
              <div class="map-preview-container">
                <img 
                  v-if="mapScreenshotBase64" 
                  :src="mapScreenshotBase64" 
                  alt="路线预览图" 
                  class="map-preview-image"
                />
                <div v-else class="map-placeholder-summary">
                  <el-icon><MapLocation /></el-icon>
                  <span>预览图生成中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤操作按钮 -->
    <div v-if="!readonly" class="step-actions">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <div class="step-actions-right">
        <el-button 
          v-if="currentStep === 0" 
          type="success" 
          @click="saveDraft"
        >
          保存草稿
        </el-button>
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 2" 
          type="primary" 
          @click="finishCreate"
        >
          {{ mode === 'edit' ? '保存' : '完成' }}
        </el-button>
      </div>
    </div>
    
    <!-- 查看模式的关闭按钮 -->
    <div v-if="readonly" class="readonly-actions">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
  
  <!-- 添加节点弹窗（手动输入模式） -->
  <el-dialog 
    v-model="showAddNodeDialog" 
    title="添加路线节点" 
    width="400px"
    :lock-scroll="false"
  >
    <el-form :model="nodeForm" label-width="80px">
      <el-form-item label="节点名称" required>
        <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
      </el-form-item>
      
      <el-form-item label="经度" required>
        <el-input v-model="nodeForm.longitude" placeholder="请输入经度" />
      </el-form-item>
      
      <el-form-item label="纬度" required>
        <el-input v-model="nodeForm.latitude" placeholder="请输入纬度" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showAddNodeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddNode">确认</el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- 地图点击节点名称输入弹窗 -->
  <el-dialog 
    v-model="showMapNodeNameDialog" 
    title="输入节点名称" 
    width="350px"
    :lock-scroll="false"
  >
    <div class="map-node-info">
      <p>坐标位置：{{ pendingMapNode?.longitude.toFixed(6) }}, {{ pendingMapNode?.latitude.toFixed(6) }}</p>
    </div>
    
    <el-form label-width="80px">
      <el-form-item label="节点名称" required>
        <el-input 
          v-model="mapNodeName" 
          placeholder="请输入节点名称" 
          @keyup.enter="confirmMapNode"
          autofocus
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelMapNode">取消</el-button>
        <el-button type="primary" @click="confirmMapNode">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.input-mode-selector {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.input-mode-selector h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.map-click-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  color: #1976d2;
  font-size: 14px;
  margin-top: 12px;
}

.map-click-tip .el-icon {
  font-size: 16px;
}

.map-node-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
}

.map-node-info p {
  margin: 0;
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  EditPen, Operation, MapLocation, Timer, Delete
} from '@element-plus/icons-vue';
import InspectionViewer from './inspectionViewer.vue';
import { getReservoirPage } from '@/api/reservoir';
import { 
  savePatrolRoute, 
  getPatrolRouteDraft, 
  getPatrolRouteDetail,
  type PatrolRoute
} from '@/api/patrol';

// 组件属性
interface Props {
  modelValue: boolean;
  mode?: 'create' | 'edit' | 'view'; // 模式：创建、编辑、查看
  routeId?: string; // 编辑模式下的路线ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  routeId: ''
});

// 组件事件
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [message: string];
}>();

// 类型定义
interface RouteNode {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

const readonly = computed(() => props.mode === 'view');

const title = computed(() => {
  switch (props.mode) {
    case 'create': return '创建路线';
    case 'edit': return '编辑路线';
    case 'view': return '查看路线';
    default: return '创建路线';
  }
});

// 水库选项数据
const reservoirOptions = ref<Array<{ label: string; value: string }>>([]);
const reservoirOptionsLoading = ref(false);

// 步骤和方法选择
const currentStep = ref(0);
const selectedMethod = ref('draw');
const routeType = ref('circle');

// 节点输入模式
const nodeInputMode = ref('manual'); // 'manual' | 'map-click'

// 添加节点弹窗
const showAddNodeDialog = ref(false);
const nodeForm = reactive({
  name: '',
  longitude: '',
  latitude: ''
});

// 地图点击添加节点的临时数据
const pendingMapNode = ref<{longitude: number; latitude: number} | null>(null);
const showMapNodeNameDialog = ref(false);
const mapNodeName = ref('');

// 路线节点列表
const routeNodes = ref<RouteNode[]>([]);

// 地图组件引用
const mapViewerRef = ref();

// 距离和面积数据
const totalDistance = ref(0);
const totalArea = ref(0);
const circleArea = ref(0);
const rectangleArea = ref(0);

// 地图截图base64
const mapScreenshotBase64 = ref('');

// 绘制状态标记
const hasDrawnCircle = ref(false);
const hasDrawnRectangle = ref(false);

// 绘制区域表单数据
const areaForm = reactive({
  circle: {
    centerLng: '',
    centerLat: '',
    radius: ''
  },
  rectangle: {
    topLeftLng: '',
    topLeftLat: '',
    bottomRightLng: '',
    bottomRightLat: ''
  }
});

// 路线表单
const routeForm = reactive({
  routeName: '',
  reservoir: '',
  routeType: '',
  remarks: ''
});

const routeFormRef = ref();

// 表单验证规则
const routeRules = {
  routeName: [
    { required: true, message: '请输入路线名称', trigger: 'blur' }
  ]
};

// 当前编辑的路线ID
const editingRouteId = ref('');

// 存储编辑时的节点配置ID
const editingNodeConfigId = ref('');

// 监听模态框显示变化，初始化数据
watch(() => props.modelValue, (newVal) => {
  console.log('PatrolRouteForm 弹窗显示状态变化:', newVal, 'mode:', props.mode);
  if (newVal) {
    resetForm();
    initializeComponent();
  }
});

// 监听地图组件加载完成，设置初始状态
watch(mapViewerRef, (newVal) => {
  if (newVal && selectedMethod.value === 'draw') {
    // 根据当前模式设置地图点击状态
    if (nodeInputMode.value === 'map-click') {
      newVal.enableMapClick();
    } else {
      newVal.disableMapClick();
    }
  }
});

// 组件初始化
const initializeComponent = async () => {
  console.log('PatrolRouteForm 开始初始化组件...');
  await getReservoirData();
  
  if (props.mode === 'create') {
    loadDraftData();
  } else if (props.mode === 'edit' || props.mode === 'view') {
    loadRouteData();
  }
};

// 组件挂载时初始化
onMounted(() => {
  console.log('PatrolRouteForm onMounted，modelValue:', props.modelValue);
  if (props.modelValue) {
    initializeComponent();
  }
});

// 重置表单数据
const resetForm = () => {
  console.log('PatrolRouteForm resetForm 被调用');
  
  // 查看模式直接跳转到第三步
  if (props.mode === 'view') {
    currentStep.value = 2;
  } else {
    currentStep.value = 0;
  }
  
  selectedMethod.value = 'draw';
  routeType.value = 'circle';
  nodeInputMode.value = 'manual';
  
  // 清空数据
  routeNodes.value = [];
  totalDistance.value = 0;
  totalArea.value = 0;
  circleArea.value = 0;
  rectangleArea.value = 0;
  hasDrawnCircle.value = false;
  hasDrawnRectangle.value = false;
  mapScreenshotBase64.value = '';
  
  // 重置地图点击相关数据
  pendingMapNode.value = null;
  showMapNodeNameDialog.value = false;
  mapNodeName.value = '';
  
  // 重置表单
  Object.assign(routeForm, {
    routeName: '',
    reservoir: '',
    routeType: '',
    remarks: ''
  });
  
  // 重置区域表单
  areaForm.circle = { centerLng: '', centerLat: '', radius: '' };
  areaForm.rectangle = { topLeftLng: '', topLeftLat: '', bottomRightLng: '', bottomRightLat: '' };
  
  editingRouteId.value = '';
  editingNodeConfigId.value = '';
};

// 获取水库数据
const getReservoirData = async () => {
  console.log('PatrolRouteForm getReservoirData 开始执行...');
  try {
    reservoirOptionsLoading.value = true;
    
    const response = await getReservoirPage({
      page: 1,
      limit: 100
    });
    
    console.log('PatrolRouteForm 获取水库API响应:', response);
    
    if (response && (response as any).list) {
      reservoirOptions.value = (response as any).list.map((item: any) => ({
        label: item.reservoirName,
        value: item.id
      }));
      
      console.log('PatrolRouteForm水库选项数据加载完成:', reservoirOptions.value.length, '个水库', reservoirOptions.value);
    } else {
      console.warn('PatrolRouteForm获取水库数据响应为空:', response);
    }
  } catch (error) {
    console.error('PatrolRouteForm获取水库数据失败:', error);
  } finally {
    reservoirOptionsLoading.value = false;
    console.log('PatrolRouteForm getReservoirData 执行完成');
  }
};

// 获取水库名称（通过ID）
const getReservoirNameById = (id: string): string => {
  const reservoir = reservoirOptions.value.find((item) => item.value === id);
  return reservoir ? reservoir.label : '未知水库';
};

// 获取水库ID（通过名称）
const getReservoirIdByName = (name: string): string => {
  const reservoir = reservoirOptions.value.find((item) => item.label === name);
  return reservoir ? reservoir.value : '';
};

// 加载草稿数据（仅创建模式）
const loadDraftData = async () => {
  if (props.mode !== 'create') return;
  
  try {
    const response = await getPatrolRouteDraft();
    const draftData = response as any;
    
    if (draftData && (draftData.patrolRouteNodeConfigVO || draftData.patrolRouteDrawAreaConfigVO)) {
      console.log('发现草稿数据:', draftData);
      await fillFormWithData(draftData);
      ElMessage.success('已加载草稿数据');
    }
  } catch (error) {
    console.error('获取草稿数据失败:', error);
  }
};

// 加载路线数据（编辑和查看模式）
const loadRouteData = async () => {
  if (!props.routeId) return;
  
  try {
    const routeData = await getPatrolRouteDetail(props.routeId);
    editingRouteId.value = props.routeId;
    await fillFormWithData(routeData);
  } catch (error) {
    console.error('获取路线数据失败:', error);
    ElMessage.error('获取路线数据失败');
  }
};

// 用数据填充表单
const fillFormWithData = async (data: any) => {
  // 等待水库数据加载完成
  if (reservoirOptions.value.length === 0) {
    await getReservoirData();
  }
  
  // 填充基本信息
  routeForm.routeName = data.routeName || '';
  routeForm.reservoir = getReservoirNameById(data.belongReservoirId || '');
  routeForm.routeType = data.routeType || '';
  routeForm.remarks = data.remarks || '';
  
  if (data.patrolRouteNodeConfigVO) {
    // 节点模式
    selectedMethod.value = 'draw';
    const nodeConfig = data.patrolRouteNodeConfigVO;
    
    // 存储节点配置ID用于编辑
    editingNodeConfigId.value = nodeConfig.id || '';
    
    if (nodeConfig.node) {
      const nodes = nodeConfig.node.split(';').filter((node: string) => node.trim());
      routeNodes.value = nodes.map((nodeStr: string, index: number) => {
        const parts = nodeStr.split(',');
        return {
          id: `node_${Date.now()}_${index}`,
          name: parts[2] || `节点${index + 1}`,
          longitude: parseFloat(parts[0]) || 0,
          latitude: parseFloat(parts[1]) || 0
        };
      });
    }
    
    totalDistance.value = nodeConfig.distance || 0;
    
    // 显示节点到地图
    await nextTick();
    if (mapViewerRef.value && routeNodes.value.length > 0) {
      routeNodes.value.forEach(node => {
        mapViewerRef.value.addNodeToMap(node);
      });
      flyToNodesBounds();
    }
    
  } else if (data.patrolRouteDrawAreaConfigVO) {
    // 区域模式
    selectedMethod.value = 'area';
    const areaConfig = data.patrolRouteDrawAreaConfigVO;
    
    if (areaConfig.areaType === '1') {
      // 圆形区域
      routeType.value = 'circle';
      if (areaConfig.lonLat) {
        const [lng, lat] = areaConfig.lonLat.split(',');
        areaForm.circle.centerLng = lng;
        areaForm.circle.centerLat = lat;
      }
      areaForm.circle.radius = (areaConfig.radius || 0).toString();
      
      // 显示圆形区域
      await nextTick();
      if (mapViewerRef.value && areaForm.circle.centerLng && areaForm.circle.centerLat && areaForm.circle.radius) {
        mapViewerRef.value.drawCircleArea(
          parseFloat(areaForm.circle.centerLng),
          parseFloat(areaForm.circle.centerLat),
          parseFloat(areaForm.circle.radius)
        );
      }
      
    } else if (areaConfig.areaType === '2') {
      // 矩形区域
      routeType.value = 'rectangle';
      if (areaConfig.leftLonLat) {
        const [lng, lat] = areaConfig.leftLonLat.split(',');
        areaForm.rectangle.topLeftLng = lng;
        areaForm.rectangle.topLeftLat = lat;
      }
      if (areaConfig.rightLonLat) {
        const [lng, lat] = areaConfig.rightLonLat.split(',');
        areaForm.rectangle.bottomRightLng = lng;
        areaForm.rectangle.bottomRightLat = lat;
      }
      
      // 显示矩形区域
      await nextTick();
      if (mapViewerRef.value && areaForm.rectangle.topLeftLng && areaForm.rectangle.topLeftLat && 
          areaForm.rectangle.bottomRightLng && areaForm.rectangle.bottomRightLat) {
        mapViewerRef.value.drawRectangleArea(
          parseFloat(areaForm.rectangle.topLeftLng),
          parseFloat(areaForm.rectangle.topLeftLat),
          parseFloat(areaForm.rectangle.bottomRightLng),
          parseFloat(areaForm.rectangle.bottomRightLat)
        );
      }
    }
  }
  
  // 查看模式下确保跳转到第三步
  if (props.mode === 'view') {
    currentStep.value = 2;
    // 查看模式使用接口返回的file字段作为预览图
    if (data.file) {
      mapScreenshotBase64.value = data.file;
    }
  }
};

// 保存草稿
const saveDraft = async () => {
  try {
    const draftData: PatrolRoute = {
      routeName: routeForm.routeName || '未命名路线',
      belongReservoirId: getReservoirIdByName(routeForm.reservoir),
      type: selectedMethod.value === 'draw'?'1':'2',
      routeType: routeForm.routeType || '1',
      status: 'T',
      isDraft: 'T',
      remarks: routeForm.remarks
    };
    
    if (selectedMethod.value === 'draw' && routeNodes.value.length > 0) {
      const nodeStrings = routeNodes.value.map(node => 
        `${node.longitude},${node.latitude},${node.name}`
      );
      
      draftData.patrolRouteNodeConfigDTO = {
        startPoint: nodeStrings.length > 0 ? `${routeNodes.value[0].longitude},${routeNodes.value[0].latitude}` : '',
        endNode: nodeStrings.length > 0 ? `${routeNodes.value[routeNodes.value.length - 1].longitude},${routeNodes.value[routeNodes.value.length - 1].latitude}` : '',
        node: nodeStrings.join(';'),
        distance: totalDistance.value
      };
    } else if (selectedMethod.value === 'area') {
      if (routeType.value === 'circle' && areaForm.circle.centerLng && areaForm.circle.centerLat && areaForm.circle.radius) {
        draftData.patrolRouteDrawAreaConfigDTO = {
          areaType: '1',
          lonLat: `${areaForm.circle.centerLng},${areaForm.circle.centerLat}`,
          radius: parseFloat(areaForm.circle.radius)
        };
      } else if (routeType.value === 'rectangle' && areaForm.rectangle.topLeftLng && areaForm.rectangle.topLeftLat && 
                 areaForm.rectangle.bottomRightLng && areaForm.rectangle.bottomRightLat) {
        draftData.patrolRouteDrawAreaConfigDTO = {
          areaType: '2',
          leftLonLat: `${areaForm.rectangle.topLeftLng},${areaForm.rectangle.topLeftLat}`,
          rightLonLat: `${areaForm.rectangle.bottomRightLng},${areaForm.rectangle.bottomRightLat}`
        };
      }
    }
    
    await savePatrolRoute(draftData);
    ElMessage.success('草稿保存成功');
  } catch (error) {
    console.error('保存草稿失败:', error);
    ElMessage.error('保存草稿失败');
  }
};

// 切换选择方式时的处理
const handleMethodChange = (method: string) => {
  if (readonly.value) return;
  
  selectedMethod.value = method;
  
  // 清空地图和数据
  if (mapViewerRef.value) {
    mapViewerRef.value.clearAllNodes();
    mapViewerRef.value.clearAreas();
  }
  
  // 重置数据
  routeNodes.value = [];
  totalDistance.value = 0;
  totalArea.value = 0;
  circleArea.value = 0;
  rectangleArea.value = 0;
  hasDrawnCircle.value = false;
  hasDrawnRectangle.value = false;
  
  // 重置区域表单
  areaForm.circle = { centerLng: '', centerLat: '', radius: '' };
  areaForm.rectangle = { topLeftLng: '', topLeftLat: '', bottomRightLng: '', bottomRightLat: '' };
  
  // 根据选择的方法设置地图状态
  if (mapViewerRef.value) {
    if (method === 'draw') {
      // 添加节点模式：根据当前输入模式设置地图点击
      if (nodeInputMode.value === 'map-click') {
        mapViewerRef.value.enableMapClick();
      } else {
        mapViewerRef.value.disableMapClick();
      }
    } else {
      // 绘制区域模式：禁用地图点击
      mapViewerRef.value.disableMapClick();
    }
  }
};

// 处理节点输入模式切换
const handleNodeInputModeChange = () => {
  if (readonly.value) return;
  
  // 切换模式时清除已添加的节点
  if (routeNodes.value.length > 0) {
    ElMessage.warning('切换模式将清除已添加的节点');
    routeNodes.value = [];
    totalDistance.value = 0;
    
    // 清除地图上的节点
    if (mapViewerRef.value) {
      mapViewerRef.value.clearAllNodes();
    }
  }
  
  // 根据模式启用或禁用地图点击
  if (mapViewerRef.value) {
    if (nodeInputMode.value === 'map-click') {
      mapViewerRef.value.enableMapClick();
    } else {
      mapViewerRef.value.disableMapClick();
    }
  }
};

// 添加路线节点（手动输入模式）
const addRoutePoint = () => {
  showAddNodeDialog.value = true;
  nodeForm.name = '';
  nodeForm.longitude = '';
  nodeForm.latitude = '';
};

// 处理地图点击事件
const handleMapClick = (coordinates: { longitude: number, latitude: number }) => {
  if (nodeInputMode.value !== 'map-click' || readonly.value) return;
  
  // 保存点击的坐标
  pendingMapNode.value = { longitude: coordinates.longitude, latitude: coordinates.latitude };
  
  // 显示节点名称输入弹窗
  showMapNodeNameDialog.value = true;
  mapNodeName.value = '';
};

// 确认地图点击添加的节点
const confirmMapNode = () => {
  if (!mapNodeName.value.trim()) {
    ElMessage.warning('请输入节点名称');
    return;
  }
  
  if (!pendingMapNode.value) {
    ElMessage.error('坐标信息丢失，请重新点击地图');
    return;
  }
  
  const newNode: RouteNode = {
    id: Date.now().toString(),
    name: mapNodeName.value.trim(),
    longitude: pendingMapNode.value.longitude,
    latitude: pendingMapNode.value.latitude
  };
  
  routeNodes.value.push(newNode);
  
  // 添加到地图
  if (mapViewerRef.value) {
    mapViewerRef.value.addNodeToMap(newNode);
    flyToNodesBounds();
  }
  
  // 清理临时数据
  pendingMapNode.value = null;
  showMapNodeNameDialog.value = false;
  mapNodeName.value = '';
  
  ElMessage.success('节点添加成功');
};

// 取消地图点击添加节点
const cancelMapNode = () => {
  pendingMapNode.value = null;
  showMapNodeNameDialog.value = false;
  mapNodeName.value = '';
};

// 确认添加节点
const confirmAddNode = () => {
  if (!nodeForm.name || !nodeForm.longitude || !nodeForm.latitude) {
    ElMessage.warning('请填写完整的节点信息');
    return;
  }
  
  const newNode: RouteNode = {
    id: Date.now().toString(),
    name: nodeForm.name,
    longitude: parseFloat(nodeForm.longitude),
    latitude: parseFloat(nodeForm.latitude)
  };
  
  routeNodes.value.push(newNode);
  
  // 添加到地图
  if (mapViewerRef.value) {
    mapViewerRef.value.addNodeToMap(newNode);
    flyToNodesBounds();
  }
  
  showAddNodeDialog.value = false;
  ElMessage.success('节点添加成功');
};

// 删除节点
const removeRouteNode = (index: number) => {
  routeNodes.value.splice(index, 1);
  
  // 从地图删除并重新计算距离
  if (mapViewerRef.value) {
    mapViewerRef.value.removeNodeFromMap(index);
    mapViewerRef.value.recalculateDistance();
    flyToNodesBounds();
  }
  
  ElMessage.success('节点删除成功');
};

// 计算节点包围盒并定位
const flyToNodesBounds = () => {
  if (mapViewerRef.value && mapViewerRef.value.flyToAllNodes) {
    mapViewerRef.value.flyToAllNodes();
  }
};

// 距离计算回调
const onDistanceCalculated = (distance: number) => {
  totalDistance.value = distance;
};

// 面积计算回调
const onAreaCalculated = (area: number, areaType?: string) => {
  if (areaType === 'circle') {
    circleArea.value = area;
    hasDrawnCircle.value = true;
    if (routeType.value === 'circle') {
      totalArea.value = area;
    }
  } else if (areaType === 'rectangle') {
    rectangleArea.value = area;
    hasDrawnRectangle.value = true;
    if (routeType.value === 'rectangle') {
      totalArea.value = area;
    }
  }
};

// 显示圆形区域
const showCircleArea = () => {
  if (!areaForm.circle.centerLng || !areaForm.circle.centerLat || !areaForm.circle.radius) {
    ElMessage.warning('请填写完整的圆形区域信息');
    return;
  }
  
  const radius = parseFloat(areaForm.circle.radius);
  if (radius <= 0) {
    ElMessage.warning('半径必须大于0');
    return;
  }
  
  if (mapViewerRef.value) {
    mapViewerRef.value.drawCircleArea(
      parseFloat(areaForm.circle.centerLng),
      parseFloat(areaForm.circle.centerLat),
      radius
    );
  }
};

// 显示矩形区域
const showRectangleArea = () => {
  if (!areaForm.rectangle.topLeftLng || !areaForm.rectangle.topLeftLat || 
      !areaForm.rectangle.bottomRightLng || !areaForm.rectangle.bottomRightLat) {
    ElMessage.warning('请填写完整的矩形区域信息');
    return;
  }
  
  const topLeftLng = parseFloat(areaForm.rectangle.topLeftLng);
  const topLeftLat = parseFloat(areaForm.rectangle.topLeftLat);
  const bottomRightLng = parseFloat(areaForm.rectangle.bottomRightLng);
  const bottomRightLat = parseFloat(areaForm.rectangle.bottomRightLat);
  
  // 验证坐标
  if (topLeftLng === bottomRightLng || topLeftLat === bottomRightLat) {
    ElMessage.warning('请检查坐标输入');
    return;
  }
  
  if (topLeftLng >= bottomRightLng || topLeftLat <= bottomRightLat) {
    ElMessage.warning('请检查坐标范围');
    return;
  }
  
  if (mapViewerRef.value) {
    mapViewerRef.value.drawRectangleArea(topLeftLng, topLeftLat, bottomRightLng, bottomRightLat);
  }
};

// 监听路线类型变化
const handleRouteTypeChange = () => {
  if (readonly.value) return;
  
  if (mapViewerRef.value) {
    mapViewerRef.value.clearAreas();
  }
  
  circleArea.value = 0;
  rectangleArea.value = 0;
  totalArea.value = 0;
  hasDrawnCircle.value = false;
  hasDrawnRectangle.value = false;
  
  areaForm.circle = { centerLng: '', centerLat: '', radius: '' };
  areaForm.rectangle = { topLeftLng: '', topLeftLat: '', bottomRightLng: '', bottomRightLat: '' };
};

// 重置圆形区域
const resetCircleArea = () => {
  areaForm.circle = { centerLng: '', centerLat: '', radius: '' };
  circleArea.value = 0;
  totalArea.value = 0;
  hasDrawnCircle.value = false;
  
  if (mapViewerRef.value) {
    mapViewerRef.value.clearCircleArea();
  }
};

// 重置矩形区域
const resetRectangleArea = () => {
  areaForm.rectangle = { topLeftLng: '', topLeftLat: '', bottomRightLng: '', bottomRightLat: '' };
  rectangleArea.value = 0;
  totalArea.value = 0;
  hasDrawnRectangle.value = false;
  
  if (mapViewerRef.value) {
    mapViewerRef.value.clearRectangleArea();
  }
};

// 地图截图函数
const captureMapScreenshot = async () => {
  try {
    if (mapViewerRef.value && mapViewerRef.value.captureScreenshot) {
      const base64 = await mapViewerRef.value.captureScreenshot();
      mapScreenshotBase64.value = base64;
    }
  } catch (error) {
    console.error('地图截图失败:', error);
  }
};

// 步骤验证函数
const validateStep = (step: number): boolean => {
  if (step === 0) {
    if (selectedMethod.value === 'draw') {
      if (routeNodes.value.length < 2) {
        ElMessage.warning('添加节点模式至少需要两个节点才能进入下一步');
        return false;
      }
    } else if (selectedMethod.value === 'area') {
      if (routeType.value === 'circle' && !hasDrawnCircle.value) {
        ElMessage.warning('请先绘制至少一个圆形区域');
        return false;
      } else if (routeType.value === 'rectangle' && !hasDrawnRectangle.value) {
        ElMessage.warning('请先绘制至少一个矩形区域');
        return false;
      }
    }
  }
  return true;
};

// 步骤操作
const nextStep = async () => {
  if (!validateStep(currentStep.value)) {
    return;
  }
  
  if (currentStep.value === 0) {
    await captureMapScreenshot();
    currentStep.value++;
  } else if (currentStep.value === 1) {
    try {
      await routeFormRef.value.validate();
      currentStep.value++;
    } catch (error) {
      console.log('表单验证失败');
    }
  } else {
    currentStep.value++;
  }
};

const prevStep = () => {
  currentStep.value--;
};

// 完成创建/保存编辑
const finishCreate = async () => {
  try {
    const submitData: PatrolRoute = {
      routeName: routeForm.routeName,
      belongReservoirId: getReservoirIdByName(routeForm.reservoir),
      type: selectedMethod.value === 'draw'?'1':'2',
      routeType: routeForm.routeType,
      status: 'T',
      isDraft: 'F',
      remarks: routeForm.remarks,
      file: mapScreenshotBase64.value
    };
    
    // 如果是编辑模式，传入ID
    if (props.mode === 'edit' && editingRouteId.value) {
      submitData.id = editingRouteId.value;
    }
    
    if (selectedMethod.value === 'draw' && routeNodes.value.length > 0) {
      const nodeStrings = routeNodes.value.map(node => 
        `${node.longitude},${node.latitude},${node.name}`
      );
      
      submitData.patrolRouteNodeConfigDTO = {
        startPoint: nodeStrings.length > 0 ? `${routeNodes.value[0].longitude},${routeNodes.value[0].latitude}` : '',
        endNode: nodeStrings.length > 0 ? `${routeNodes.value[routeNodes.value.length - 1].longitude},${routeNodes.value[routeNodes.value.length - 1].latitude}` : '',
        node: nodeStrings.join(';'),
        distance: totalDistance.value
      };
      
      // 编辑模式下添加id属性
      if (props.mode === 'edit' && editingNodeConfigId.value) {
        submitData.patrolRouteNodeConfigDTO.id = editingNodeConfigId.value;
      }
    } else if (selectedMethod.value === 'area') {
      if (routeType.value === 'circle' && areaForm.circle.centerLng && areaForm.circle.centerLat && areaForm.circle.radius) {
        submitData.patrolRouteDrawAreaConfigDTO = {
          areaType: '1',
          lonLat: `${areaForm.circle.centerLng},${areaForm.circle.centerLat}`,
          radius: parseFloat(areaForm.circle.radius)
        };
      } else if (routeType.value === 'rectangle' && areaForm.rectangle.topLeftLng && areaForm.rectangle.topLeftLat && 
                 areaForm.rectangle.bottomRightLng && areaForm.rectangle.bottomRightLat) {
        submitData.patrolRouteDrawAreaConfigDTO = {
          areaType: '2',
          leftLonLat: `${areaForm.rectangle.topLeftLng},${areaForm.rectangle.topLeftLat}`,
          rightLonLat: `${areaForm.rectangle.bottomRightLng},${areaForm.rectangle.bottomRightLat}`
        };
      }
    }
    
    await savePatrolRoute(submitData);
    
    const successMessage = props.mode === 'edit' ? '路线保存成功！' : '路线创建成功！';
    ElMessage.success(successMessage);
    emit('success', successMessage);
    handleClose();
  } catch (error) {
    console.error('保存路线失败:', error);
    ElMessage.error('保存路线失败，请重试');
  }
};

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false);
};

// 辅助函数
const getRouteTypeText = (routeType: string) => {
  const typeMap: Record<string, string> = {
    '1': '日常巡检',
    '2': '年度巡检',
    '3': '特殊巡检',
    '4': '维修',
    '5': '保养'
  };
  return typeMap[routeType] || routeType || '-';
};

const getMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    'draw': '添加节点',
    'area': '绘制区域',
    'import': '导入数据'
  };
  return methodMap[method] || method || '-';
};
</script>

<style lang="scss" scoped>
// 创建路线弹窗样式
.create-route-container {
  .step-content {
    margin: 30px 0;
    min-height: 400px;

    h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .step-1 {
      .route-method {
        margin-bottom: 30px;

        .method-label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
          color: #333;
        }

        .method-options {
          display: flex;
          gap: 15px;

          .method-card {
            padding: 20px;
            border: 2px solid #e4e7ed;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            flex: 1;

            &:hover {
              border-color: #409eff;
            }

            &.active {
              border-color: #409eff;
              background-color: #ecf5ff;
              color: #409eff;
            }

            .el-icon {
              font-size: 24px;
              margin-bottom: 8px;
              display: block;
            }
          }
        }
      }

      .route-config {
        display: flex;
        gap: 30px;

        .config-panel {
          flex: 1;
          min-width: 300px;

          .config-section {
            margin-bottom: 20px;
          }

          .route-points {
            margin-bottom: 20px;

            h4 {
              margin-bottom: 15px;
              color: #333;
            }
            
            .empty-nodes {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 30px;
              background-color: #fafafa;
              border: 1px dashed #d9d9d9;
              border-radius: 6px;
              color: #999;
              margin-bottom: 15px;
              
              .el-icon {
                font-size: 32px;
                margin-bottom: 10px;
              }
              
              span {
                font-size: 14px;
              }
            }

            .point-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 10px;
              padding: 8px;
              background-color: #f5f7fa;
              border-radius: 4px;
            }

            .point-controls {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              padding: 8px 12px;
              background-color: #f5f7fa;
              border-radius: 4px;
              
              .coordinates {
                font-size: 12px;
                color: #666;
                margin-left: auto;
                margin-right: 8px;
              }
            }
          }

          .route-stats {
            .stat-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 10px;

              .el-icon {
                color: #409eff;
              }

              strong {
                margin-left: auto;
                color: #333;
              }
            }
          }
        }

        .map-container {
          flex: 2;
          height: 400px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
        }
      }
    }

    .step-2 {
      max-width: 600px;
      margin: 0 auto;
    }

    .step-3 {
      text-align: center;

      .confirm-content {
        .route-summary {
          display: flex;
          gap: 30px;
          text-align: left;

          .summary-card {
            flex: 1;
            padding: 20px;
            background-color: #f5f7fa;
            border-radius: 8px;

            h4 {
              margin-bottom: 20px;
              color: #333;
              font-size: 18px;
              font-weight: 600;
              padding-bottom: 10px;
              border-bottom: 2px solid #409eff;
            }

            .summary-info {
              margin-bottom: 20px;

              .info-section {
                margin-bottom: 20px;

                h5 {
                  color: #409eff;
                  font-size: 14px;
                  font-weight: 600;
                  margin-bottom: 10px;
                  display: flex;
                  align-items: center;
                  
                  &:before {
                    content: '';
                    width: 3px;
                    height: 14px;
                    background-color: #409eff;
                    margin-right: 8px;
                    border-radius: 2px;
                  }
                }

                .detail-item {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                  padding: 8px 12px;
                  background-color: #fff;
                  border-radius: 4px;
                  font-size: 14px;
                  border-left: 3px solid #e4e7ed;
                  transition: border-color 0.3s;

                  &:hover {
                    border-left-color: #409eff;
                  }

                  span:first-child {
                    color: #666;
                    font-weight: 500;
                  }

                  span:last-child {
                    color: #333;
                    font-weight: 400;
                  }
                }

                .remarks-content {
                  font-size: 14px;
                  color: #666;
                  background-color: #fff;
                  padding: 12px;
                  border-radius: 4px;
                  border-left: 3px solid #e4e7ed;
                  line-height: 1.6;
                }
              }
            }
          }

          .route-preview-large {
            flex: 1;

            h5 {
              color: #409eff;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              
              &:before {
                content: '';
                width: 3px;
                height: 14px;
                background-color: #409eff;
                margin-right: 8px;
                border-radius: 2px;
              }
            }

            .map-preview-container {
              height: 350px;
              background-color: #fff;
              border: 2px solid #e4e7ed;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              overflow: hidden;

              .map-preview-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 6px;
              }

              .map-placeholder-summary {
                color: #999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                .el-icon {
                  font-size: 48px;
                  margin-bottom: 15px;
                }

                span {
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
    }
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
    
    .step-actions-right {
      display: flex;
      gap: 15px;
    }
  }

  .readonly-actions {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }
}

// 绘制区域样式
.area-config {
  display: flex;
  gap: 30px;

  .config-panel {
    flex: 1;
    min-width: 300px;

    .route-type-selector {
      margin-bottom: 20px;
    }

    .circle-config,
    .rectangle-config {
      .config-row {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        gap: 10px;

        label {
          min-width: 60px;
          font-weight: 500;
          color: #333;
        }

        .radius-input {
          display: flex;
          align-items: center;
          gap: 8px;

          span {
            color: #666;
            font-size: 14px;
          }
        }

        .area-display {
          font-weight: bold;
          color: #409eff;
        }
      }

      .config-section {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 6px;

        h5 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 14px;
        }
      }

      .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: #333;
      }
    }
  }

  .map-container {
    flex: 2;
    height: 400px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>