<!--
  *  员工 列表
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-08-08 20:46:18
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <el-card class="employee-container">
    <div class="header">
      <h5>部门人员</h5>
      <div class="query-operate">
        <el-radio-group v-model="params.disabledFlag" style="margin: 8px; flex-shrink: 0" @change="queryEmployeeByKeyword(false)">
          <el-radio-button :value="undefined">全部</el-radio-button>
          <el-radio-button :value="false">启用</el-radio-button>
          <el-radio-button :value="true">禁用</el-radio-button>
        </el-radio-group>
        <el-input 
          v-model.trim="params.keyword" 
          placeholder="姓名/手机号/登录账号" 
          style="width: 300px;"
          @keyup.enter="queryEmployeeByKeyword(true)"
        >
          <template #append>
            <el-button type="primary" @click="queryEmployeeByKeyword(true)">
              <template #icon>
                <Search />
              </template>
              查询
            </el-button>
          </template>
        </el-input>
        <el-button @click="reset" class="smart-margin-left10">
          <template #icon>
            <Refresh />
          </template>
          重置
        </el-button>
      </div>
    </div>
    <div class="btn-group">
      <el-button class="btn" type="primary" @click="showDrawer" v-privilege="'system:employee:add'">添加成员</el-button>
      <el-button class="btn" @click="updateEmployeeDepartment" v-privilege="'system:employee:department:update'">调整部门</el-button>
      <el-button class="btn" type="danger" @click="batchDelete" v-privilege="'system:employee:delete'">批量删除</el-button>

      <span class="smart-table-column-operate">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.SYSTEM.EMPLOYEE" :refresh="queryEmployee" />
      </span>
    </div>

    <el-table
      :data="tableData"
       
      border
      v-loading="tableLoading"
      @selection-change="onSelectChange"
      row-key="employeeId"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="actualName" label="姓名" width="85" />
      <el-table-column prop="gender" label="性别" width="70">
        <template #default="{ row }">
          <span>{{ $smartEnumPlugin.getDescByValue('GENDER_ENUM', row.gender) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="loginName" label="登录账号" width="100" />
      <el-table-column prop="phone" label="手机号" width="85" />
      <el-table-column prop="email" label="邮箱" width="100" />
      <el-table-column prop="administratorFlag" label="超管" width="60">
        <template #default="{ row }">
          <el-tag type="danger" v-if="row.administratorFlag">超管</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="disabledFlag" label="状态" width="60">
        <template #default="{ row }">
          <el-tag :type="row.disabledFlag ? 'danger' : 'success'">{{ row.disabledFlag ? '禁用' : '启用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="positionName" label="职务" width="100" />
      <el-table-column prop="roleNameList" label="角色" width="100" />
      <el-table-column prop="departmentName" label="部门" min-width="200" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <div class="smart-table-operate">
            <el-button v-privilege="'system:employee:update'" link type="primary"   @click="showDrawer(row)">编辑</el-button>
            <el-button
              v-privilege="'system:employee:password:reset'"
              link type="primary"  
              @click="resetPassword(row.employeeId, row.loginName)"
            >重置密码</el-button>
            <el-button v-privilege="'system:employee:disabled'" link type="primary" @click="updateDisabled(row.employeeId, row.disabledFlag)">{{
              row.disabledFlag ? '启用' : '禁用'
            }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="smart-query-table-page">
      <el-pagination
        v-model:current-page="params.pageNum"
        v-model:page-size="params.pageSize"
        :page-sizes="PAGE_SIZE_OPTIONS"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @size-change="queryEmployee"
        @current-change="queryEmployee"
      />
    </div>
    <EmployeeFormModal ref="employeeFormModal" @refresh="queryEmployee" @show-account="showAccount" />
    <EmployeeDepartmentFormModal ref="employeeDepartmentFormModal" @refresh="queryEmployee" />
    <EmployeePasswordDialog ref="employeePasswordDialog" />
  </el-card>
</template>
<script setup>
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Search, Refresh } from '@element-plus/icons-vue';
  import _ from 'lodash';
  import { computed, reactive, ref, watch } from 'vue';
  import { employeeApi } from '/@/api/system/employee-api';
  import { PAGE_SIZE } from '/@/constants/common-const';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import EmployeeFormModal from '../employee-form-modal/index.vue';
  import EmployeeDepartmentFormModal from '../employee-department-form-modal/index.vue';
  import EmployeePasswordDialog from '../employee-password-dialog/index.vue';
  import { PAGE_SIZE_OPTIONS, showTableTotal } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';

  // ----------------------- 以下是字段定义 emits props ---------------------

  const props = defineProps({
    departmentId: Number,
    breadcrumb: Array,
  });

  //-------------回显账号密码信息----------
  let employeePasswordDialog = ref();
  function showAccount(accountName, passWord) {
    employeePasswordDialog.value.showModal(accountName, passWord);
  }

  // ----------------------- 表格/列表/ 搜索 ---------------------
  //字段
  const columns = ref([
    {
      title: '姓名',
      dataIndex: 'actualName',
      width: 85,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 70,
    },
    {
      title: '登录账号',
      dataIndex: 'loginName',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 85,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 100,
      ellipsis: true,
    },
    {
      title: '超管',
      dataIndex: 'administratorFlag',
      width: 60,
    },
    {
      title: '状态',
      dataIndex: 'disabledFlag',
      width: 60,
    },
    {
      title: '职务',
      dataIndex: 'positionName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'roleNameList',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 140,
    },
  ]);
  const tableData = ref();

  let defaultParams = {
    departmentId: undefined,
    disabledFlag: false,
    keyword: undefined,
    searchCount: undefined,
    pageNum: 1,
    pageSize: PAGE_SIZE,
    sortItemList: undefined,
  };
  const params = reactive({ ...defaultParams });
  const total = ref(0);

  // 搜索重置
  function reset() {
    Object.assign(params, defaultParams);
    queryEmployee();
  }

  const tableLoading = ref(false);
  // 查询
  async function queryEmployee() {
    tableLoading.value = true;
    try {
      params.departmentId = props.departmentId;
      let res = await employeeApi.queryEmployee(params);
      for (const item of res.data.list) {
        item.roleNameList = _.join(item.roleNameList, ',');
      }
      tableData.value = res.data.list;
      total.value = res.data.total;
      // 清除选中
      selectedRowKeys.value = [];
      selectedRows.value = [];
    } catch (error) {
      smartSentry.captureError(error);
    } finally {
      tableLoading.value = false;
    }
  }

  // 根据关键字 查询
  async function queryEmployeeByKeyword(allDepartment) {
    tableLoading.value = true;
    try {
      params.pageNum = 1;
      params.departmentId = allDepartment ? undefined : props.departmentId;
      let res = await employeeApi.queryEmployee(params);
      for (const item of res.data.list) {
        item.roleNameList = _.join(item.roleNameList, ',');
      }
      tableData.value = res.data.list;
      total.value = res.data.total;
      // 清除选中
      selectedRowKeys.value = [];
      selectedRows.value = [];
    } catch (error) {
      smartSentry.captureError(error);
    } finally {
      tableLoading.value = false;
    }
  }

  watch(
    () => props.departmentId,
    () => {
      if (props.departmentId !== params.departmentId) {
        params.pageNum = 1;
        queryEmployee();
      }
    },
    { immediate: true }
  );

  // ----------------------- 多选操作 ---------------------

  let selectedRowKeys = ref([]);
  let selectedRows = ref([]);
  // 是否有选中：用于 批量操作按钮的禁用
  const hasSelected = computed(() => selectedRowKeys.value.length > 0);

  function onSelectChange(selection) {
    selectedRowKeys.value = selection.map(row => row.employeeId);
    selectedRows.value = selection;
  }

  // 批量删除员工
  function batchDelete() {
    if (!hasSelected.value) {
      ElMessage.warning('请选择要删除的员工');
      return;
    }
    const actualNameArray = selectedRows.value.map((e) => e.actualName);
    const employeeIdArray = selectedRows.value.map((e) => e.employeeId);
    ElMessageBox.confirm(
      `确定要删除如下员工吗? ${_.join(actualNameArray, ',')}`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(async () => {
      SmartLoading.show();
      try {
        await employeeApi.batchDeleteEmployee(employeeIdArray);
        ElMessage.success('删除成功');
        queryEmployee();
        selectedRowKeys.value = [];
        selectedRows.value = [];
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    }).catch(() => {
      // 用户取消删除
    });
  }

  // 批量更新员工部门
  const employeeDepartmentFormModal = ref();

  function updateEmployeeDepartment() {
    if (!hasSelected.value) {
      ElMessage.warning('请选择要调整部门的员工');
      return;
    }
    const employeeIdArray = selectedRows.value.map((e) => e.employeeId);
    employeeDepartmentFormModal.value.showModal(employeeIdArray);
  }

  // ----------------------- 添加、修改、禁用、重置密码 ------------------------------------

  const employeeFormModal = ref(); //组件

  // 展示编辑弹窗
  function showDrawer(rowData) {
    let params = {};
    if (rowData) {
      params = _.cloneDeep(rowData);
      params.disabledFlag = params.disabledFlag ? 1 : 0;
    } else if (props.departmentId) {
      params.departmentId = props.departmentId;
    }
    employeeFormModal.value.showDrawer(params);
  }

  // 重置密码
  function resetPassword(id, name) {
    ElMessageBox.confirm(
      '确定要重置密码吗?',
      '提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(async () => {
      SmartLoading.show();
      try {
        let { data: passWord } = await employeeApi.resetPassword(id);
        ElMessage.success('重置成功');
        employeePasswordDialog.value.showModal(name, passWord);
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    }).catch(() => {
      // 用户取消重置
    });
  }

  // 禁用 / 启用
  function updateDisabled(id, disabledFlag) {
    ElMessageBox.confirm(
      `确定要${disabledFlag ? '启用' : '禁用'}吗?`,
      '提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(async () => {
      SmartLoading.show();
      try {
        await employeeApi.updateDisabled(id);
        ElMessage.success(`${disabledFlag ? '启用' : '禁用'}成功`);
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    }).catch(() => {
      // 用户取消操作
    });
  }
</script>
<style scoped lang="less">
  .employee-container {
    height: 100%;
  }
  .header {
    display: flex;
    align-items: center;
  }
  .query-operate {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .btn-group {
    margin: 10px 0;
    .btn {
      margin-right: 8px;
    }
  }
</style>
