<template>
  <div class="dam-detail-modal-backdrop" v-if="show" @click.self="closeModal">
    <div class="dam-detail-modal-content">
      <div class="modal-header">
        <h3>{{ damDetail?.damName }}</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body" v-if="damDetail">
        <div class="top-section">
          <img :src="damDetail.image" alt="水库图片" class="dam-image">
          <div class="dam-summary-info">
            <p><strong>流域规模：</strong>{{ damDetail.scale }}</p>
            <p><strong>结构类型：</strong>{{ damDetail.structureType }}</p>
            <p><strong>安全等级：</strong><span class="safety-level" :class="'level-' + damDetail.safetyLevel.toLowerCase()">{{ damDetail.safetyLevel }}</span></p>
            <p><strong>建成时间：</strong>{{ damDetail.builtTime }}</p>
            <p><strong>使用年限：</strong>{{ damDetail.serviceLife }}</p>
          </div>
        </div>

        <div class="tab-navigation">
          <button 
            :class="{ active: currentTab === 'basic' }" 
            @click="currentTab = 'basic'"
          >
            基础信息
          </button>
          <button 
            :class="{ active: currentTab === 'realScene' }" 
            @click="currentTab = 'realScene'"
          >
            实景图
          </button>
          <!-- <button 
            :class="{ active: currentTab === 'gateControl' }" 
            @click="currentTab = 'gateControl'"
          >
            闸门管理
          </button> -->
        </div>

        <div class="tab-content">
          <div v-if="currentTab === 'basic'" class="basic-info-tab">
            <div class="dam-introduction">
              <h4>{{ damDetail.damName }}：</h4>
              <p>{{ damDetail.introduction }}</p>
            </div>
            <div class="dam-parameters">
              <div class="param-item" v-for="(value, key) in damDetail.parameters" :key="key">
                <span class="param-label">{{ key }}</span>
                <span class="param-value">{{ value }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="currentTab === 'realScene'" class="real-scene-tab">
            <div v-if="allImages.length === 0" class="no-images">
              <p>暂无实景图</p>
            </div>
            <div v-else class="image-gallery">
              <div class="main-image-container">
                <img :src="allImages[currentImageIndex]?.url" :alt="`实景图${currentImageIndex + 1}`" class="main-gallery-image">
                <button v-if="allImages.length > 1" class="nav-btn prev-btn" @click="prevImage">
                  <span>‹</span>
                </button>
                <button v-if="allImages.length > 1" class="nav-btn next-btn" @click="nextImage">
                  <span>›</span>
                </button>
                <div class="image-counter">{{ currentImageIndex + 1 }} / {{ allImages.length }}</div>
              </div>
              <div v-if="allImages.length > 1" class="thumbnail-list">
                <div 
                  v-for="(image, index) in allImages" 
                  :key="index"
                  :class="['thumbnail', { active: index === currentImageIndex }]"
                  @click="currentImageIndex = index"
                >
                  <img :src="image.url" :alt="`缩略图${index + 1}`" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentTab === 'gateControl'" class="gate-control-tab">
            <div class="gate-status-section">
              <h4>闸门状态信息</h4>
              <div class="gate-status-container">
                <!-- 左侧状态信息 -->
                <div class="gate-status-info">
                  <div class="gate-status-grid">
                    <div class="status-item">
                      <span class="status-label">闸上水位</span>
                      <span class="status-value">2.0 米</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">闸下水位</span>
                      <span class="status-value">1.5 米</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">当前开度</span>
                      <span class="status-value">{{ gateOpening }} 米</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">闸门状态</span>
                      <span :class="['status-value', 'gate-status', gateStatus === '开启' ? 'status-open' : 'status-closed']">
                        {{ gateStatus }}
                      </span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">瞬时流量</span>
                      <span class="status-value">0.12 m³/s</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">累计流量</span>
                      <span class="status-value">1232 m³</span>
                    </div>
                  </div>
                </div>
                
                <!-- 右侧监控视频 -->
                <div class="gate-monitor-video">
                  <div class="video-container">
                    <div class="monitor-video" style="background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; border-radius: 4px;">
                      <div style="text-align: center; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                        <div style="font-size: 16px;">暂未接入视频设备</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="gate-control-section">
              <h4>闸门控制</h4>
              <div class="control-buttons">
                <button class="control-btn open-btn" @click="showConfirmationDialog('open')">开闸</button>
                <button class="control-btn close-btn" @click="showConfirmationDialog('close')">关闸</button>
                <button class="control-btn stop-btn" @click="showConfirmationDialog('stop')">停闸</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-else-if="loading" class="modal-body loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>正在加载...</p>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="modal-body empty-container">
        <div class="empty-content">
          <p>暂无数据</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="close-btn" @click="closeModal">关闭</button>
      </div>
    </div>
    
    <!-- 闸门控制确认对话框 -->
    <div class="confirmation-dialog-backdrop" v-if="confirmDialogVisible" @click.self="handleCancel">
      <div class="confirmation-dialog-content">
        <div class="dialog-header">
          <h3>{{ confirmDialogTitle }}</h3>
          <button class="close-button" @click="handleCancel">×</button>
        </div>
        <div class="dialog-body">
          <div style="margin-bottom: 15px;">
            <p>为防止出现误操作，需要进行二次确认，请在下方输入正确的计算结果：</p>
            <p><strong v-html="mathProblem.question" style="font-size: 24px;"></strong></p>
          </div>
          <input v-model="userAnswer" placeholder="请输入答案" @keyup.enter="handleConfirm" class="answer-input">
        </div>
        <div class="dialog-footer">
          <button @click="handleCancel" class="cancel-btn">取消</button>
          <button @click="handleConfirm" class="confirm-btn">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getReservoirDetail, getPresignedObjectUrl } from '@/api/reservoir';
