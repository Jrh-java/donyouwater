<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或正在维护中</p>
      <el-button type="primary" @click="goHome">
        <template #icon>
          <HomeFilled />
        </template>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/viewer-fullscreen')
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .error-content {
    text-align: center;
    color: white;
    
    h1 {
      font-size: 120px;
      margin: 0;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    h2 {
      font-size: 32px;
      margin: 20px 0;
      font-weight: 300;
    }
    
    p {
      font-size: 18px;
      margin-bottom: 30px;
      opacity: 0.8;
    }
  }
}
</style> 