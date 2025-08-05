<template>
  <div class="position-container">
    <!-- 查询条件 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="职务名称">
          <el-input v-model="queryForm.positionName" placeholder="请输入职务名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.disabled" placeholder="请选择状态" clearable :teleported="false">
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right;">
          <el-button type="success" @click="handleAdd">+ 新增职务</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="positionName" label="职务名称" min-width="200" />
        <el-table-column prop="level" label="职务级别" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column prop="disabled" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? '禁用' : '启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary"   @click="handleEdit(scope.row)">编辑</el-button>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="500px" 
      :lock-scroll="false"
      @closed="resetForm"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="职务名称" prop="positionName">
          <el-input v-model="formData.positionName" placeholder="请输入职务名称" />
        </el-form-item>
        <el-form-item label="职务级别" prop="level">
          <el-input-number v-model="formData.level" :min="1" :max="20" placeholder="请输入职务级别" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            placeholder="请输入备注" 
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="disabled">
          <el-radio-group v-model="formData.disabled">
            <el-radio :value="false">启用</el-radio>
            <el-radio :value="true">禁用</el-radio>
          </el-radio-group>
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
  getPositionPage, 
  addPosition, 
  updatePosition, 
  deletePosition,
  type Position 
} from '@/api/position';

const queryForm = reactive({
  positionName: '',
  disabled: null as boolean | null
});

const tableData = ref<Position[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增职务');
const isEdit = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<Position>({
  positionName: '',
  level: 1,
  sort: 0,
  remark: '',
  disabled: false,
});

// 表单验证规则
const rules = reactive<FormRules<Position>>({
  positionName: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入职务级别', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...queryForm
    };
    const result = await getPositionPage(params);
    tableData.value = result.list;
    totalItems.value = result.totalCount;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  loadData();
};

// 重置
const handleReset = () => {
  queryForm.positionName = '';
  queryForm.disabled = null;
  loadData();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增职务';
  isEdit.value = false;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: Position) => {
  dialogTitle.value = '编辑职务';
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row: Position) => {
  ElMessageBox.confirm(
    `确定要删除职务"${row.positionName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(async () => {
    try {
      await deletePosition(row.id!);
      ElMessage.success('删除成功');
      loadData();
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
          await updatePosition(formData);
          ElMessage.success('编辑成功');
        } else {
          await addPosition(formData);
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
    positionName: '',
    level: 1,
    sort: 0,
    remark: '',
    disabled: false,
  });
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadData();
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.position-container {
  padding: 20px;
}

.query-form .el-form-item {
  margin-right: 20px;
}
</style> 