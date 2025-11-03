<template>
  <div class="privilege-test-page">
    <h2>权限功能测试页面</h2>
    
    <!-- 用户信息显示 -->
    <div class="user-info">
      <h3>当前用户信息</h3>
      <p>管理员状态: {{ isAdmin ? '是' : '否' }}</p>
      <p>权限获取方式: 直接从 queryMenuTree 接口获取</p>
    </div>
    
    <!-- 权限说明 -->
    <div class="permission-info">
      <h3>权限机制说明</h3>
      <ul>
        <li>权限数据通过 <code>queryMenuTree</code> 接口实时获取</li>
        <li>不同用户获取到的菜单结构不同，实现个性化权限控制</li>
        <li>权限指令会自动缓存权限数据，避免重复请求</li>
        <li>管理员用户可以看到所有按钮</li>
        <li>普通用户只能看到有权限的按钮</li>
      </ul>
    </div>
    
    <!-- 权限测试按钮 -->
    <div class="privilege-test">
      <h3>权限控制测试</h3>
      
      <!-- 测试按钮：添加水库权限 -->
      <button 
        v-privilege="'reservoir:add'"
        class="test-btn add-reservoir"
        @click="handleAddReservoir"
      >
        添加水库 (需要 reservoir:add 权限)
      </button>
      
      <!-- 测试按钮：删除水库权限 -->
      <button 
        v-privilege="'reservoir:delete'"
        class="test-btn delete-reservoir"
        @click="handleDeleteReservoir"
      >
        删除水库 (需要 reservoir:delete 权限)
      </button>
      
      <!-- 测试按钮：编辑水库权限 -->
      <button 
        v-privilege="'reservoir:edit'"
        class="test-btn edit-reservoir"
        @click="handleEditReservoir"
      >
        编辑水库 (需要 reservoir:edit 权限)
      </button>
      
      <!-- 测试按钮：查看详情权限 -->
      <button 
        v-privilege="'reservoir:detail'"
        class="test-btn view-detail"
        @click="handleViewDetail"
      >
        查看详情 (需要 reservoir:detail 权限)
      </button>
      
      <!-- 测试按钮：系统管理权限 -->
      <button 
        v-privilege="'system:manage'"
        class="test-btn system-manage"
        @click="handleSystemManage"
      >
        系统管理 (需要 system:manage 权限)
      </button>
      
      <!-- 测试按钮：数组权限（满足其中任一即可） -->
      <button 
        v-privilege="['user:add', 'user:edit']"
        class="test-btn user-manage"
        @click="handleUserManage"
      >
        用户管理 (需要 user:add 或 user:edit 权限)
      </button>
      
      <p class="note">
        注意：如果您看不到某些按钮，说明您没有对应的权限。管理员可以看到所有按钮。
      </p>
    </div>
    
    <!-- 权限测试结果 -->
    <div class="test-results">
      <h3>测试结果</h3>
      <p>页面加载时间: {{ loadTime }}</p>
      <p>可见按钮数量: {{ visibleButtonCount }}</p>
      <button @click="refreshPermissions" class="refresh-btn">
        刷新权限数据
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useStore } from '@/store/pinia';

const isAdmin = ref(false);
const loadTime = ref('');
const visibleButtonCount = ref(0);

// 检查是否为管理员
const checkAdminStatus = () => {
  const userInfo = localStorage.getItem('USER_INFO');
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      isAdmin.value = user.administratorFlag === true;
    } catch (e) {
      isAdmin.value = false;
    }
  }
};

// 统计可见按钮数量
const countVisibleButtons = () => {
  setTimeout(() => {
    const buttons = document.querySelectorAll('.test-btn');
    visibleButtonCount.value = buttons.length;
  }, 1000); // 等待权限指令执行完成
};

// 刷新权限数据
const refreshPermissions = async () => {
  const store = useStore();
  try {
    await store.loadUserPermissions();
    ElMessage.success('权限数据已重新加载');
    // 重新加载页面以测试权限
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    ElMessage.error('权限数据加载失败');
  }
};

// 测试方法
const handleAddReservoir = () => {
  ElMessage.success('添加水库功能被触发');
};

const handleDeleteReservoir = () => {
  ElMessage.warning('删除水库功能被触发');
};

const handleEditReservoir = () => {
  ElMessage.info('编辑水库功能被触发');
};

const handleViewDetail = () => {
  ElMessage.success('查看详情功能被触发');
};

const handleSystemManage = () => {
  ElMessage.error('系统管理功能被触发');
};

const handleUserManage = () => {
  ElMessage.info('用户管理功能被触发');
};

onMounted(() => {
  loadTime.value = new Date().toLocaleString();
  checkAdminStatus();
  countVisibleButtons();
});
</script>

<style scoped>
.test-privilege {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
}

.test-section h3 {
  margin-top: 0;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.info-item {
  margin-bottom: 15px;
  line-height: 1.6;
}

.info-item strong {
  color: #333;
}

.info-item ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-item li {
  margin-bottom: 5px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.permission-tag {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}
</style>