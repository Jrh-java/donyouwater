<template>
  <el-form class="smart-query-form">
    <el-row class="smart-query-form-row">
      <el-form-item label="部门名称" class="smart-query-form-item">
        <el-input style="width: 300px" v-model="keywords" placeholder="请输入部门名称" />
      </el-form-item>

      <el-form-item class="smart-query-form-item smart-margin-left10">
        <el-button-group>
          <el-button v-privilege="'support:department:query'" type="primary" @click="onSearch">
            <template #icon>
              <Search />
            </template>
            查询
          </el-button>
          <el-button v-privilege="'support:department:query'" @click="resetQuery">
            <template #icon>
              <Refresh />
            </template>
            重置
          </el-button>
        </el-button-group>
        <el-button v-privilege="'system:department:add'" type="primary" @click="addDepartment" class="smart-margin-left20">
          <template #icon>
            <Plus />
          </template>
          新建
        </el-button>
      </el-form-item>
    </el-row>
  </el-form>

  <el-card shadow="never" :body-style="{ padding: '16px' }">
    <el-table
       
      border
      v-loading="tableLoading"
      row-key="departmentId"
      :data="departmentTreeData"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :expand-row-keys="defaultExpandedRowList"
      style="width: 100%"
   
    >
      <el-table-column prop="departmentName" label="部门名称" min-width="200" />
      <el-table-column prop="managerName" label="负责人" width="100" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="150" />
      <el-table-column prop="updateTime" label="更新时间" width="150" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="smart-table-operate">
            <el-button @click="addDepartment(row)" v-privilege="'system:department:add'" link type="primary">添加下级</el-button>
            <el-button @click="updateDepartment(row)" v-privilege="'system:department:update'" link type="primary">编辑</el-button>
            <el-button
              v-if="row.departmentId !== topDepartmentId"
              v-privilege="'system:department:delete'"
              @click="deleteDepartment(row.departmentId)"
              link
              type="danger"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加编辑部门弹窗 -->
    <DepartmentFormModal ref="departmentFormModal" @refresh="queryDepartmentTree" />
  </el-card>
</template>

<script setup>
  import { onMounted, reactive, ref, watch, createVNode } from 'vue';
  import { departmentApi } from '/@/api/system/department-api';
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { Search, Refresh, Plus } from '@element-plus/icons-vue';
  import _ from 'lodash';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import DepartmentFormModal from './components/department-form-modal.vue';
  import { smartSentry } from '/@/lib/smart-sentry';

  const DEPARTMENT_PARENT_ID = 0;

  // -----------------------  筛选 ---------------------
  const keywords = ref('');

  // ----------------------- 部门树的展示 ---------------------
  const tableLoading = ref(false);

  const topDepartmentId = ref();
  // 所有部门列表
  const departmentList = ref([]);
  // 部门树形数据
  const departmentTreeData = ref([]);
  // 存放部门id和部门，用于查找
  const idInfoMap = ref(new Map());
  // 默认展开的行
  const defaultExpandedRowList = ref([]);

  onMounted(() => {
    queryDepartmentTree();
  });

  // 查询部门列表并构建 部门树
  async function queryDepartmentTree() {
    try {
      tableLoading.value = true;
      let res = await departmentApi.queryAllDepartment();
      let data = res.data;

      data.forEach((e) => {
        idInfoMap.value.set(e.departmentId, e);
      });

      departmentList.value = data;
      departmentTreeData.value = buildDepartmentTree(data, DEPARTMENT_PARENT_ID);

      // 默认显示 最顶级ID为列表中返回的第一条数据的ID
      if (!_.isEmpty(departmentTreeData.value) && departmentTreeData.value.length > 0) {
        topDepartmentId.value = departmentTreeData.value[0].departmentId;
        // 收集第一个父节点及其所有子节点的ID用于展开
        defaultExpandedRowList.value = [];
        collectExpandKeys(departmentTreeData.value[0], defaultExpandedRowList.value);
      }
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  // 收集要展开的节点键
  function collectExpandKeys(node, expandKeys) {
    if (node && node.departmentId) {
      expandKeys.push(node.departmentId);
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          collectExpandKeys(child, expandKeys);
        });
      }
    }
  }

  // 构建部门树
  function buildDepartmentTree(data, parentId) {
    let children = data.filter((e) => e.parentId === parentId) || [];
    if (!_.isEmpty(children)) {
      children.forEach((e) => {
        e.children = buildDepartmentTree(data, e.departmentId);
        // 如果子节点为空数组，删除children属性，让Element Plus正确识别叶子节点
        if (e.children && e.children.length === 0) {
          delete e.children;
        }
      });
      return children;
    }
    return [];
  }

  // 重置
  function resetQuery() {
    keywords.value = '';
    onSearch();
  }

  // 搜索
  function onSearch() {
    if (!keywords.value) {
      departmentTreeData.value = buildDepartmentTree(departmentList.value, DEPARTMENT_PARENT_ID);
      // 重新设置展开的节点
      if (!_.isEmpty(departmentTreeData.value) && departmentTreeData.value.length > 0) {
        defaultExpandedRowList.value = [];
        collectExpandKeys(departmentTreeData.value[0], defaultExpandedRowList.value);
      }
      return;
    }
    let originData = departmentList.value.concat();
    if (!originData) {
      return;
    }
    // 筛选出名称符合的部门
    let filterDepartment = originData.filter((e) => e.departmentName.indexOf(keywords.value) > -1);
    let filterDepartmentList = [];
    // 循环筛选出的部门 构建部门树
    filterDepartment.forEach((e) => {
      recursionFilterDepartment(filterDepartmentList, e.departmentId, false);
    });
    departmentTreeData.value = buildDepartmentTree(filterDepartmentList, DEPARTMENT_PARENT_ID);
    // 搜索结果展开所有节点
    defaultExpandedRowList.value = [];
    if (departmentTreeData.value && departmentTreeData.value.length > 0) {
      departmentTreeData.value.forEach(node => {
        collectExpandKeys(node, defaultExpandedRowList.value);
      });
    }
  }

  // 根据ID递归筛选部门
  function recursionFilterDepartment(resList, id, unshift) {
    let info = idInfoMap.value.get(id);
    if (!info || resList.some((e) => e.departmentId === id)) {
      return;
    }
    if (unshift) {
      resList.unshift(info);
    } else {
      resList.push(info);
    }
    if (info.parentId && info.parentId !== 0) {
      recursionFilterDepartment(resList, info.parentId, unshift);
    }
  }

  // ----------------------- 表单操作：添加部门/修改部门/删除部门/上下移动 ---------------------
  const departmentFormModal = ref();
  // 添加
  function addDepartment(e) {
    let data = {
      departmentId: 0,
      departmentName: '',
      parentId: e.departmentId || null,
    };
    departmentFormModal.value.showModal(data);
  }
  // 编辑
  function updateDepartment(e) {
    departmentFormModal.value.showModal(e);
  }

  // 删除
  function deleteDepartment(id) {
    ElMessageBox.confirm(
      '确定要删除该部门吗?',
      '提醒',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(() => {
      // 使用 setTimeout 避免 runtime.lastError
      setTimeout(async () => {
        SmartLoading.show();
        try {
          await departmentApi.deleteDepartment(id);
          ElMessage.success('删除成功');
          await queryDepartmentTree();
        } catch (error) {
          smartSentry.captureError(error);
          ElMessage.error('删除失败');
        } finally {
          SmartLoading.hide();
        }
      }, 0);
    }).catch(() => {
      // 用户取消删除
    });
  }
</script>

<style scoped lang="less"></style>
