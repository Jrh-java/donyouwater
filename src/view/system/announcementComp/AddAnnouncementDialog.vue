<template>
  <el-dialog
    v-model="visible"
    title="添加公告"
    width="600px"
    :lock-scroll="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input
          v-model="form.noticeTitle"
          placeholder="请输入公告标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="公告类型" prop="noticeType">
        <el-select
          v-model="form.noticeType"
          placeholder="请选择公告类型"
          :teleported="false"
          style="width: 100%"
        >
          <el-option label="通知" value="1" />
          <el-option label="公告" value="2" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="接收人员" prop="userNoticeList">
        <el-tree-select
          v-model="selectedUsers"
          :data="departmentTreeData"
          placeholder="请选择接收人员"
          style="width: 100%"
          multiple
          show-checkbox
          check-strictly
          :teleported="false"
          :loading="employeesLoading"
          node-key="value"
          default-expand-all
          :props="{
            label: 'label',
            children: 'children',
            disabled: 'disabled'
          }"
          @change="handleUserSelectionChange"
        />
      </el-form-item>
      
      <el-form-item label="公告内容" prop="noticeContent">
        <el-input
          v-model="form.noticeContent"
          type="textarea"
          :rows="6"
          placeholder="请输入公告内容"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="上传附件">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          accept=".rar,.zip,.doc,.docx,.pdf"
        >
          <el-button type="primary">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持格式：.rar .zip .doc .docx .pdf，单个文件不超过20MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { addAnnouncementApi, type UserNoticeItem } from '@/api/announcement';
import { getDepartmentTree, type DepartmentTreeNode } from '@/api/department';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = ref(false);
const loading = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const uploadRef = ref();
const fileList = ref([]);

// 表单数据
const form = reactive({
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  file: '',
  userNoticeList: [] as UserNoticeItem[]  // 改为对象数组类型
});

// 选中的用户（用于树选择器）
const selectedUsers = ref<string[]>([]);

// 部门树数据
const departmentTreeData = ref<Array<any>>([]);
const employeesLoading = ref(false);

// 存储用户信息映射
const userInfoMap = ref<Map<string, { userId: string; userName: string }>>(new Map());

// 构建部门树选择器数据
const buildDepartmentTree = (departments: DepartmentTreeNode[]): any[] => {
  return departments.map(dept => {
    const node: any = {
      label: dept.deptName,
      value: dept.id,
      disabled: true, // 部门节点不可选
      children: []
    }
    
    // 添加员工节点
    if (dept.sysDeptUserVOS && dept.sysDeptUserVOS.length > 0) {
      const employees = dept.sysDeptUserVOS.map(user => {
        // 存储用户信息到映射中
        userInfoMap.value.set(user.userId, {
          userId: user.userId,
          userName: user.name
        });
        
        return {
          label: user.name,
          value: user.userId,
          disabled: false // 员工节点可选
        };
      });
      node.children.push(...employees);
    }
    
    // 递归处理子部门
    if (dept.children && dept.children.length > 0) {
      const childDepts = buildDepartmentTree(dept.children);
      node.children.push(...childDepts);
    }
    
    return node;
  });
};

// 表单验证规则
const rules = {
  noticeTitle: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  noticeType: [
    { required: true, message: '请选择公告类型', trigger: 'change' }
  ],
  noticeContent: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '长度在 1 到 2000 个字符', trigger: 'blur' }
  ],
  userNoticeList: [
    { 
      required: true, 
      validator: (rule: any, value: UserNoticeItem[], callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('请选择接收人员'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ]
};

// 监听props变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  },
  { immediate: true }
);

// 监听visible变化
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 处理文件变化
const handleFileChange = (file: any) => {
  console.log('文件变化:', file);
  // 这里可以实现文件上传逻辑
  form.file = file.name;
};

// 重置表单
const resetForm = () => {
  form.noticeTitle = '';
  form.noticeType = '';
  form.noticeContent = '';
  form.file = '';
  form.userNoticeList = [];
  selectedUsers.value = [];
  fileList.value = [];
  formRef.value?.resetFields();
};

// 处理用户选择变化
const handleUserSelectionChange = () => {
  // el-tree-select的v-model会自动更新selectedUsers.value
  // 将选中的用户ID转换为包含userId和userName的对象数组
  form.userNoticeList = selectedUsers.value.map(userId => {
    const userInfo = userInfoMap.value.get(userId);
    return {
      userId: userId,
      userName: userInfo?.userName || ''
    };
  });
  // 手动触发验证
  formRef.value?.validateField('userNoticeList');
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  resetForm();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    await addAnnouncementApi({
      noticeTitle: form.noticeTitle,
      noticeType: form.noticeType,
      noticeContent: form.noticeContent,
      file: form.file,
      userNoticeList: form.userNoticeList
    });
    
    ElMessage.success('添加公告成功');
    emit('success');
    handleClose();
  } catch (error) {
    console.error('添加公告失败:', error);
    ElMessage.error('添加公告失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时的初始化
onMounted(async () => {
  try {
    // 获取部门树数据
    employeesLoading.value = true;
    const departmentData = await getDepartmentTree();
    departmentTreeData.value = buildDepartmentTree(departmentData);
  } catch (error) {
    console.error('获取部门数据失败:', error);
    ElMessage.error('获取部门数据失败');
  } finally {
    employeesLoading.value = false;
  }
});
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}
</style>