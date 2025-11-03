<template>
  <div class="default-page">
    <div class="page-content">
      <div class="empty-state">
        <el-icon class="empty-icon" size="64">
          <Document />
        </el-icon>
        <h3>页面开发中</h3>
        <p>此页面正在开发中，请稍后再试。</p>
        <div class="page-info">
          <p><strong>路由路径：</strong>{{ $route.path }}</p>
          <p><strong>页面标题：</strong>{{ $route.meta?.title || '未命名页面' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.default-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.page-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.empty-state {
  .empty-icon {
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  h3 {
    color: #303133;
    margin-bottom: 8px;
    font-size: 18px;
  }
  
  p {
    color: #606266;
    margin-bottom: 16px;
  }
}

.page-info {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  text-align: left;
  
  p {
    margin: 4px 0;
    font-size: 14px;
    color: #606266;
    
    strong {
      color: #303133;
    }
  }
}
</style> 