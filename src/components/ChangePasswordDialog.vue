<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改密码"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
    :lock-scroll="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="新密码" prop="password" required>
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入新密码"
          show-password
          clearable
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword" required>
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUsersStatusOrPass } from '@/api/auth'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
})

// Emits
const emit = defineEmits(['update:visible', 'success'])

// 弹窗显示状态
const dialogVisible = ref(props.visible)

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 表单数据
const form = reactive({
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听props变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听弹窗状态变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  form.password = ''
  form.confirmPassword = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
}

// 处理提交
const handleSubmit = async () => {
  try {
    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }

    loading.value = true

    // 调用API
    await updateUsersStatusOrPass({
      password: form.password,

    })

    ElMessage.success('密码修改成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}
</style>