import { ElMessage } from 'element-plus';

interface DamParameters {
  [key: string]: string;
}

interface DamDetail {
  id: string;
  damName: string;
  image: string;
  scale: string;
  structureType: string;
  safetyLevel: string;
  builtTime: string;
  serviceLife: string;
  introduction: string;
  parameters: DamParameters;
}

// Props
const props = defineProps<{
  damId: string | null; // 接收 damId，可以为 null
  show: boolean;
}>();

// Emit
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'navigateToMonitor', damId: string): void; // 新增事件，用于导航到监测告警页面
}>();

// 水库详情数据
const damDetail = ref<DamDetail | null>(null);
const currentTab = ref('basic'); // 默认显示基础信息

// 图片相关变量
const allImages = ref<Array<{url: string, name: string}>>([]);
const currentImageIndex = ref(0);

// 闸门控制相关变量
const gateOpening = ref('0.5');
const gateStatus = ref('开启'); // 可能的值: 开启, 关闭

// 确认对话框相关变量
const confirmDialogVisible = ref(false);
const userAnswer = ref('');
const currentAction = ref(''); // 'open', 'close', 'stop'
const mathProblem = ref({ num1: 0, num2: 0, operator: '+', answer: 0, question: '' });
const confirmDialogTitle = ref('');

// 加载状态
const loading = ref(false);

// 关闭弹窗
const closeModal = () => {
  // 重置所有数据状态
  resetModalData();
  emit('close');
};

// 重置弹窗数据
const resetModalData = () => {
  damDetail.value = null;
  allImages.value = [];
  currentImageIndex.value = 0;
  currentTab.value = 'basic';
  loading.value = false; // 重置加载状态
  
  // 重置闸门控制状态
  gateOpening.value = '0.5';
  gateStatus.value = '开启';
  
  // 重置确认对话框状态
  confirmDialogVisible.value = false;
  userAnswer.value = '';
  currentAction.value = '';
  confirmDialogTitle.value = '';
};

// 图片切换方法
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = allImages.value.length - 1;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < allImages.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

