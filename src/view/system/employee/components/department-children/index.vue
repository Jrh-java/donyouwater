<!--
  * 当前所选部门的子部门 人员管理右上半部分
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-08-08 20:46:18
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <el-card class="child-dept-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in props.breadcrumb" :key="index">
        {{ item }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="department-list" style="max-height: 170px; overflow-y: auto; margin-top: 20px;">
      <div 
        v-for="item in props.selectedDepartmentChildren" 
        :key="item.departmentId"
        class="department-item"
        @click="selectTree(item.departmentId)"
      >
        <span>{{ item.departmentName }}</span>
        <el-icon class="right-icon"><ArrowRight /></el-icon>
      </div>
    </div>
  </el-card>
</template>
<script setup>
  import { ArrowRight } from '@element-plus/icons-vue';
  import emitter from '../../department-mitt';

  const props = defineProps({
    breadcrumb: Array,
    selectedDepartmentChildren: Array,
  });

  function selectTree(id) {
    emitter.emit('selectTree', id);
  }
</script>
<style scoped lang="less">
  .child-dept-container {
    .department-list-box {
      margin-top: 20px;
    }
    .department-list {
      height: 170px;
      overflow-y: auto;
    }
    .department-item {
      cursor: pointer;
      padding: 6px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .department-item:hover {
      background-color: #f5f7fa;
    }
    .right-icon {
      color: #909399;
    }
  }
</style>
