<template>
  <div class="gate-control-panel" v-if="show">
    <div class="panel-overlay" @click="$emit('close')"></div>
    <div class="panel-content">
      <div class="panel-header">
        <h3>{{ panelTitle || '闸门控制' }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="panel-body">
        <!-- 闸口信息显示 -->
        <div class="gate-port-info" style="margin: 20px 0;">
          <el-descriptions title="闸口信息" :column="1" border>
            <el-descriptions-item label="当前闸口">{{ gatePortName }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 闸门情况 -->
        <el-descriptions title="闸门情况" :column="2" border class="gate-status-info">
          <el-descriptions-item label="闸板开度">{{ currentGateInfo ? currentGateInfo.openingDegree : '0' }} %</el-descriptions-item>
          <el-descriptions-item label="闸板高度">{{ currentGateInfo ? currentGateInfo.gateHeight : '0' }} 米</el-descriptions-item>
          <el-descriptions-item label="闸门控制">
            <el-tag :type="currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? 'success' : 'warning'">
              {{ currentGateInfo && String(currentGateInfo.isHandle) === '0.0' ? '自动可远程' : '手动' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 闸门控制按钮 -->
        <div class="gate-controls" style="margin-top: 20px;">
          <el-button 
            type="primary" 
            @click="showConfirmationDialog('open')" 
            :disabled="!selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')"
          >
            开闸
          </el-button>
          <el-button 
            type="danger" 
            @click="showConfirmationDialog('close')" 
            :disabled="!selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')"
          >
            关闸
          </el-button>
          <el-button 
            type="warning" 
            @click="stopGate" 
            :disabled="!selectedGatePort || (currentGateInfo && String(currentGateInfo.isHandle) === '1.0')"
          >
            停闸
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 确认弹窗 -->
    <el-dialog
      :lockScroll="false"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="margin-bottom: 15px;">
        <p>为防止出现误操作，需要进行二次确认，请在下方输入正确的计算结果：</p>
        <p><strong v-html="mathProblem.question" style="font-size: 24px;"></strong></p>
      </div>
      <el-input v-model="userAnswer" placeholder="请输入答案" @keyup.enter="handleConfirm"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getGateExtInfo, gateOnOrOff } from '@/api/reservoir';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  panelTitle: {
    type: String,
    default: '闸门控制'
  },
  deviceCode: {
    type: String,
    default: ''
  },
  gateId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'animate-gate']);

// 闸门扩展信息
const gateExtInfo = ref(null);

// 当前选中闸口的闸门信息
const currentGateInfo = ref(null);

// 闸口信息
const selectedGatePort = ref('');
const gatePortName = ref('');

// 确认弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const userAnswer = ref('');
const mathProblem = ref({ question: '', answer: 0 });
const pendingAction = ref('');

// 生成数学题
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer;
  let question;
  
  switch (operator) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case '*':
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
  }
  
  mathProblem.value = { question, answer };
};

// 获取闸门扩展信息
const fetchGateExtendedInfo = async (deviceCode) => {
  if (!deviceCode) return;
  
  try {
    const extInfo = await getGateExtInfo(deviceCode);
    if (extInfo) {
      gateExtInfo.value = extInfo;
      console.log('获取到闸门扩展信息:', extInfo);
      
      // 根据设备编码确定闸口
      if (Array.isArray(extInfo)) {
        // 根据传入的gateId确定使用哪个闸口
        let targetGateInfo;
        if (props.gateId === 'glbModel-zhamen1-YN16220300000715') {
          // 闸门1，使用第一个闸口
          targetGateInfo = extInfo.find(item => !item.devpoint.includes('IRDA2')) || extInfo[0];
          gatePortName.value = '一号闸口';
        } else if (props.gateId === 'glbModel-zhamen2-YN16220300000715') {
          // 闸门2，使用第二个闸口
          targetGateInfo = extInfo.find(item => item.devpoint.includes('IRDA2')) || extInfo[1] || extInfo[0];
          gatePortName.value = '二号闸口';
        } else {
          // 默认使用第一个
          targetGateInfo = extInfo[0];
          gatePortName.value = '默认闸口';
        }
        
        if (targetGateInfo) {
          selectedGatePort.value = targetGateInfo.devpoint;
          currentGateInfo.value = targetGateInfo;
          console.log('自动选择闸口:', selectedGatePort.value, '信息:', targetGateInfo);
        }
      }
    }
  } catch (error) {
    console.error('获取闸门扩展信息失败:', error);
    ElMessage.error('获取闸门扩展信息失败');
  }
};