// 生成数学验证题
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const isAddition = Math.random() > 0.5;
  let question = '';
  let answer = 0;

  if (isAddition) {
    question = `${num1} + ${num2} = ?`;
    answer = num1 + num2;
    mathProblem.value = { num1, num2, operator: '+', answer, question };
  } else {
    if (num1 < num2) {
      question = `${num2} - ${num1} = ?`;
      answer = num2 - num1;
    } else {
      question = `${num1} - ${num2} = ?`;
      answer = num1 - num2;
    }
    mathProblem.value = { num1: Math.max(num1, num2), num2: Math.min(num1, num2), operator: '-', answer, question };
  }
};

// 显示确认对话框
const showConfirmationDialog = (action: string) => {
  currentAction.value = action;
  const actionMap: { [key: string]: string } = {
    'open': '确认开闸',
    'close': '确认关闸',
    'stop': '确认停闸'
  };
  confirmDialogTitle.value = actionMap[action] || '确认操作';
  generateMathProblem();
  userAnswer.value = '';
  confirmDialogVisible.value = true;
};

// 处理确认操作
const handleConfirm = () => {
  if (userAnswer.value === null || userAnswer.value.trim() === '') {
    ElMessage.warning('请输入答案！');
    return;
  }
  if (parseInt(userAnswer.value, 10) === mathProblem.value.answer) {
    confirmDialogVisible.value = false;
    executeGateAction(currentAction.value);
    const actionMsg = currentAction.value === 'open' ? '开启' : 
                     currentAction.value === 'close' ? '关闭' : '停止';
    ElMessage.success(`闸门已${actionMsg}!`);
  } else {
    ElMessage.error('答案错误，请重试！');
    generateMathProblem();
    userAnswer.value = '';
  }
};

// 处理取消操作
const handleCancel = () => {
  confirmDialogVisible.value = false;
  ElMessage.info('操作已取消');
};

// 执行闸门操作
const executeGateAction = (action: string) => {
  console.log(`执行${action}逻辑...`);
  if (action === 'open') {
    gateStatus.value = '开启';
  } else if (action === 'close') {
    gateStatus.value = '关闭';
  } else if (action === 'stop') {
    gateStatus.value = '停止';
  }
};

// 模拟获取水库详情
const fetchDamDetail = async (id: string) => {
  console.log('获取水库详情 ID:', id);
  
  // 立即清空当前数据，确保不显示旧数据
  damDetail.value = null;
  allImages.value = [];
  currentImageIndex.value = 0;
  loading.value = true; // 开始加载
  
  try {
    // 调用真实的API接口
    const response = await getReservoirDetail({ id });
    const data = response.data || response; // 处理response.data或直接使用response
    
    // 处理图片URL
    let imageUrl = '/src/assets/viewer/actually.jpg'; // 默认图片
    const processedImages: Array<{url: string, name: string}> = [];
    
    if (data.reservoirFilePicInfoVOS && data.reservoirFilePicInfoVOS.length > 0) {
      for (let i = 0; i < data.reservoirFilePicInfoVOS.length; i++) {
        const imageInfo = data.reservoirFilePicInfoVOS[i];
        if (imageInfo.file) {
          try {
            // 解析file字段：格式为 "rervoir,1927198876173078528"
            const [bucket, objectName] = imageInfo.file.split(',');
            const presignedUrl = await getPresignedObjectUrl({
              bucket: bucket,
              objectName: objectName,
              expires: 3600
            });
            if (presignedUrl) {
              const url = presignedUrl.data || presignedUrl;
              processedImages.push({
                url: url,
                name: `实景图${i + 1}`
              });
              
              // 第一张图片作为主图片
              if (i === 0) {
                imageUrl = url;
              }
            }
          } catch (error) {
            console.error(`获取图片${i + 1}预签名URL失败:`, error);
          }
        }
      }
    }

    // 设置所有图片数据
    allImages.value = processedImages;
    currentImageIndex.value = 0;

    // 映射API数据到组件数据格式
    const detailData: DamDetail = {
      id: data.id,
      damName: data.reservoirName || 'AAA水库大坝',
      image: imageUrl,
      scale: getDamScale(data.reservoirType),
      structureType: data.reservoirDamInfoVO?.mainDamTypeStructure || '碾压型混凝土拱坝',
      safetyLevel: 'A级', // API中没有安全等级字段，使用默认值
      builtTime: formatDate(data.websiteCrtTime),
      serviceLife: calculateServiceLife(data.websiteCrtTime),
      introduction: data.remarks || '这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍',
      parameters: buildParameters(data)
    };
    
    damDetail.value = detailData;
    currentTab.value = 'basic'; // 每次打开重置到基础信息tab
    
  } catch (error) {
    console.error('获取水库详情失败:', error);
    
    // 如果API调用失败，使用默认数据作为兜底
    const defaultData: DamDetail = {
      id: id,
      damName: 'AAA水库大坝',
      image: '/src/assets/viewer/actually.jpg',
      scale: '大型水库大坝',
      structureType: '碾压型混凝土拱坝',
      safetyLevel: 'A级',
      builtTime: '2018年6月',
      serviceLife: '4年',
      introduction: '这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍这里是水库大坝介绍',
      parameters: {
        '水库库容': '360.3万立方米',
        '坝长': '255米',
        '坝高': '49.5米',
        '责任人': '张三',
        '联系人': '李四',
        '联系电话': '13826530295',
      },
    };
    damDetail.value = defaultData;
  } finally {
    loading.value = false; // 结束加载
  }
};

