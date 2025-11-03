<!--
  * 职务表
  *
  * @Author:    kaiyun
  * @Date:      2024-06-23 23:31:38
  * @Copyright  <a href="https://1024lab.net">1024创新实验室</a>
-->
<template>
  <!---------- 查询表单form begin ----------->
  <el-form class="smart-query-form">
    <el-row class="smart-query-form-row">
      <el-form-item label="关键字查询" class="smart-query-form-item">
        <el-input style="width: 200px" v-model="queryForm.keywords" placeholder="关键字查询" />
      </el-form-item>
      <el-form-item class="smart-query-form-item">
        <el-button type="primary" @click="queryData">
          <template #icon>
            <Search />
          </template>
          查询
        </el-button>
        <el-button @click="resetQuery" class="smart-margin-left10">
          <template #icon>
            <Refresh />
          </template>
          重置
        </el-button>
      </el-form-item>
    </el-row>
  </el-form>
  <!---------- 查询表单form end ----------->

  <el-card shadow="never">
    <!---------- 表格操作行 begin ----------->
    <div class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <el-button @click="showForm" type="primary">
          <template #icon>
            <Plus />
          </template>
          新建
        </el-button>
        <el-button @click="confirmBatchDelete" type="danger" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <Delete />
          </template>
          批量删除
        </el-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.SYSTEM.EMPLOYEE" :refresh="queryData" />
      </div>
    </div>
    <!---------- 表格操作行 end ----------->

    <!---------- 表格 begin ----------->
    <el-table
       
      :data="tableData"
      row-key="positionId"
      border
      v-loading="tableLoading"
      @selection-change="onSelectChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="positionName" label="职务名称" min-width="150" />
      <el-table-column prop="level" label="职级" min-width="120" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="remark" label="备注" min-width="150" />
      <el-table-column prop="createTime" label="创建时间" width="150" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="smart-table-operate">
            <el-button @click="showForm(row)" link type="primary">编辑</el-button>
            <el-button @click="onDelete(row)" link type="danger">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!---------- 表格 end ----------->

    <div class="smart-query-table-page">
      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="PAGE_SIZE_OPTIONS"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @size-change="queryData"
        @current-change="queryData"
      />
    </div>

    <PositionForm ref="formRef" @reloadList="queryData" />
  </el-card>
</template>
<script setup>
  import { reactive, ref, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { positionApi } from '/@/api/system/position-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import PositionForm from './position-form.vue';
  import _ from 'lodash';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';

  // ---------------------------- 表格列 ----------------------------

  const columns = ref([
    {
      title: '职务名称',
      dataIndex: 'positionName',
      ellipsis: true,
    },
    {
      title: '职级',
      dataIndex: 'level',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 90,
    },
  ]);

  // ---------------------------- 查询数据表单和方法 ----------------------------

  const queryFormState = {
    keywords: undefined, //关键字查询
    pageNum: 1,
    pageSize: 10,
  };
  // 查询表单form
  const queryForm = reactive({ ...queryFormState });
  // 表格加载loading
  const tableLoading = ref(false);
  // 表格数据
  const tableData = ref([]);
  // 总数
  const total = ref(0);

  // 重置查询条件
  function resetQuery() {
    let pageSize = queryForm.pageSize;
    Object.assign(queryForm, queryFormState);
    queryForm.pageSize = pageSize;
    queryData();
  }

  // 查询数据
  async function queryData() {
    tableLoading.value = true;
    try {
      let queryResult = await positionApi.queryPage(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  onMounted(queryData);

  // ---------------------------- 添加/修改 ----------------------------
  const formRef = ref();

  function showForm(data) {
    formRef.value.show(data);
  }

  // ---------------------------- 单个删除 ----------------------------
  //确认删除
  function onDelete(data) {
    ElMessageBox.confirm(
      '确定要删除选中的数据吗?',
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(() => {
      requestDelete(data);
    }).catch(() => {
      // 用户取消删除
    });
  }

  //请求删除
  async function requestDelete(data) {
    SmartLoading.show();
    try {
      await positionApi.delete(data.positionId);
      ElMessage.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ---------------------------- 批量删除 ----------------------------

  // 选择表格行
  const selectedRowKeyList = ref([]);
  const selectedRows = ref([]);

  function onSelectChange(selection) {
    selectedRowKeyList.value = selection.map(row => row.positionId);
    selectedRows.value = selection;
  }

  // 批量删除
  function confirmBatchDelete() {
    if (_.isEmpty(selectedRowKeyList.value)) {
      ElMessage.warning('请选择要删除的数据');
      return;
    }
    ElMessageBox.confirm(
      '确定要批量删除这些数据吗?',
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(() => {
      requestBatchDelete();
    }).catch(() => {
      // 用户取消删除
    });
  }

  //请求批量删除
  async function requestBatchDelete() {
    try {
      SmartLoading.show();
      await positionApi.batchDelete(selectedRowKeyList.value);
      ElMessage.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
