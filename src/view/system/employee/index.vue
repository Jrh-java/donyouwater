<!--
  * 组织架构
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-08-08 20:46:18
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div class="employee-container">
    <!-- 查询条件 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="账号名">
          <el-input v-model="queryForm.key" placeholder="请输入账号名" clearable />
        </el-form-item>
        <el-form-item label="角色" style="width: 150px;">
          <el-select v-model="queryForm.roleId" placeholder="请选择角色" clearable :teleported="false">
            <el-option 
              v-for="role in roleList" 
              :key="role.id" 
              :label="role.roleName" 
              :value="role.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width: 150px;">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable :teleported="false">
            <el-option label="启用" value="T" />
            <el-option label="禁用" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right;">
          <el-button type="success" @click="handleAdd">+ 新增员工</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主内容区域 -->
    <el-card shadow="never">
      <div class="main-content">
        <!-- 左侧部门树 -->
        <div class="dept-tree-container">
          <div class="tree-header">
            <span>部门列表</span>
          </div>
          <el-tree
            default-expand-all
            :data="departmentTreeData"
            :props="{ children: 'children', label: 'deptName' }"
            node-key="id"
            :current-node-key="currentDeptId"
            :highlight-current="true"
            @node-click="handleDeptClick"
            class="dept-tree"
          />
        </div>

        <!-- 右侧员工表格 -->
        <div class="employee-table-container">
          <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="员工姓名" min-width="120" />
            <el-table-column prop="userName" label="登录账号" width="120" />
            <el-table-column prop="mobilePhone" label="手机号码" width="140" />
            <el-table-column prop="telPhone" label="固定电话" width="140" />
            <el-table-column prop="email" label="邮箱" min-width="150" />
            <el-table-column prop="sex" label="性别" width="80">
              <template #default="scope">
                <span>{{ scope.row.sex === '1' ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'T' ? 'success' : 'danger'">
                  {{ scope.row.status === 'T' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button link type="primary"   @click="handleEdit(scope.row)">编辑</el-button>
                <el-button link type="warning"   @click="handleResetPassword(scope.row)">重置密码</el-button>
                <el-button link type="danger"   @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            style="margin-top: 20px; justify-content: flex-end;"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="totalItems"
            layout="total, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px" 
      :lock-scroll="false"
      @closed="resetForm"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="员工姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="登录账号" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入登录账号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="手机号码" prop="mobilePhone">
          <el-input v-model="formData.mobilePhone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="固定电话" prop="telPhone">
          <el-input v-model="formData.telPhone" placeholder="请输入固定电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :data="departmentTreeData"
            :props="{ value: 'id', label: 'deptName', children: 'children' }"
            placeholder="请选择部门"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色" clearable :teleported="false">
            <el-option 
              v-for="role in roleList" 
              :key="role.id" 
              :label="role.roleName" 
              :value="role.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio value="1">男</el-radio>
            <el-radio value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formData.birthday"
            type="date"
            placeholder="请选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :teleported="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="证件类型" prop="certificateType">
          <el-input v-model="formData.certificateType" placeholder="请输入证件类型" />
        </el-form-item>
        <el-form-item label="证件号码" prop="certificateNo">
          <el-input v-model="formData.certificateNo" placeholder="请输入证件号码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="T">启用</el-radio>
            <el-radio value="F">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            placeholder="请输入描述" 
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            placeholder="请输入备注" 
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog 
      v-model="passwordDialogVisible" 
      title="重置密码" 
      width="400px" 
      :lock-scroll="false"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmResetPassword">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  getEmployeePage, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  resetEmployeePassword,
  getEmployeeDetail,
  type Employee,
  type EmployeeQuery
} from '@/api/employee';
import { getDepartmentTree, type DepartmentTreeNode } from '@/api/department';
import { getAllRole, type Role } from '@/api/role';

// 模拟角色数据 - 实际应该从API获取
const roleList = ref<Role[]>([]);

const queryForm = reactive<EmployeeQuery>({
  page: 1,
  limit: 10,
  key: '',
  deptId: '',
  roleId: '',
  status: ''
});

const tableData = ref<Employee[]>([]);
const departmentTreeData = ref<DepartmentTreeNode[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const currentDeptId = ref('');

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增员工');
const isEdit = ref(false);
const formRef = ref<FormInstance>();

// 密码重置弹窗
const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const currentEmployee = ref<Employee>();

// 表单数据
const formData = reactive<Employee>({
  userName: '',
  name: '',
  password: '',
  mobilePhone: '',
  telPhone: '',
  email: '',
  deptId: '',
  roleId: '',
  sex: '1',
  birthday: '',
  address: '',
  certificateType: '',
  certificateNo: '',
  isActive: 'T',
  isShow: 'T',
  status: 'T',
  description: '',
  remark: ''
});

// 密码表单
const passwordForm = reactive({
  newPassword: ''
});

// 表单验证规则
const rules = reactive<FormRules<Employee>>({
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
  mobilePhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
});

// 密码验证规则
const passwordRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params: EmployeeQuery = {
      page: currentPage.value,
      limit: pageSize.value,
      key: queryForm.key || undefined,
      deptId: queryForm.deptId || currentDeptId.value || undefined,
      roleId: queryForm.roleId || undefined,
      status: queryForm.status || undefined
    };
    const result = await getEmployeePage(params);
    tableData.value = result.list;
    totalItems.value = result.totalCount;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载部门树数据
const loadDepartmentTree = async () => {
  try {
    const result = await getDepartmentTree();
    departmentTreeData.value = result;
  } catch (error) {
    console.error('获取部门数据失败:', error);
  }
};

// 加载角色数据
const loadRoleList = async () => {
  try {
    const result = await getAllRole();
    roleList.value = result;
    console.log('角色数据加载成功:', result);
  } catch (error) {
    console.error('获取角色数据失败:', error);
    ElMessage.error('获取角色数据失败');
  }
};

// 部门节点点击事件
const handleDeptClick = (data: DepartmentTreeNode) => {
  currentDeptId.value = data.id!;
  currentPage.value = 1;
  loadData();
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  loadData();
};

// 重置
const handleReset = () => {
  queryForm.key = '';
  queryForm.roleId = '';
  queryForm.status = '';
  currentDeptId.value = '';
  loadData();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增员工';
  isEdit.value = false;
  if (currentDeptId.value) {
    formData.deptId = currentDeptId.value;
  }
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: Employee) => {
  try {
    dialogTitle.value = '编辑员工';
    isEdit.value = true;
    
    // 先调用查询接口获取详细信息
    const detail = await getEmployeeDetail(row.userId!);
    Object.assign(formData, detail);
    formData.userId = detail.userId;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取员工详情失败');
  }
};

// 删除
const handleDelete = (row: Employee) => {
  ElMessageBox.confirm(
    `确定要删除员工"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(async () => {
    try {
      await deleteEmployee(row.userId!);
      ElMessage.success('删除成功');
      loadData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 重置密码
const handleResetPassword = (row: Employee) => {
  currentEmployee.value = row;
  passwordDialogVisible.value = true;
};

// 确认重置密码
const confirmResetPassword = () => {
  if (!passwordFormRef.value) return;
  
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await resetEmployeePassword([currentEmployee.value!.userId!], passwordForm.newPassword);
        ElMessage.success('密码重置成功');
        passwordDialogVisible.value = false;
        passwordForm.newPassword = '';
      } catch (error) {
        ElMessage.error('密码重置失败');
      }
    }
  });
};

// 确认提交
const confirmSubmit = () => {
  if (!formRef.value) return;
  
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateEmployee(formData);
          ElMessage.success('编辑成功');
        } else {
          await addEmployee(formData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        loadData();
      } catch (error) {
        ElMessage.error(isEdit.value ? '编辑失败' : '新增失败');
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    userName: '',
    name: '',
    password: '',
    mobilePhone: '',
    telPhone: '',
    email: '',
    deptId: '',
    roleId: '',
    sex: '1',
    birthday: '',
    address: '',
    certificateType: '',
    certificateNo: '',
    isActive: 'T',
    isShow: 'T',
    status: 'T',
    description: '',
    remark: ''
  });
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  queryForm.limit = val;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  queryForm.page = val;
  loadData();
};

// 初始化
onMounted(() => {
  loadData();
  loadDepartmentTree();
  loadRoleList();
});
</script>

<style scoped>
.employee-container {
  padding: 20px;
}

.query-form .el-form-item {
  margin-right: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.dept-tree-container {
  width: 280px;
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
}

.tree-header {
  padding: 10px 0;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.dept-tree {
  max-height: 600px;
  overflow-y: auto;
}

.employee-table-container {
  flex: 1;
}

:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f7ff;
  color: #1890ff;
}
</style>