// 辅助函数：获取大坝规模
const getDamScale = (reservoirType: string): string => {
  const scaleMap: { [key: string]: string } = {
    'large_type_1': '大型',
    'large_type_2': '大型',
    'middle_type': '中型',
    'small_type_1': '小型',
    'small_type_2': '小型',

  };
  return scaleMap[reservoirType] || '大型水库大坝';
};

// 辅助函数：格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '2018年6月';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}年${month}月`;
  } catch (error) {
    return '2018年6月';
  }
};

// 辅助函数：计算使用年限
const calculateServiceLife = (buildTime: string): string => {
  if (!buildTime) return '4年';
  
  try {
    const buildDate = new Date(buildTime);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - buildDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return `${diffYears}年`;
  } catch (error) {
    return '4年';
  }
};

// 辅助函数：构建参数对象
const buildParameters = (data: any): DamParameters => {
  const parameters: DamParameters = {};
  
  // 从特征值信息中提取参数
  if (data.reservoirEigenvalueInfoVO) {
    const eigenInfo = data.reservoirEigenvalueInfoVO;
    if (eigenInfo.totalStorageCapacity) {
      parameters['总库容'] = `${eigenInfo.totalStorageCapacity}万立方米`;
    }
    if (eigenInfo.deadStorageCapacity) {
      parameters['死库容'] = `${eigenInfo.deadStorageCapacity}万立方米`;
    }
    if (eigenInfo.utilizableCapacity) {
      parameters['兴利库容'] = `${eigenInfo.utilizableCapacity}万立方米`;
    }
    if (eigenInfo.normalStorageLevel) {
      parameters['正常蓄水位'] = `${eigenInfo.normalStorageLevel}米`;
    }
  }
  
  // 从大坝信息中提取参数
  if (data.reservoirDamInfoVO) {
    const damInfo = data.reservoirDamInfoVO;
    if (damInfo.mainDamLength) {
      parameters['坝长'] = `${damInfo.mainDamLength}米`;
    }
    if (damInfo.mainDamHeight) {
      parameters['坝高'] = `${damInfo.mainDamHeight}米`;
    }
  }
  
  // 基本信息中的责任人
  if (data.administrativeResponsiblePerson) {
    parameters['行政责任人'] = data.administrativeResponsiblePerson;
  }
  if (data.technicalResponsiblePerson) {
    parameters['技术责任人'] = data.technicalResponsiblePerson;
  }
  if (data.patrolResponsiblePerson) {
    parameters['巡查责任人'] = data.patrolResponsiblePerson;
  }
  
  // 如果没有足够的数据，提供默认值
  if (Object.keys(parameters).length === 0) {
    return {
      '水库库容': '360.3万立方米',
      '坝长': '255米',
      '坝高': '49.5米',
      '责任人': '张三',
      '联系人': '李四',
      '联系电话': '13826530295',
    };
  }
  
  return parameters;
};

