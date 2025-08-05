<template>
  <div class="department-container">
    <!-- 查询条件 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="部门名称">
          <el-input v-model="queryForm.deptName" placeholder="请输入部门名称" clearable />
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
          <el-button type="success" @click="handleAdd">+ 新增部门</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 树形表格 -->
    <el-card shadow="never">
      <el-table
        :data="treeData"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        row-key="id"
        v-loading="loading"
        style="width: 100%"
        default-expand-all
      >
        <el-table-column prop="deptName" label="部门名称" min-width="200" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="orderNum" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'T' ? 'success' : 'danger'">
              {{ scope.row.status === 'T' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="membersNum" label="成员数" width="80" />
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary"   @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary"   @click="handleAddChild(scope.row)">添加下级</el-button>
            <el-button link type="danger"   @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="departmentTreeData"
            :props="{ value: 'id', label: 'deptName', children: 'children' }"
            placeholder="请选择上级部门"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="formData.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" :max="9999" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="T">启用</el-radio>
            <el-radio value="F">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注" 
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  getDepartmentTree, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentDetail,
  type Department,
  type DepartmentTreeNode,
  type DepartmentQuery
} from '@/api/department';

const queryForm = reactive<DepartmentQuery>({
  deptName: '',
  status: ''
});

const treeData = ref<DepartmentTreeNode[]>([]);
const departmentTreeData = ref<DepartmentTreeNode[]>([]);
const loading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增部门');
const isEdit = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<Department>({
  deptName: '',
  parentId: '',
  leader: '',
  phone: '',
  email: '',
  orderNum: 0,
  status: 'T',
  remark: ''
});

// 表单验证规则
const rules = reactive<FormRules<Department>>({
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  orderNum: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 加载部门树数据
const loadDepartmentTree = async () => {
  try {
    loading.value = true;
    const params: DepartmentQuery = {};
    if (queryForm.deptName) params.deptName = queryForm.deptName;
    if (queryForm.status) params.status = queryForm.status;
    
    const result = await getDepartmentTree(params);
    treeData.value = result;
    
    // 为树选择器添加根节点选项
    departmentTreeData.value = [
      { 
        id: '-1', 
        deptName: '根部门', 
        orderNum: 0, 
        status: 'T', 
        children: result 
      }
    ];
  } catch (error) {
    ElMessage.error('获取部门数据失败');
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  loadDepartmentTree();
};

// 重置
const handleReset = () => {
  queryForm.deptName = '';
  queryForm.status = '';
  loadDepartmentTree();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增部门';
  isEdit.value = false;
  dialogVisible.value = true;
};

// 添加下级部门
const handleAddChild = (row: DepartmentTreeNode) => {
  dialogTitle.value = '新增下级部门';
  isEdit.value = false;
  formData.parentId = row.id!;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: DepartmentTreeNode) => {
  try {
    dialogTitle.value = '编辑部门';
    isEdit.value = true;
    
    // 先调用查询接口获取详细信息
    const detail = await getDepartmentDetail(row.id!);
    Object.assign(formData, detail);
    
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取部门详情失败');
  }
};

// 删除
const handleDelete = (row: DepartmentTreeNode) => {
  ElMessageBox.confirm(
    `确定要删除部门"${row.deptName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(async () => {
    try {
      await deleteDepartment([row.id!]);
      ElMessage.success('删除成功');
      loadDepartmentTree();
    } catch (error) {
      ElMessage.error('删除失败');
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
          await updateDepartment(formData);
          ElMessage.success('编辑成功');
        } else {
          await addDepartment(formData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        loadDepartmentTree();
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
    deptName: '',
    parentId: '',
    leader: '',
    phone: '',
    email: '',
    orderNum: 0,
    status: 'T',
    remark: ''
  });
};

// 初始化
onMounted(() => {
  loadDepartmentTree();
});
</script>

<style scoped>
.department-container {
  padding: 20px;
}

.query-form .el-form-item {
  margin-right: 20px;
}
</style> 