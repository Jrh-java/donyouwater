<template>
  <div class="viewer-header">
    <div class="header-left">
      <span class="title">闽江流域东游段智慧管理平台</span>
    </div>
    <div class="header-center">
      <div
        :class="['nav-button', { active: activePanel === 'mainViewer' }]"
        @click="handleSwitch('mainViewer')"
      >
        态势总览
      </div>
      <div
        :class="['nav-button', { active: activePanel === 'monitor' }]"
        @click="handleSwitch('monitor')"
      >
        监测告警
      </div>
      <div class="nav-button" @click="goToDashboard">
        进入系统
      </div>
    </div>
    <div class="header-right">
   
      <Calendar />
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Calendar from './Calendar.vue';
import { useStore } from '../../store/pinia';

const emit = defineEmits(['switch-panel']);
const router = useRouter();
const store = useStore();

const activePanel = ref('mainViewer'); // Default to '态势总览'
const currentTime = ref('');
let timerId = null;

const handleSwitch = (panelType) => {
  activePanel.value = panelType;
  store.setActivePanel(panelType);
  emit('switch-panel', panelType);
};

const goToDashboard = () => {
  console.log('header.vue: 准备跳转到 dashboard')
  console.log('当前登录状态:', store.isLoggedIn)
  console.log('当前token:', store.token)
  console.log('localStorage中的登录状态:', localStorage.getItem('isLoggedIn'))
  console.log('localStorage中的token:', localStorage.getItem('authToken'))
  router.push('/main/dashboard')
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
};

onMounted(() => {
  updateTime();
  timerId = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>

<style scoped>
.viewer-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px; /* Adjust height as needed */
  background-image: url('@/assets/viewer/title.png');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribute space */
  z-index: 1001;
  padding: 0 20px;
  box-sizing: border-box;
}

.header-left {
  flex-shrink: 0; /* Prevent shrinking */
}

.title {
  font-size: 20px; /* Adjust size as needed */
  font-weight: bold;
}

.header-center {
  display: flex;
  justify-content: left;
  flex-grow: 1; /* Allow center to take available space */
  padding-left: 290px;
    padding-top: 50px;

}

.nav-button {
  background-image: url('@/assets/viewer/btn.png');
  background-color: transparent;
  background-size: cover;
  background-position: center;
  color: white;
  border: none;
  padding: 10px 10px; /* Adjust padding */
  margin: 0 10px;
  cursor: pointer;
  font-size: 18px; /* Adjust size */
  transition: color 0.3s;
  width:160px;
  height: 30px;
}

.nav-button.active {
  background-image: url('@/assets/viewer/btn-active.png');
  background-size: cover;
  background-position: center;
  color: #40a9ff; /* Blue color for active state */
  font-weight: bold;
}

.nav-button:hover {
  color: #69c0ff; /* Lighter blue for hover, or keep white if preferred */
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking */
  margin-top: 15px;
}

.current-time {
  font-size: 14px; /* Adjust size */
  margin-right: 20px; /* Space between time and button */
}

.system-entry-button-header {
  background-image: url('@/assets/viewer/height-bg-blue.png');
  background-color: transparent; /* Style similar to original button */
  background-size: cover;
  background-position: center;
  color: white;
  border: none;
  padding: 8px 15px; /* Adjust padding */
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; /* Adjust size */
  transition: background-color 0.3s;
}

.system-entry-button-header:hover {
  background-color: #40a9ff;
}
</style>