// 监听ID变化，重新加载数据
watch(() => props.damId, (newId) => {
  if (newId && props.show) { // 确保弹窗显示时才加载
    // 立即清空旧数据
    resetModalData();
    fetchDamDetail(newId);
  }
});

// 监听弹窗显示状态，如果显示且有damId，则加载数据
watch(() => props.show, (newShowState) => {
  if (newShowState && props.damId) {
    // 立即清空旧数据
    resetModalData();
    fetchDamDetail(props.damId);
  } else if (!newShowState) {
    // 弹窗关闭时重置数据
    resetModalData();
  }
});

onMounted(() => {
  // 如果初始时 show 为 true 并且有 damId，则加载数据
  if (props.show && props.damId) {
    // 立即清空旧数据
    resetModalData();
    fetchDamDetail(props.damId);
  }
});

</script>

<style scoped>
.dam-detail-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* 深色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.dam-detail-modal-content {
  background-color: #0B1B33; /* 深蓝背景，与图片风格一致 */
  border: 1px solid #1E3F66;
  border-radius: 8px;
  width: 90%;
  max-width: 900px; /* 适当调大宽度 */
  max-height: 90vh;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px; /* 调整内边距 */
  border-bottom: 1px solid #1E3F66;
  background: linear-gradient(to right, #102A4E, #0B1B33); /* 渐变头部背景 */
}

.modal-header h3 {
  margin: 0;
  color: #00CFFF; /* 科技蓝标题 */
  font-size: 20px; /* 稍大字体 */
  font-weight: bold;
}

.close-button {
  background: transparent;
  border: none;
  color: #00CFFF;
  font-size: 28px;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px; /* 调整内边距 */
}

.top-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 207, 255, 0.2);
}

.dam-image {
  width: 300px; /* 固定图片宽度 */
  height: auto;
  max-height: 200px; /* 限制最大高度 */
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #1E3F66;
}

.dam-summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around; /* 均匀分布信息 */
}

.dam-summary-info p {
  margin: 5px 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}
.dam-summary-info p strong {
  color: #00CFFF;
  margin-right: 8px;
  min-width: 80px; /* 固定标签宽度 */
  display: inline-block;
}

.safety-level {
  padding: 3px 8px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
}
.level-a级 { background-color: #4CAF50; } /* 绿色A级 */
.level-b级 { background-color: #FFA500; } /* 橙色B级 */
.level-c级 { background-color: #FF4444; } /* 红色C级 */


.tab-navigation {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 207, 255, 0.2);
  padding-bottom: 10px;
}

.tab-navigation button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  transition: color 0.3s, border-bottom-color 0.3s;
}

.tab-navigation button.active {
  color: #00CFFF;
  border-bottom-color: #00CFFF;
  font-weight: bold;
}

.monitor-warning-link {
  margin-left: auto;
  color: #00CFFF;
  text-decoration: none;
  font-size: 14px;
}
.monitor-warning-link:hover {
  text-decoration: underline;
}

.tab-content {
  /* Tab content styles */
}

.basic-info-tab {
  display: flex;
  gap: 25px; /* 左右两栏间距 */
}

.dam-introduction {
  flex: 1; /* 左侧占比较大空间 */
  background-color: rgba(0, 43, 82, 0.3); /* 淡蓝色背景 */
  padding: 15px;
  border-radius: 6px;
  line-height: 1.7;
}
.dam-introduction h4 {
  color: #00CFFF;
  margin-top: 0;
  margin-bottom: 10px;
}
.dam-introduction p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-align: justify;
}

.dam-parameters {
  flex-basis: 320px; /* 固定右侧宽度 */
  display: flex;
  flex-direction: column;
  gap: 0px; /* 参数项之间的间距 */
}

.param-item {
  display: flex;
  justify-content: space-between;
  background-color: rgba(0, 66, 102, 0.4); /* 参数项背景色 */
  padding: 12px 15px; /* 参数项内边距 */
  border-bottom: 1px solid rgba(0, 207, 255, 0.1);
  font-size: 14px;
}
.param-item:last-child {
  border-bottom: none;
}