// 处理闸口选择变化
const handleGatePortChange = (selectedPort) => {
  if (!gateExtInfo.value || !Array.isArray(gateExtInfo.value)) {
    currentGateInfo.value = null;
    return;
  }
  
  // 根据选择的闸口找到对应的闸门信息
  const gateInfo = gateExtInfo.value.find(item => item.devpoint === selectedPort);
  if (gateInfo) {
    currentGateInfo.value = gateInfo;
    console.log('选择闸口:', selectedPort, '对应信息:', gateInfo);
  } else {
    currentGateInfo.value = null;
    console.warn('未找到对应闸口的信息:', selectedPort);
  }
};

// 显示确认弹窗
const showConfirmationDialog = (action) => {
  pendingAction.value = action;
  dialogTitle.value = action === 'open' ? '开闸确认' : '关闸确认';
  generateMathProblem();
  userAnswer.value = '';
  dialogVisible.value = true;
};

// 处理确认
const handleConfirm = async () => {
  if (parseInt(userAnswer.value) === mathProblem.value.answer) {
    dialogVisible.value = false;
    
    try {
      if (pendingAction.value === 'open') {
        await openGateLogic();
      } else {
        await closeGateLogic();
      }
    } catch (error) {
      console.error('闸门操作失败:', error);
      ElMessage.error(`${pendingAction.value === 'open' ? '开闸' : '关闸'}操作失败`);
    }
  } else {
    ElMessage.error('答案错误，请重新输入');
    userAnswer.value = '';
  }
};

// 开闸逻辑
const openGateLogic = async () => {
  console.log('执行开闸逻辑...');
  if (!props.deviceCode || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {

    
    // 执行开闸操作
    const openPayload = {
      devpoint: selectedGatePort.value,
      controlVal: '1' // 开阀
    };
    await gateOnOrOff(props.deviceCode, JSON.stringify(openPayload));
    ElMessage.success('开闸操作成功');
    // 关闭所有弹窗
    emit('close');
    // 执行开闸动画，传递闸门ID
    emit('animate-gate', { isOpening: true, gateId: props.gateId });
    // 重新获取闸门信息
    await fetchGateExtendedInfo(props.deviceCode);
  } catch (error) {
    console.error('开闸操作失败:', error);
    ElMessage.error('开闸操作失败');
  }
};

// 关闸逻辑
const closeGateLogic = async () => {
  console.log('执行关闸逻辑...');
  if (!props.deviceCode || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {

    
    // 等待一段时间确保停闸操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 执行关闸操作
    const closePayload = {
      devpoint: selectedGatePort.value,
      controlVal: '2' // 关阀
    };
    await gateOnOrOff(props.deviceCode, JSON.stringify(closePayload));
    ElMessage.success('关闸操作成功');
    // 关闭所有弹窗
    emit('close');
    // 执行关闸动画，传递闸门ID
    emit('animate-gate', { isOpening: false, gateId: props.gateId });
    // 重新获取闸门信息
    await fetchGateExtendedInfo(props.deviceCode);
  } catch (error) {
    console.error('关闸操作失败:', error);
    ElMessage.error('关闸操作失败');
  }
};

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false;
  userAnswer.value = '';
  pendingAction.value = '';
};

// 停闸操作
const stopGate = async () => {
  if (!props.deviceCode || !selectedGatePort.value) {
    ElMessage.error('缺少必要的控制参数');
    return;
  }
  
  try {
    const stopPayload = {
      devpoint: selectedGatePort.value,
      controlVal: '3' // 停止
    };
    await gateOnOrOff(props.deviceCode, JSON.stringify(stopPayload));
    ElMessage.success('停闸操作成功');
    // 关闭所有弹窗
    emit('close');
    // 停止闸门动画，传递闸门ID
    emit('animate-gate', { isOpening: null, gateId: props.gateId });
    // 重新获取闸门信息
    await fetchGateExtendedInfo(props.deviceCode);
  } catch (error) {
    console.error('停闸操作失败:', error);
    ElMessage.error('停闸操作失败');
  }
};

// 监听弹窗显示状态
watch(() => props.show, (newShow) => {
  if (newShow && props.deviceCode) {
    fetchGateExtendedInfo(props.deviceCode);
  }
});

// 监听设备编码变化
watch(() => props.deviceCode, (newDeviceCode) => {
  if (newDeviceCode && props.show) {
    fetchGateExtendedInfo(newDeviceCode);
  }
});
</script>

<style scoped>
.gate-control-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.panel-content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.panel-body {
  padding: 20px;
}

.gate-status-info {
  margin: 20px 0;
}

.gate-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.gate-controls .el-button {
  min-width: 80px;
}
</style>