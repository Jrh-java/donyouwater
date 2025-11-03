<template>
  <div class="main-404">
    <div class="error-content">
      <div class="error-icon">
        <el-icon :size="120" color="#409EFF">
          <WarningFilled />
        </el-icon>
      </div>
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">页面未找到</h2>
      <p class="error-description">
        抱歉，您访问的页面不存在或正在维护中
      </p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome" :icon="HomeFilled">
          返回首页
        </el-button>
        <el-button @click="goBack" :icon="ArrowLeft">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled, ArrowLeft, WarningFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/main/dashboard')
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}
</script>

<style lang="scss" scoped>
.main-404 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px); // 减去header高度
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .error-content {
    text-align: center;
    max-width: 500px;
    
    .error-icon {
      margin-bottom: 20px;
      animation: bounce 2s infinite;
    }
    
    .error-title {
      font-size: 72px;
      margin: 0 0 10px 0;
      font-weight: bold;
      color: #409EFF;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .error-subtitle {
      font-size: 24px;
      margin: 0 0 15px 0;
      font-weight: 500;
      color: #606266;
    }
    
    .error-description {
      font-size: 16px;
      color: #909399;
      margin: 0 0 30px 0;
      line-height: 1.6;
    }
    
    .error-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      
      .el-button {
        min-width: 120px;
      }
    }
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-404 {
    min-height: calc(100vh - 100px);
    padding: 20px 15px;
    
    .error-content {
      .error-title {
        font-size: 48px;
      }
      
      .error-subtitle {
        font-size: 20px;
      }
      
      .error-actions {
        flex-direction: column;
        align-items: center;
        
        .el-button {
          width: 200px;
        }
      }
    }
  }
}
</style>