.param-label {
  color: rgba(255, 255, 255, 0.7);
  flex-basis: 100px; /* 标签宽度 */
  text-align: left;
}

.param-value {
  color: white;
  font-weight: 500;
  text-align: right;
}

.real-scene-tab {
  min-height: 400px;
}

.no-images {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.6);
}

.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 207, 255, 0.3);
}

.main-gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.image-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 5px 0;
}

.thumbnail {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #00CFFF;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gate-control-tab {
  padding: 10px 0;
}

.gate-status-section,
.gate-control-section {
  margin-bottom: 25px;
}

.gate-status-section h4,
.gate-control-section h4 {
  color: #00CFFF;
  margin-bottom: 15px;
  font-size: 16px;
}

.gate-status-container {
  display: flex;
  gap: 20px;
}

.gate-status-info {
  flex: 1;
}

.gate-status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 15px;
  background-color: rgba(0, 66, 102, 0.4);
  border-radius: 6px;
  border-left: 3px solid #00CFFF;
}

.status-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.status-value {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.gate-status.status-open {
  color: #4CAF50;
}

.gate-status.status-closed {
  color: #FF4444;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.open-btn {
  background-color: #4CAF50;
  color: white;
}

.open-btn:hover {
  background-color: #45a049;
}

.close-btn {
  background-color: #FF4444;
  color: white;
}

.close-btn:hover {
  background-color: #e03e3e;
}

.stop-btn {
  background-color: #FFA500;
  color: white;
}

.stop-btn:hover {
  background-color: #e6940a;
}

.gate-monitor-video {
  flex: 1;
}

.gate-monitor-video h5 {
  color: #00CFFF;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
}

.video-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 207, 255, 0.3);
}

.monitor-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 主题色滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(0, 43, 82, 0.3);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00CFFF, #0088CC);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #66d9ff, #00aaff);
}

/* 通用滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 43, 82, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00CFFF, #0088CC);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #66d9ff, #00aaff);
}

::-webkit-scrollbar-corner {
  background: rgba(0, 43, 82, 0.3);
}

.confirmation-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
}

.confirmation-dialog-content {
  background-color: #0B1B33;
  border: 1px solid #1E3F66;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.confirmation-dialog-content .dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #1E3F66;
  background: linear-gradient(to right, #102A4E, #0B1B33);
}

.confirmation-dialog-content .dialog-header h3 {
  margin: 0;
  color: #00CFFF;
  font-size: 18px;
}

.confirmation-dialog-content .close-button {
  background: transparent;
  border: none;
  color: #00CFFF;
  font-size: 24px;
  cursor: pointer;
}

.confirmation-dialog-content .dialog-body {
  padding: 20px;
}

.confirmation-dialog-content .dialog-body p {
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
}

.answer-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #1E3F66;
  border-radius: 4px;
  background-color: rgba(0, 43, 82, 0.3);
  color: white;
  font-size: 14px;
}

.answer-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.confirmation-dialog-content .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #1E3F66;
  background-color: rgba(0, 43, 82, 0.4);
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s;
}

.cancel-btn {
  background-color: transparent;
  color: #00CFFF;
  border-color: #00CFFF;
}

.cancel-btn:hover {
  background-color: rgba(0, 207, 255, 0.1);
}

.confirm-btn {
  background-color: #00CFFF;
  color: #0B1B33;
  border-color: #00CFFF;
}

.confirm-btn:hover {
  background-color: #66d9ff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 25px; /* 调整内边距 */
  border-top: 1px solid #1E3F66;
  background-color: rgba(0, 43, 82, 0.4); /* 页脚背景 */
}

.close-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  background-color: transparent;
  color: #00CFFF;
  border: 1px solid #00CFFF;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: rgba(0, 207, 255, 0.1);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 207, 255, 0.3);
  border-top: 4px solid #00CFFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.empty-content {
  text-align: center;
}
button {
  outline: none; /* 移除默认的焦点边框 */
}
button:focus {
  outline: none; /* 移除默认的焦点边框 */
}
</style>